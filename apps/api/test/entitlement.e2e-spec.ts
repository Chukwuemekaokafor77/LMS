import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { drainQueues } from "./drain-queues";

/**
 * Entitlement webhook + mid-session enforcement (Phase-D follow-up). Drives the
 * real HTTP stack: the ElderCare → Academy webhook (HMAC service auth) updates
 * the local `Entitlement`, and the auth guard blocks the org's live sessions
 * the moment the subscription lapses — closing the window SSO's login-time gate
 * leaves open.
 */
let t: TestApp;
let db: PrismaClient;
let SECRET: string;

const EXT_ORG = "ec_org_ent";
const WORKER = "ec_worker_ent";

function sign(body: string, tsSec = Math.floor(Date.now() / 1000)) {
  const ts = String(tsSec);
  const signature = createHmac("sha256", SECRET).update(`${ts}.${body}`).digest("hex");
  return { ts, signature };
}

function postWebhook(payload: object, opts: { ts?: number; signature?: string } = {}) {
  const body = JSON.stringify(payload);
  const signed = sign(body, opts.ts);
  return t
    .anon()
    .post("/webhooks/eldercare/entitlement")
    .set("Content-Type", "application/json")
    .set("x-academy-timestamp", String(opts.ts ?? signed.ts))
    .set("x-academy-signature", opts.signature ?? signed.signature)
    .send(body);
}

async function seedActiveOrg() {
  const org = await db.organization.create({
    data: { externalOrgId: EXT_ORG, name: "Rivière Home Care", jurisdiction: "NB" },
  });
  await db.entitlement.create({ data: { orgId: org.id, status: "active", seats: 10 } });
  await db.role.upsert({
    where: { code: "NB_HSW" },
    create: { code: "NB_HSW", labelEn: "Home Support Worker", labelFr: "Aide en soutien à domicile", jurisdiction: "NB" },
    update: {},
  });
  const user = await db.user.create({
    data: { externalAuthId: WORKER, email: "worker@example.com", name: "Worker" },
  });
  await db.staff.create({
    data: {
      userId: user.id,
      orgId: org.id,
      roleCode: "NB_HSW",
      orgPermission: "STAFF",
      startedAt: new Date(),
    },
  });
  return org;
}

beforeAll(async () => {
  db = new PrismaClient();
  t = await setupTestApp();
  SECRET = process.env.ACADEMY_EXCHANGE_SECRET!;
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await db?.$disconnect();
});

beforeEach(async () => {
  await drainQueues();
  await db.recordAccessLog.deleteMany({});
  await db.auditEvent.deleteMany({});
  await db.staff.deleteMany({});
  await db.entitlement.deleteMany({});
  await db.user.deleteMany({});
  await db.site.deleteMany({});
  await db.organization.deleteMany({});
  await db.role.deleteMany({});
});

describe("entitlement webhook — auth", () => {
  it("rejects a bad signature, missing headers, and a stale timestamp (401)", async () => {
    await seedActiveOrg();
    const payload = { external_org_id: EXT_ORG, status: "canceled" };

    await postWebhook(payload, { signature: "deadbeef" }).expect(401);

    await t
      .anon()
      .post("/webhooks/eldercare/entitlement")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(payload))
      .expect(401);

    // Timestamp older than the tolerance window, but correctly signed for it.
    const staleTs = Math.floor(Date.now() / 1000) - 3600;
    await postWebhook(payload, { ts: staleTs }).expect(401);

    // None of the rejected calls changed the entitlement.
    const org = await db.organization.findUniqueOrThrow({ where: { externalOrgId: EXT_ORG } });
    const ent = await db.entitlement.findUniqueOrThrow({ where: { orgId: org.id } });
    expect(ent.status).toBe("active");
  });
});

describe("entitlement webhook — apply", () => {
  it("updates the local entitlement on a valid, signed lapse", async () => {
    const org = await seedActiveOrg();
    const res = await postWebhook({
      external_org_id: EXT_ORG,
      status: "canceled",
      seats: 0,
      event_id: "evt-1",
      event_at: new Date().toISOString(),
    }).expect(200);
    expect(res.body).toMatchObject({ ok: true, applied: true, status: "canceled" });

    const ent = await db.entitlement.findUniqueOrThrow({ where: { orgId: org.id } });
    expect(ent.status).toBe("canceled");
    expect(ent.seats).toBe(0);

    const audit = await db.auditEvent.findFirst({
      where: { action: "entitlement.updated", entityId: org.id },
    });
    expect(audit).not.toBeNull();
  });

  it("accepts (no-op) an unknown org so ElderCare doesn't retry forever", async () => {
    const res = await postWebhook({ external_org_id: "never-seen", status: "canceled" }).expect(200);
    expect(res.body).toMatchObject({ ok: true, applied: false, reason: "unknown_org" });
  });

  it("is idempotent on event_id and drops stale out-of-order events", async () => {
    const org = await seedActiveOrg();
    const t0 = new Date();
    const t1 = new Date(t0.getTime() + 60_000);

    await postWebhook({ external_org_id: EXT_ORG, status: "canceled", event_id: "evt-A", event_at: t1.toISOString() }).expect(200);

    // Same event id replayed with a different status → ignored.
    const dup = await postWebhook({ external_org_id: EXT_ORG, status: "active", event_id: "evt-A", event_at: t1.toISOString() }).expect(200);
    expect(dup.body).toMatchObject({ applied: false, reason: "duplicate" });

    // Older event (t0 < t1) → ignored as stale.
    const stale = await postWebhook({ external_org_id: EXT_ORG, status: "active", event_id: "evt-B", event_at: t0.toISOString() }).expect(200);
    expect(stale.body).toMatchObject({ applied: false, reason: "stale" });

    const ent = await db.entitlement.findUniqueOrThrow({ where: { orgId: org.id } });
    expect(ent.status).toBe("canceled");
  });

  it("400s an invalid payload", async () => {
    await seedActiveOrg();
    await postWebhook({ status: "canceled" }).expect(400); // missing external_org_id
  });
});

describe("mid-session enforcement", () => {
  it("blocks the org's live session on lapse and restores it on reactivation", async () => {
    await seedActiveOrg();

    // Active → the seeded worker's session works.
    await t.as(WORKER).get("/me").expect(200);

    // Lapse arrives mid-session.
    await postWebhook({ external_org_id: EXT_ORG, status: "canceled", event_id: "lapse-1", event_at: new Date().toISOString() }).expect(200);
    await t.as(WORKER).get("/me").expect(403);

    // Reactivation restores access without re-login.
    await postWebhook({ external_org_id: EXT_ORG, status: "active", event_id: "reactivate-1", event_at: new Date(Date.now() + 1000).toISOString() }).expect(200);
    await t.as(WORKER).get("/me").expect(200);
  });

  it("does not block an org that has no entitlement row (pre-feature / never fed)", async () => {
    const org = await seedActiveOrg();
    await db.entitlement.deleteMany({ where: { orgId: org.id } });
    await t.as(WORKER).get("/me").expect(200);
  });
});
