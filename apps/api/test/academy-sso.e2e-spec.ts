import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { setupTestApp, type TestApp } from "./harness";
import { AcademyExchangeClient, type EldercareClaims } from "../src/auth/academy/academy-exchange.client";
import { AcademySessionService } from "../src/auth/academy/academy-session.service";
import { drainQueues } from "./drain-queues";

/**
 * Academy SSO handoff (Seam 1 + 2) end-to-end over the real HTTP stack, with
 * only ElderCare's exchange endpoint stubbed. Proves: JIT provisioning of
 * Organization/Site/User/Staff from claims, the Seam-2a role mapping
 * (incl. the NS→CCA rule), the entitlement gate, and that the minted session
 * token authenticates against the real guard (dual-stack composite provider).
 */
let t: TestApp;
let db: PrismaClient;

// Mutable so each test sets the claims the stub returns for its token.
const nextClaims = new Map<string, EldercareClaims>();

const exchangeStub = {
  exchange: async (token: string): Promise<EldercareClaims> => {
    const c = nextClaims.get(token);
    if (!c) throw new Error("no such handoff token");
    return c;
  },
};

function claims(over: Partial<EldercareClaims> = {}): EldercareClaims {
  return {
    sub: "ec_user_1",
    email: "Nadia.Hache@example.com",
    name: "Nadia Hache",
    locale: "fr",
    org: { id: "ec_org_1", name: "Rivière-du-Nord Home Care", province: "NB" },
    facility: { id: "ec_fac_1", name: "Moncton Branch" },
    role: "psw",
    entitlement: { status: "active", tier: "pro", seats: 25 },
    ...over,
  };
}

beforeAll(async () => {
  db = new PrismaClient();
  t = await setupTestApp({
    // Real AcademyIdentityProvider so the minted session token authenticates
    // through the guard; only ElderCare's exchange endpoint is stubbed.
    stubIdentity: false,
    overrides: [{ provide: AcademyExchangeClient, useValue: exchangeStub }],
  });
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await db?.$disconnect();
});

beforeEach(async () => {
  await drainQueues();
  await db.recordAccessLog.deleteMany({});
  await db.auditEvent.deleteMany({});
  await db.lessonProgress.deleteMany({});
  await db.invitation.deleteMany({});
  await db.certificate.deleteMany({});
  await db.attempt.deleteMany({});
  await db.assignment.deleteMany({});
  await db.rosterImport.deleteMany({});
  await db.question.deleteMany({});
  await db.quiz.deleteMany({});
  await db.lesson.deleteMany({});
  await db.requiredTraining.deleteMany({});
  await db.staff.deleteMany({});
  await db.site.deleteMany({});
  await db.module.deleteMany({});
  await db.user.deleteMany({});
  await db.organization.deleteMany({});
  await db.role.deleteMany({});
  nextClaims.clear();
});

describe("Academy SSO handoff", () => {
  it("JIT-provisions org/site/user/staff and mints a session that authenticates", async () => {
    nextClaims.set("tok-nb-psw", claims());
    const res = await t
      .anon()
      .post("/auth/sso")
      .send({ token: "tok-nb-psw" })
      .expect(201);
    expect(res.body.expiresIn).toBe(8 * 60 * 60);
    const sessionToken = res.body.sessionToken as string;

    const org = await db.organization.findUnique({
      where: { externalOrgId: "ec_org_1" },
    });
    expect(org?.jurisdiction).toBe("NB");
    const site = await db.site.findUnique({
      where: { externalFacilityId: "ec_fac_1" },
    });
    expect(site?.orgId).toBe(org!.id);
    const user = await db.user.findUnique({
      where: { externalAuthId: "ec_user_1" },
    });
    expect(user?.email).toBe("nadia.hache@example.com");
    expect(user?.preferredLocale).toBe("fr-CA");
    const staff = await db.staff.findUnique({ where: { userId: user!.id } });
    expect(staff?.roleCode).toBe("NB_HSW");
    expect(staff?.orgPermission).toBe("STAFF");
    expect(staff?.siteId).toBe(site!.id);

    // The minted session verifies and authenticates against the real guard.
    const decoded = t.app.get(AcademySessionService).verify(sessionToken);
    expect(decoded.externalAuthId).toBe("ec_user_1");
    const meRes = await request(t.app.getHttpServer())
      .get("/me")
      .set("Authorization", `Bearer ${sessionToken}`)
      .expect(200);
    expect(meRes.body.staff.roleCode).toBe("NB_HSW");
  });

  it("maps a Nova Scotia home-support worker to the CCA role", async () => {
    nextClaims.set("tok-ns", claims({
      sub: "ec_user_ns",
      org: { id: "ec_org_ns", name: "Halifax Care", province: "Nova Scotia" },
      facility: null,
      role: "psw",
    }));
    await t.anon().post("/auth/sso").send({ token: "tok-ns" }).expect(201);
    const user = await db.user.findUnique({
      where: { externalAuthId: "ec_user_ns" },
    });
    const staff = await db.staff.findUnique({ where: { userId: user!.id } });
    expect(staff?.roleCode).toBe("NS_CCA");
    const role = await db.role.findUnique({ where: { code: "NS_CCA" } });
    expect(role?.labelEn).toBe("Continuing Care Assistant");
  });

  it("maps a manager to ORG_ADMIN and a coordinator to SITE_ADMIN", async () => {
    nextClaims.set("tok-mgr", claims({
      sub: "ec_mgr",
      email: "boss@example.com",
      org: { id: "ec_org_2", name: "PEI Care", province: "PE" },
      facility: null,
      role: "director_of_care",
    }));
    await t.anon().post("/auth/sso").send({ token: "tok-mgr" }).expect(201);
    const mgr = await db.user.findUnique({ where: { externalAuthId: "ec_mgr" } });
    const mgrStaff = await db.staff.findUnique({ where: { userId: mgr!.id } });
    expect(mgrStaff?.roleCode).toBe("PE_MGMT");
    expect(mgrStaff?.orgPermission).toBe("ORG_ADMIN");

    nextClaims.set("tok-coord", claims({
      sub: "ec_coord",
      email: "coord@example.com",
      org: { id: "ec_org_2", name: "PEI Care", province: "PE" },
      facility: null,
      role: "care_coordinator",
    }));
    await t.anon().post("/auth/sso").send({ token: "tok-coord" }).expect(201);
    const coord = await db.user.findUnique({ where: { externalAuthId: "ec_coord" } });
    const coordStaff = await db.staff.findUnique({ where: { userId: coord!.id } });
    expect(coordStaff?.orgPermission).toBe("SITE_ADMIN");
  });

  it("rejects a lapsed entitlement (403), a no-seat role (403), and an unsupported province (400)", async () => {
    nextClaims.set("tok-lapsed", claims({ sub: "l", entitlement: { status: "canceled", tier: "trial", seats: 0 } }));
    await t.anon().post("/auth/sso").send({ token: "tok-lapsed" }).expect(403);

    nextClaims.set("tok-family", claims({ sub: "f", role: "family" }));
    await t.anon().post("/auth/sso").send({ token: "tok-family" }).expect(403);

    nextClaims.set("tok-qc", claims({ sub: "q", org: { id: "o", name: "QC", province: "QC" } }));
    await t.anon().post("/auth/sso").send({ token: "tok-qc" }).expect(400);

    expect(await db.user.count()).toBe(0);
  });

  it("re-signin updates role/site from ElderCare (system of record); a bad token is 400", async () => {
    nextClaims.set("tok-a", claims({ role: "psw" }));
    await t.anon().post("/auth/sso").send({ token: "tok-a" }).expect(201);

    // Promotion in ElderCare → reflected on next sign-in.
    nextClaims.set("tok-b", claims({ role: "director_of_care", facility: null }));
    await t.anon().post("/auth/sso").send({ token: "tok-b" }).expect(201);
    const user = await db.user.findUnique({ where: { externalAuthId: "ec_user_1" } });
    const staff = await db.staff.findUnique({ where: { userId: user!.id } });
    expect(staff?.roleCode).toBe("NB_MGMT");
    expect(staff?.orgPermission).toBe("ORG_ADMIN");
    expect(await db.staff.count()).toBe(1); // updated, not duplicated

    await t.anon().post("/auth/sso").send({ token: "unknown-token" }).expect(400);
  });
});
