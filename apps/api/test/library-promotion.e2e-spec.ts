import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";
import { promoteModule } from "../scripts/promote-module";

/**
 * Library promotion workflow (Phase B): a module authored in the HQ org via
 * the authoring UI is promoted to the global library (orgId -> null) so every
 * agency's catalog picks it up; demotion brings it back for editing. Module id
 * never changes, so assignments survive the round-trip.
 */
let t: TestApp;
let fx: Fixtures;
let rawDb: PrismaClient;

beforeAll(async () => {
  rawDb = new PrismaClient();
  fx = await seedTwoOrgs(rawDb);
  t = await setupTestApp();
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await rawDb?.$disconnect();
});

describe("library promotion", () => {
  it("promote makes an org module visible to other orgs; demote hides it again", async () => {
    // Author a module in Org A (the "HQ" role in this scenario) via the API.
    const created = await t
      .as(fx.A.admin.externalAuthId)
      .post("/authoring/modules")
      .send({
        titleEn: "Safe Travel Between Clients",
        titleFr: "Déplacements sécuritaires entre clients",
        descriptionEn: "Winter driving, scheduling, fatigue.",
        descriptionFr: "Conduite hivernale, horaires, fatigue.",
        durationMin: 25,
      })
      .expect(201);
    const moduleId = created.body.id as string;
    await t
      .as(fx.A.admin.externalAuthId)
      .post(`/authoring/modules/${moduleId}/lessons`)
      .send({ titleEn: "Plan the route", titleFr: "Planifier le trajet" })
      .expect(201);
    await t
      .as(fx.A.admin.externalAuthId)
      .patch(`/authoring/modules/${moduleId}`)
      .send({ status: "PUBLISHED" })
      .expect(200);

    // Org B cannot see it while it is org-private to A.
    const before = await t
      .as(fx.B.worker.externalAuthId)
      .get("/modules")
      .expect(200);
    expect(
      (before.body as { id: string }[]).map((m) => m.id),
    ).not.toContain(moduleId);

    // Promote to the library (all jurisdictions).
    const promoted = await promoteModule(rawDb, moduleId, {
      jurisdiction: null,
    });
    expect(promoted.orgId).toBeNull();

    const after = await t
      .as(fx.B.worker.externalAuthId)
      .get("/modules")
      .expect(200);
    expect((after.body as { id: string }[]).map((m) => m.id)).toContain(
      moduleId,
    );
    // And it is no longer editable through the org authoring surface.
    await t
      .as(fx.A.admin.externalAuthId)
      .patch(`/authoring/modules/${moduleId}`)
      .send({ titleEn: "Should not work" })
      .expect(404);

    // Audit trail records the promotion.
    const event = await rawDb.auditEvent.findFirst({
      where: { action: "module.promoted_to_library", entityId: moduleId },
    });
    expect(event).not.toBeNull();

    // Demote back to Org A for editing: hidden from B, editable by A again.
    const demoted = await promoteModule(rawDb, moduleId, {
      demoteToOrgId: fx.A.orgId,
    });
    expect(demoted.orgId).toBe(fx.A.orgId);
    const hidden = await t
      .as(fx.B.worker.externalAuthId)
      .get("/modules")
      .expect(200);
    expect(
      (hidden.body as { id: string }[]).map((m) => m.id),
    ).not.toContain(moduleId);
    await t
      .as(fx.A.admin.externalAuthId)
      .patch(`/authoring/modules/${moduleId}`)
      .send({ titleEn: "Editable again" })
      .expect(200);
  });

  it("guards: promoting a library module or demoting an org module both fail", async () => {
    await expect(
      promoteModule(rawDb, fx.moduleId, { jurisdiction: null }),
    ).rejects.toThrow(/already in the global library/i);
    const orgModule = await rawDb.module.findFirst({
      where: { orgId: fx.A.orgId },
    });
    await expect(
      promoteModule(rawDb, orgModule!.id, { demoteToOrgId: fx.A.orgId }),
    ).rejects.toThrow(/org-owned/i);
    await expect(
      promoteModule(rawDb, "no-such-module", { jurisdiction: null }),
    ).rejects.toThrow(/not found/i);
  });
});
