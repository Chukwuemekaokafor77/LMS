import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedC2Base, type C2Base } from "./seed-c2";
import { CertificateProcessor } from "../src/certificates/certificate.processor";
import { AssignmentsService } from "../src/assignments/assignments.service";
import { MaterializeProcessor } from "../src/required-training/materialize.processor";
import { runWithOrgContext } from "../src/tenant/tenant-context";

/**
 * LMS-C2 — real-DB tests for the core business flows the roadmap targets:
 * certificate-issuance idempotency, attempt scoring (incl. the pass boundary),
 * and required-training materialization (cadence/grace/expiry math). Drives the
 * real processors/services against a live Postgres.
 */
let t: TestApp;
let db: PrismaClient;
let base: C2Base;

const DAY = 86_400_000;
const job = <T>(name: string, data: T) => ({ name, data }) as Job<T>;

beforeAll(async () => {
  db = new PrismaClient();
  t = await setupTestApp();
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await db?.$disconnect();
});

beforeEach(async () => {
  base = await seedC2Base(db);
});

describe("LMS-C2 flows", () => {
  describe("certificate issuance idempotency", () => {
    it("issues exactly one certificate even if the job runs twice", async () => {
      const a = await db.assignment.create({
        data: {
          orgId: base.orgId,
          staffId: base.workerStaffId,
          moduleId: base.moduleId,
          status: "COMPLETED",
          dueAt: new Date(),
          completedAt: new Date(),
        },
      });
      await db.attempt.create({
        data: {
          orgId: base.orgId,
          assignmentId: a.id,
          passed: true,
          scorePct: 100,
          submittedAt: new Date(),
          attestationHash: "hash",
        },
      });

      const proc = t.app.get(CertificateProcessor, { strict: false });
      await proc.process(job("issue", { assignmentId: a.id }));
      await proc.process(job("issue", { assignmentId: a.id }));

      const certs = await db.certificate.findMany({ where: { assignmentId: a.id } });
      expect(certs).toHaveLength(1);
      expect(certs[0].sha256).toBeTruthy();
    });

    it("records a certificate.issued audit event against the actor's User id (LMS-M4)", async () => {
      const a = await db.assignment.create({
        data: {
          orgId: base.orgId,
          staffId: base.workerStaffId,
          moduleId: base.moduleId,
          status: "COMPLETED",
          dueAt: new Date(),
          completedAt: new Date(),
        },
      });
      await db.attempt.create({
        data: {
          orgId: base.orgId,
          assignmentId: a.id,
          passed: true,
          scorePct: 100,
          submittedAt: new Date(),
          attestationHash: "hash",
        },
      });

      await t.app.get(CertificateProcessor, { strict: false }).process(job("issue", { assignmentId: a.id }));

      // Before LMS-M4 this silently failed (actorId was a Staff id, but the FK
      // references User.id) and AuditService swallowed the error → zero rows.
      const event = await db.auditEvent.findFirst({
        where: { action: "certificate.issued" },
      });
      expect(event).not.toBeNull();
      expect(event!.actorId).toBe(base.workerUserId);
    });
  });

  describe("attempt scoring", () => {
    async function freshAttempt() {
      const a = await db.assignment.create({
        data: {
          orgId: base.orgId,
          staffId: base.workerStaffId,
          moduleId: base.moduleId,
          status: "IN_PROGRESS",
          dueAt: new Date(Date.now() + DAY),
        },
      });
      const att = await db.attempt.create({
        data: { orgId: base.orgId, assignmentId: a.id },
      });
      return att.id;
    }

    const submit = (attemptId: string, responses: { questionId: string; selectedIdx: number[] }[]) =>
      runWithOrgContext(base.orgId, () =>
        t.app
          .get(AssignmentsService, { strict: false })
          .submitAttempt({ attemptId, staffId: base.workerStaffId, responses }),
      );

    it("scores all-correct as 100% and passed", async () => {
      const [q0, q1, q2] = base.questionIds;
      const res = await submit(await freshAttempt(), [
        { questionId: q0, selectedIdx: [0] },
        { questionId: q1, selectedIdx: [0, 2] },
        { questionId: q2, selectedIdx: [1] },
      ]);
      expect(res.scorePct).toBe(100);
      expect(res.passed).toBe(true);
    });

    it("treats 2/3 (67%) as exactly the pass boundary", async () => {
      const [q0, q1, q2] = base.questionIds;
      const res = await submit(await freshAttempt(), [
        { questionId: q0, selectedIdx: [0] }, // correct
        { questionId: q1, selectedIdx: [0, 2] }, // correct
        { questionId: q2, selectedIdx: [0] }, // wrong
      ]);
      expect(res.scorePct).toBe(67);
      expect(res.passed).toBe(true); // passMark is 67
    });

    it("fails below the pass mark and only counts exact multi-select matches", async () => {
      const [q0, q1, q2] = base.questionIds;
      const res = await submit(await freshAttempt(), [
        { questionId: q0, selectedIdx: [0] }, // correct
        { questionId: q1, selectedIdx: [0] }, // wrong: partial multi-select
        { questionId: q2, selectedIdx: [0] }, // wrong
      ]);
      expect(res.scorePct).toBe(33);
      expect(res.passed).toBe(false);
    });
  });

  describe("required-training materialization", () => {
    it("creates one assignment per matching staff with correct grace + expiry", async () => {
      const rt = await db.requiredTraining.create({
        data: {
          orgId: base.orgId,
          siteId: base.siteId,
          roleCode: base.roleCode,
          moduleId: base.moduleId,
          cadence: "ANNUAL",
          graceDays: 30,
          jurisdiction: "NB",
        },
      });

      const before = Date.now();
      const proc = t.app.get(MaterializeProcessor, { strict: false });
      await proc.process(job("materialize", { requiredTrainingId: rt.id }));

      const assignments = await db.assignment.findMany({
        where: { requiredTrainingId: rt.id },
      });
      expect(assignments).toHaveLength(1);
      const asg = assignments[0];
      expect(asg.staffId).toBe(base.workerStaffId);
      expect(asg.orgId).toBe(base.orgId);
      // dueAt = now + graceDays
      expect(Math.abs(asg.dueAt.getTime() - (before + 30 * DAY))).toBeLessThan(5 * 60_000);
      // expiresAt = dueAt + cadence (ANNUAL = 365d)
      expect(asg.expiresAt).not.toBeNull();
      expect(asg.expiresAt!.getTime() - asg.dueAt.getTime()).toBe(365 * DAY);
    });

    it("leaves expiresAt null for a ONCE-cadence training", async () => {
      const rt = await db.requiredTraining.create({
        data: {
          orgId: base.orgId,
          siteId: base.siteId,
          roleCode: base.roleCode,
          moduleId: base.moduleId,
          cadence: "ONCE",
          graceDays: 14,
          jurisdiction: "NB",
        },
      });
      const proc = t.app.get(MaterializeProcessor, { strict: false });
      await proc.process(job("materialize", { requiredTrainingId: rt.id }));

      const assignments = await db.assignment.findMany({
        where: { requiredTrainingId: rt.id },
      });
      expect(assignments).toHaveLength(1);
      expect(assignments[0].expiresAt).toBeNull(); // ONCE → no expiry
    });

    it("is idempotent — re-running does not duplicate the assignment (LMS-M5)", async () => {
      const rt = await db.requiredTraining.create({
        data: {
          orgId: base.orgId,
          siteId: base.siteId,
          roleCode: base.roleCode,
          moduleId: base.moduleId,
          cadence: "ANNUAL",
          graceDays: 30,
          jurisdiction: "NB",
        },
      });
      const proc = t.app.get(MaterializeProcessor, { strict: false });
      await proc.process(job("materialize", { requiredTrainingId: rt.id }));
      await proc.process(job("materialize", { requiredTrainingId: rt.id }));

      const assignments = await db.assignment.findMany({
        where: { staffId: base.workerStaffId, requiredTrainingId: rt.id },
      });
      expect(assignments).toHaveLength(1);
    });

    it("re-materializes once the prior assignment has lapsed (EXPIRED)", async () => {
      const rt = await db.requiredTraining.create({
        data: {
          orgId: base.orgId,
          siteId: base.siteId,
          roleCode: base.roleCode,
          moduleId: base.moduleId,
          cadence: "ANNUAL",
          graceDays: 30,
          jurisdiction: "NB",
        },
      });
      const proc = t.app.get(MaterializeProcessor, { strict: false });
      await proc.process(job("materialize", { requiredTrainingId: rt.id }));
      // Lapse the first assignment, then re-run — a renewal is expected.
      await db.assignment.updateMany({
        where: { staffId: base.workerStaffId, requiredTrainingId: rt.id },
        data: { status: "EXPIRED" },
      });
      await proc.process(job("materialize", { requiredTrainingId: rt.id }));

      const assignments = await db.assignment.findMany({
        where: { staffId: base.workerStaffId, requiredTrainingId: rt.id },
      });
      expect(assignments).toHaveLength(2); // lapsed + renewed
    });
  });
});
