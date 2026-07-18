import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedC2Base } from "./seed-c2";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";

/**
 * LMS-C2 — extra happy-path coverage for service-layer code the isolation and
 * flow suites don't reach (org onboarding/bootstrap, report CSV/PDF export), so
 * the 60% service-coverage floor reflects real behaviour, not just isolation.
 */
let t: TestApp;
let db: PrismaClient;

beforeAll(async () => {
  db = new PrismaClient();
  t = await setupTestApp();
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await db?.$disconnect();
});

describe("LMS-C2 onboarding", () => {
  beforeEach(async () => {
    await seedC2Base(db);
    // A user who is authenticated but not yet Staff anywhere.
    await db.user.create({
      data: { externalAuthId: "clerk_onboarder", email: "onboarder@example.com", name: "Onboarder" },
    });
  });

  it("creates an org + first ORG_ADMIN staff via the bootstrap flow", async () => {
    const res = await t
      .as("clerk_onboarder")
      .post("/onboarding/organization")
      .send({ name: "Brand New LTC", jurisdiction: "NB", siteName: "Main Pavilion" })
      .expect(201);
    expect(res.body.org.name).toBe("Brand New LTC");

    const org = await db.organization.findFirst({ where: { name: "Brand New LTC" } });
    expect(org).not.toBeNull();
    const staff = await db.staff.findFirst({ where: { orgId: org!.id } });
    expect(staff?.orgPermission).toBe("ORG_ADMIN");
  });

  it("rejects a second org for a user who already belongs to one (409)", async () => {
    await t
      .as("clerk_onboarder")
      .post("/onboarding/organization")
      .send({ name: "First Org", jurisdiction: "NB", siteName: "S1" })
      .expect(201);
    await t
      .as("clerk_onboarder")
      .post("/onboarding/organization")
      .send({ name: "Second Org", jurisdiction: "NB", siteName: "S2" })
      .expect(409);
  });
});

describe("LMS-C2 report export", () => {
  let fx: Fixtures;
  beforeEach(async () => {
    fx = await seedTwoOrgs(db);
  });

  it("exports completions as CSV scoped to the actor's org", async () => {
    const res = await t
      .as(fx.A.admin.externalAuthId)
      .get("/reports/completions/csv")
      .expect(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text).toContain("completed_at"); // header row
    expect(res.text).not.toContain(fx.B.worker.email); // no Org-B data
  });

  it("exports completions as PDF", async () => {
    const res = await t
      .as(fx.A.admin.externalAuthId)
      .get("/reports/completions/pdf")
      .expect(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
  });
});
