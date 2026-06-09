import { describe, it, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedC2Base } from "./seed-c2";

/**
 * LMS-M3 — proves the global ValidationPipe (whitelist + forbidNonWhitelisted +
 * transform) actually rejects bad input with 400. Every @Body()/@Query() handler
 * is backed by a class-validator DTO (audited — no bare any/inline bodies), so a
 * representative body endpoint and a representative query endpoint cover the
 * unknown-field / wrong-type / missing-required / bad-enum reject paths.
 */
let t: TestApp;
let db: PrismaClient;

beforeAll(async () => {
  db = new PrismaClient();
  t = await setupTestApp();
  await seedC2Base(db); // gives an authed STAFF worker (clerk_c2_worker)
  // A user who is authenticated but not yet Staff — reaches the onboarding pipe.
  await db.user.create({
    data: { clerkUserId: "clerk_rejecter", email: "rejecter@example.com" },
  });
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await db?.$disconnect();
});

describe("LMS-M3 DTO reject-path", () => {
  describe("POST /onboarding/organization (body)", () => {
    const valid = { name: "Valid Org", jurisdiction: "NB", siteName: "HQ" };

    it("rejects an unknown field (400)", () =>
      t.as("clerk_rejecter").post("/onboarding/organization").send({ ...valid, bogus: "x" }).expect(400));

    it("rejects a wrong-typed field (400)", () =>
      t.as("clerk_rejecter").post("/onboarding/organization").send({ ...valid, name: 123 }).expect(400));

    it("rejects a missing required field (400)", () =>
      t.as("clerk_rejecter").post("/onboarding/organization").send({ jurisdiction: "NB", siteName: "HQ" }).expect(400));

    it("rejects an invalid enum value (400)", () =>
      t.as("clerk_rejecter").post("/onboarding/organization").send({ ...valid, jurisdiction: "XX" }).expect(400));

    it("accepts a valid body (sanity — not a 400)", async () => {
      // Confirms the 400s above are the DTO rejecting, not the route. This one
      // succeeds (201) and makes the user Staff, so it runs last.
      await t.as("clerk_rejecter").post("/onboarding/organization").send(valid).expect(201);
    });
  });

  describe("GET /reports/completions (query)", () => {
    it("rejects an unknown query param (400)", () =>
      t.as("clerk_c2_worker").get("/reports/completions?bogus=x").expect(400));

    it("rejects a wrong-typed query param (400)", () =>
      t.as("clerk_c2_worker").get("/reports/completions?from=not-a-date").expect(400));
  });
});
