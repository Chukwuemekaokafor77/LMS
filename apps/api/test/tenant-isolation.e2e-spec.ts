import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";
import { PrismaService } from "../src/prisma/prisma.service";
import { runAsSystem, runWithOrgContext } from "../src/tenant/tenant-context";

/**
 * LMS-C1 — real two-org cross-tenant isolation suite (the #1 commercial/legal
 * risk). Seeds two complete org graphs (A, B) in a real Postgres, then drives
 * the *real* HTTP stack (tenant-scope middleware → auth guard → controller →
 * service → Prisma guardrail) and asserts that an Org-A actor can never see or
 * mutate Org-B's PHI, and vice-versa.
 *
 * Assertions use direct `.expect(...)` / `await expect().resolves` forms — never
 * an assertion inside a `catch` that could pass vacuously when nothing throws.
 */
let t: TestApp;
let fx: Fixtures;
let rawDb: PrismaClient;

const tok = {
  aAdmin: () => fx.A.admin.externalAuthId,
  aWorker: () => fx.A.worker.externalAuthId,
  bAdmin: () => fx.B.admin.externalAuthId,
  bWorker: () => fx.B.worker.externalAuthId,
};

beforeAll(async () => {
  rawDb = new PrismaClient();
  fx = await seedTwoOrgs(rawDb);
  t = await setupTestApp();
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await rawDb?.$disconnect();
});

describe("LMS-C1 cross-tenant isolation", () => {
  describe("the guardrail itself is load-bearing (non-vacuous proof)", () => {
    it("hides Org-B's staff row from an Org-A context but a system read sees it", async () => {
      const prisma = t.app.get(PrismaService);
      // System read proves the row genuinely exists...
      const asSystem = await runAsSystem(
        async () =>
          await prisma.staff.findUnique({ where: { id: fx.B.worker.staffId } }),
      );
      expect(asSystem?.id).toBe(fx.B.worker.staffId);
      // ...and under Org-A's context the injected orgId filter hides it.
      const asOrgA = await runWithOrgContext(
        fx.A.orgId,
        async () =>
          await prisma.staff.findUnique({ where: { id: fx.B.worker.staffId } }),
      );
      expect(asOrgA).toBeNull();
    });
  });

  describe("auth", () => {
    it("rejects an unauthenticated request (401)", async () => {
      await t.anon().get(`/staff/${fx.A.worker.staffId}`).expect(401);
    });
  });

  describe("GET /staff (admin list)", () => {
    it("returns only the actor's org and never the other org's staff", async () => {
      const res = await t.as(tok.aAdmin()).get("/staff").expect(200);
      const rows = res.body as Array<{ id: string; orgId: string }>;
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every((r) => r.orgId === fx.A.orgId)).toBe(true);
      const ids = rows.map((r) => r.id);
      expect(ids).not.toContain(fx.B.worker.staffId);
      expect(ids).not.toContain(fx.B.admin.staffId);
    });

    it("is symmetric — Org B sees only Org B", async () => {
      const res = await t.as(tok.bAdmin()).get("/staff").expect(200);
      const rows = res.body as Array<{ id: string; orgId: string }>;
      expect(rows.every((r) => r.orgId === fx.B.orgId)).toBe(true);
      expect(rows.map((r) => r.id)).not.toContain(fx.A.worker.staffId);
    });

    it("forbids a non-admin (STAFF) actor (403)", async () => {
      await t.as(tok.aWorker()).get("/staff").expect(403);
    });
  });

  describe("GET /staff/:id", () => {
    it("lets an admin read their own org's staff (200)", async () => {
      await t.as(tok.aAdmin()).get(`/staff/${fx.A.worker.staffId}`).expect(200);
    });

    it("404s when an Org-A admin reads an Org-B staff id", async () => {
      await t.as(tok.aAdmin()).get(`/staff/${fx.B.worker.staffId}`).expect(404);
    });

    it("is symmetric — Org-B admin cannot read an Org-A staff id (404)", async () => {
      await t.as(tok.bAdmin()).get(`/staff/${fx.A.worker.staffId}`).expect(404);
    });
  });

  describe("GET /me/assignments", () => {
    it("returns only the caller's own-org assignments", async () => {
      const res = await t.as(tok.aWorker()).get("/me/assignments").expect(200);
      const rows = res.body as Array<{ id: string; orgId: string }>;
      expect(rows.every((r) => r.orgId === fx.A.orgId)).toBe(true);
      expect(rows.map((r) => r.id)).not.toContain(fx.B.assignmentId);
    });
  });

  describe("GET /assignments/:id", () => {
    it("lets the owner read their assignment (200)", async () => {
      await t.as(tok.aWorker()).get(`/assignments/${fx.A.assignmentId}`).expect(200);
    });

    it("404s when an Org-A worker reads an Org-B assignment id", async () => {
      await t.as(tok.aWorker()).get(`/assignments/${fx.B.assignmentId}`).expect(404);
    });
  });

  describe("GET /certificates/:id/download", () => {
    it("lets the owner download their certificate (200)", async () => {
      const res = await t
        .as(tok.aWorker())
        .get(`/certificates/${fx.A.certificateId}/download`)
        .expect(200);
      expect(res.body.url).toBeTruthy();
    });

    it("404s when an Org-A worker downloads an Org-B certificate", async () => {
      await t
        .as(tok.aWorker())
        .get(`/certificates/${fx.B.certificateId}/download`)
        .expect(404);
    });

    it("404s even for an Org-A admin reading an Org-B certificate", async () => {
      await t
        .as(tok.aAdmin())
        .get(`/certificates/${fx.B.certificateId}/download`)
        .expect(404);
    });
  });

  describe("GET /reports/completions", () => {
    it("returns only the actor's org completions", async () => {
      const res = await t.as(tok.aAdmin()).get("/reports/completions").expect(200);
      const rows = res.body as Array<{ orgId: string; staff: { user: { email: string } } }>;
      expect(rows.every((r) => r.orgId === fx.A.orgId)).toBe(true);
      const emails = rows.map((r) => r.staff.user.email);
      expect(emails).not.toContain(fx.B.worker.email);
    });

    it("forbids a non-admin (403)", async () => {
      await t.as(tok.aWorker()).get("/reports/completions").expect(403);
    });
  });

  describe("GET /roster-imports/:id (admin)", () => {
    it("lets an admin read their own org's import (200)", async () => {
      await t
        .as(tok.aAdmin())
        .get(`/roster-imports/${fx.A.rosterImportId}`)
        .expect(200);
    });

    it("403s when an Org-A admin reads an Org-B import", async () => {
      await t
        .as(tok.aAdmin())
        .get(`/roster-imports/${fx.B.rosterImportId}`)
        .expect(403);
    });
  });

  describe("mutation isolation — POST /assignments/attempts/:id/submit", () => {
    it("404s when an Org-A worker submits against an Org-B attempt", async () => {
      await t
        .as(tok.aWorker())
        .post(`/assignments/attempts/${fx.B.attemptId}/submit`)
        .send({ responses: [] })
        .expect(404);
      // And the Org-B attempt remains untouched (still unsubmitted).
      const attempt = await runAsSystem(
        async () =>
          await t.app
            .get(PrismaService)
            .attempt.findUnique({ where: { id: fx.B.attemptId } }),
      );
      expect(attempt?.submittedAt).toBeNull();
    });
  });

  describe("video playback gate — GET /lessons/:id/playback", () => {
    it("allows a worker enrolled in the module (200)", async () => {
      const res = await t
        .as(tok.aWorker())
        .get(`/lessons/${fx.lessonId}/playback`)
        .expect(200);
      expect(res.body.token).toBe("test-token");
    });

    it("forbids an actor with no assignment to the module (403)", async () => {
      // The Org-A admin has no Assignment to the seeded module.
      await t.as(tok.aAdmin()).get(`/lessons/${fx.lessonId}/playback`).expect(403);
    });
  });
});
