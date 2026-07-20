import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedC2Base, type C2Base } from "./seed-c2";
import { CredentialFlowbackProcessor } from "../src/integrations/credential-flowback.processor";
import {
  EldercareFlowbackClient,
  type CertificateFlowbackPayload,
} from "../src/integrations/eldercare-flowback.client";
import { drainQueues } from "./drain-queues";

/**
 * Seam 3 — the LMS side of certificate flow-back. Drives the real processor
 * against a seeded certificate with ElderCare's HTTP client stubbed, proving
 * the Academy Certificate → ElderCare payload mapping, the audit record, and
 * the not-configured skip path.
 */
let t: TestApp;
let db: PrismaClient;
let base: C2Base;

const sent: CertificateFlowbackPayload[] = [];
let configured = true;

const clientStub = {
  isConfigured: () => configured,
  sendCertificate: async (p: CertificateFlowbackPayload) => {
    sent.push(p);
  },
};

const job = <T>(name: string, data: T) => ({ name, data }) as Job<T>;

beforeAll(async () => {
  db = new PrismaClient();
  t = await setupTestApp({
    overrides: [{ provide: EldercareFlowbackClient, useValue: clientStub }],
  });
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await db?.$disconnect();
});

beforeEach(async () => {
  await drainQueues();
  sent.length = 0;
  configured = true;
  base = await seedC2Base(db);
  // seed-c2's worker user needs an externalAuthId (the ElderCare user id).
  await db.user.update({
    where: { id: base.workerUserId },
    data: { externalAuthId: "ec_user_flowback" },
  });
});

async function seedCertificate(): Promise<string> {
  const assignment = await db.assignment.create({
    data: {
      orgId: base.orgId,
      staffId: base.workerStaffId,
      moduleId: base.moduleId,
      status: "COMPLETED",
      dueAt: new Date(),
      completedAt: new Date(),
    },
  });
  const cert = await db.certificate.create({
    data: {
      orgId: base.orgId,
      assignmentId: assignment.id,
      pdfS3Key: `certificates/${base.orgId}/${assignment.id}.pdf`,
      sha256: "sha-flowback",
      expiresAt: new Date("2027-07-20T00:00:00Z"),
    },
  });
  return cert.id;
}

describe("credential flow-back (Seam 3)", () => {
  it("maps the certificate to the ElderCare payload and records an audit event", async () => {
    const certId = await seedCertificate();
    const proc = t.app.get(CredentialFlowbackProcessor, { strict: false });
    await proc.process(job("deliver", { certificateId: certId }));

    expect(sent).toHaveLength(1);
    const p = sent[0];
    expect(p.external_user_id).toBe("ec_user_flowback");
    expect(p.certificate_id).toBe(certId);
    expect(p.module_title).toBeTruthy();
    expect(p.sha256).toBe("sha-flowback");
    expect(p.expires_at).toBe("2027-07-20T00:00:00.000Z");

    const event = await db.auditEvent.findFirst({
      where: { action: "certificate.flowback_delivered", entityId: certId },
    });
    expect(event).not.toBeNull();
    expect(event!.actorId).toBe(base.workerUserId);
  });

  it("skips (no send, no audit) when ElderCare is not configured", async () => {
    const certId = await seedCertificate();
    configured = false;
    const proc = t.app.get(CredentialFlowbackProcessor, { strict: false });
    await proc.process(job("deliver", { certificateId: certId }));

    expect(sent).toHaveLength(0);
    const event = await db.auditEvent.findFirst({
      where: { action: "certificate.flowback_delivered" },
    });
    expect(event).toBeNull();
  });
});
