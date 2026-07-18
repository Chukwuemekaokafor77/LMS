import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";
import { QUEUES } from "../src/queue/queue.module";

/**
 * LMS-native invitations (LMS-M6 step 3) — replaces Clerk invitations + the
 * webhook publicMetadata materialization. Covers the whole lifecycle over the
 * real HTTP stack: invite (org-scoped, emails a one-time token) → accept
 * (email-bound, single-use, creates the Staff row) → revoke; plus the
 * cross-tenant boundaries for the new PHI model.
 *
 * The raw token never appears in an API response — tests recover it from the
 * enqueued email job's payload, which doubles as proof the email was queued.
 */
let t: TestApp;
let fx: Fixtures;
let rawDb: PrismaClient;
let emailQ: Queue;

const INVITEE_EMAIL = "new.hire@example.com";

async function tokenForInvitation(invitationId: string): Promise<string> {
  const jobs = await emailQ.getJobs([
    "waiting",
    "delayed",
    "active",
    "completed",
    "failed",
  ]);
  const job = jobs.find(
    (j) =>
      j?.name === "staff.invited" && j.data?.invitationId === invitationId,
  );
  expect(job, "staff.invited email job should be enqueued").toBeTruthy();
  return job!.data.token as string;
}

/** Seed a signed-in (but staff-less) user the harness guard can resolve. */
async function seedInvitee(email: string, externalAuthId: string) {
  return rawDb.user.create({ data: { email, externalAuthId } });
}

beforeAll(async () => {
  rawDb = new PrismaClient();
  fx = await seedTwoOrgs(rawDb);
  t = await setupTestApp();
  emailQ = new Queue(QUEUES.email, {
    connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },
  });
}, 60_000);

afterAll(async () => {
  await emailQ?.close();
  await t?.app.close();
  await rawDb?.$disconnect();
});

describe("LMS-native invitations", () => {
  it("full lifecycle: invite → accept (email-bound, single-use) → staff materialized", async () => {
    const invite = await t
      .as(fx.A.admin.externalAuthId)
      .post("/staff/invitations")
      .send({ email: INVITEE_EMAIL, roleCode: "NB_PCW" })
      .expect(201);
    expect(invite.body.status).toBe("pending");

    // Raw token is not in the response and only its hash is stored.
    expect(JSON.stringify(invite.body)).not.toContain("token");
    const row = await rawDb.invitation.findUnique({
      where: { id: invite.body.id },
    });
    expect(row?.orgId).toBe(fx.A.orgId);
    const token = await tokenForInvitation(invite.body.id);
    expect(row?.tokenHash).not.toBe(token);

    // Wrong signed-in email → 403, nothing materialized.
    await seedInvitee("someone.else@example.com", "clerk_wrong_email");
    await t
      .as("clerk_wrong_email")
      .post("/onboarding/accept-invitation")
      .send({ token })
      .expect(403);

    // Right email → staff created in Org A with the invited role.
    const invitee = await seedInvitee(INVITEE_EMAIL, "clerk_new_hire");
    await t
      .as("clerk_new_hire")
      .post("/onboarding/accept-invitation")
      .send({ token })
      .expect(201);
    const staff = await rawDb.staff.findUnique({
      where: { userId: invitee.id },
    });
    expect(staff?.orgId).toBe(fx.A.orgId);
    expect(staff?.roleCode).toBe("NB_PCW");
    expect(staff?.orgPermission).toBe("STAFF");

    const accepted = await rawDb.invitation.findUnique({
      where: { id: invite.body.id },
    });
    expect(accepted?.acceptedAt).not.toBeNull();

    // Single-use: replaying the token fails ("already accepted" — checked
    // before the already-staff conflict).
    await t
      .as("clerk_new_hire")
      .post("/onboarding/accept-invitation")
      .send({ token })
      .expect(400);
  });

  it("expired invitations cannot be accepted", async () => {
    const invite = await t
      .as(fx.A.admin.externalAuthId)
      .post("/staff/invitations")
      .send({ email: "late.hire@example.com", roleCode: "NB_PCW" })
      .expect(201);
    const token = await tokenForInvitation(invite.body.id);
    await rawDb.invitation.update({
      where: { id: invite.body.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await seedInvitee("late.hire@example.com", "clerk_late_hire");
    const res = await t
      .as("clerk_late_hire")
      .post("/onboarding/accept-invitation")
      .send({ token });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  it("revoked invitations cannot be accepted, and a re-invite supersedes the old token", async () => {
    const first = await t
      .as(fx.A.admin.externalAuthId)
      .post("/staff/invitations")
      .send({ email: "rehire@example.com", roleCode: "NB_PCW" })
      .expect(201);
    const firstToken = await tokenForInvitation(first.body.id);

    // Re-inviting the same email revokes the first invitation.
    const second = await t
      .as(fx.A.admin.externalAuthId)
      .post("/staff/invitations")
      .send({ email: "rehire@example.com", roleCode: "NB_PCW" })
      .expect(201);
    const superseded = await rawDb.invitation.findUnique({
      where: { id: first.body.id },
    });
    expect(superseded?.revokedAt).not.toBeNull();

    await seedInvitee("rehire@example.com", "clerk_rehire");
    await t
      .as("clerk_rehire")
      .post("/onboarding/accept-invitation")
      .send({ token: firstToken })
      .expect(404); // superseded token is dead

    // Explicit revoke of the live one → also dead.
    await t
      .as(fx.A.admin.externalAuthId)
      .delete(`/staff/invitations/${second.body.id}`)
      .expect(200);
    const secondToken = await tokenForInvitation(second.body.id);
    await t
      .as("clerk_rehire")
      .post("/onboarding/accept-invitation")
      .send({ token: secondToken })
      .expect(404);
  });

  it("cross-tenant: Org-B admins cannot see or revoke Org-A invitations", async () => {
    const invite = await t
      .as(fx.A.admin.externalAuthId)
      .post("/staff/invitations")
      .send({ email: "a.only@example.com", roleCode: "NB_PCW" })
      .expect(201);

    const bList = await t
      .as(fx.B.admin.externalAuthId)
      .get("/staff/invitations")
      .expect(200);
    expect(
      (bList.body as { id: string }[]).map((i) => i.id),
    ).not.toContain(invite.body.id);

    await t
      .as(fx.B.admin.externalAuthId)
      .delete(`/staff/invitations/${invite.body.id}`)
      .expect(404);

    const aList = await t
      .as(fx.A.admin.externalAuthId)
      .get("/staff/invitations")
      .expect(200);
    expect((aList.body as { id: string }[]).map((i) => i.id)).toContain(
      invite.body.id,
    );
  });

  it("workers cannot invite or list invitations", async () => {
    await t
      .as(fx.A.worker.externalAuthId)
      .post("/staff/invitations")
      .send({ email: "x@example.com", roleCode: "NB_PCW" })
      .expect(403);
    await t
      .as(fx.A.worker.externalAuthId)
      .get("/staff/invitations")
      .expect(403);
  });
});
