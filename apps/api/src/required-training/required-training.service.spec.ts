import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { RequiredTrainingService } from "./required-training.service";
import type { StaffContext } from "../tenant/tenant.types";

/**
 * RequiredTraining decides which module is mandatory for which role in which
 * province — the regulatory core of the LMS. Its service sat at 12% statement
 * and 0% branch coverage: the e2e suites reference the table when seeding
 * fixtures, so lines 35–123 (every authorisation and validation guard) were
 * never executed by a test.
 *
 * The 60% coverage gate did not catch it because the threshold is a global
 * average across all services. Well-covered neighbours (authoring 95%,
 * integrations 96%, reports 98%) carried the mean, and a service near zero
 * passed behind them. vitest.config.ts now sets a perFile threshold so a
 * single untested service fails on its own.
 *
 * These are unit tests with mocked Prisma/audit/queue: the branches here are
 * pure authorisation logic, and asserting them directly is both faster and
 * more exhaustive than reaching them through HTTP. Tenant isolation at the
 * query layer is proven separately in test/tenant-isolation.e2e-spec.ts.
 */

const ctx = (over: Partial<StaffContext> = {}): StaffContext => ({
  staffId: "staff-1",
  userId: "user-1",
  orgId: "org-1",
  siteId: null,
  orgPermission: "ORG_ADMIN",
  roleCode: "PSW",
  jurisdiction: "NB",
  ...over,
});

describe("RequiredTrainingService", () => {
  let service: RequiredTrainingService;
  let prisma: any;
  let audit: any;
  let materializeQ: any;

  beforeEach(() => {
    prisma = {
      requiredTraining: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue({ id: "rt-1" }),
        delete: vi.fn().mockResolvedValue({ id: "rt-1" }),
      },
      role: { findUnique: vi.fn() },
      module: { findUnique: vi.fn() },
      site: { findUnique: vi.fn() },
    };
    audit = { record: vi.fn() };
    materializeQ = { add: vi.fn() };
    service = new RequiredTrainingService(
      prisma as any,
      audit as any,
      materializeQ as any,
    );
  });

  describe("list", () => {
    it("refuses ordinary staff", async () => {
      await expect(service.list(ctx({ orgPermission: "STAFF" }))).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.requiredTraining.findMany).not.toHaveBeenCalled();
    });

    it("scopes a site admin to their own site plus org-wide rows", async () => {
      await service.list(
        ctx({ orgPermission: "SITE_ADMIN", siteId: "site-9" }),
      );
      const where = prisma.requiredTraining.findMany.mock.calls[0][0].where;
      expect(where.orgId).toBe("org-1");
      // siteId: null rows are org-wide requirements and must stay visible —
      // dropping them would hide mandatory training from a site admin.
      expect(where.OR).toEqual([{ siteId: "site-9" }, { siteId: null }]);
    });

    it("does not narrow an org admin to a site", async () => {
      await service.list(ctx({ orgPermission: "ORG_ADMIN", siteId: "site-9" }));
      const where = prisma.requiredTraining.findMany.mock.calls[0][0].where;
      expect(where.OR).toBeUndefined();
    });

    it("does not narrow a site admin who has no site assigned", async () => {
      await service.list(ctx({ orgPermission: "SITE_ADMIN", siteId: null }));
      const where = prisma.requiredTraining.findMany.mock.calls[0][0].where;
      expect(where.OR).toBeUndefined();
    });

    it("always scopes to the actor's org", async () => {
      await service.list(ctx({ orgId: "org-42" }));
      expect(prisma.requiredTraining.findMany.mock.calls[0][0].where.orgId).toBe(
        "org-42",
      );
    });
  });

  describe("create", () => {
    const input = {
      roleCode: "PSW",
      moduleId: "mod-1",
      cadence: "ANNUAL" as const,
    };

    const allowAll = () => {
      prisma.role.findUnique.mockResolvedValue({
        code: "PSW",
        jurisdiction: "NB",
      });
      prisma.module.findUnique.mockResolvedValue({
        id: "mod-1",
        status: "PUBLISHED",
        orgId: null,
      });
    };

    it.each([["SITE_ADMIN"], ["STAFF"]])(
      "refuses %s — only an org admin sets mandatory training",
      async (perm) => {
        await expect(
          service.create(ctx({ orgPermission: perm as any }), input),
        ).rejects.toThrow(ForbiddenException);
        expect(prisma.requiredTraining.create).not.toHaveBeenCalled();
      },
    );

    it("rejects an unknown role", async () => {
      prisma.role.findUnique.mockResolvedValue(null);
      await expect(service.create(ctx(), input)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("rejects a role from another jurisdiction", async () => {
      // An NS role requirement attached to an NB org would assert compliance
      // with the wrong province's rules.
      prisma.role.findUnique.mockResolvedValue({
        code: "PSW",
        jurisdiction: "NS",
      });
      await expect(
        service.create(ctx({ jurisdiction: "NB" }), input),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects an unknown module", async () => {
      prisma.role.findUnique.mockResolvedValue({
        code: "PSW",
        jurisdiction: "NB",
      });
      prisma.module.findUnique.mockResolvedValue(null);
      await expect(service.create(ctx(), input)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("rejects an unpublished module", async () => {
      prisma.role.findUnique.mockResolvedValue({
        code: "PSW",
        jurisdiction: "NB",
      });
      prisma.module.findUnique.mockResolvedValue({
        id: "mod-1",
        status: "DRAFT",
        orgId: null,
      });
      await expect(service.create(ctx(), input)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("rejects a module owned by another org", async () => {
      prisma.role.findUnique.mockResolvedValue({
        code: "PSW",
        jurisdiction: "NB",
      });
      prisma.module.findUnique.mockResolvedValue({
        id: "mod-1",
        status: "PUBLISHED",
        orgId: "org-2",
      });
      await expect(service.create(ctx({ orgId: "org-1" }), input)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("accepts a shared library module (orgId null)", async () => {
      allowAll();
      await expect(service.create(ctx(), input)).resolves.toEqual({ id: "rt-1" });
    });

    it("rejects an unknown site", async () => {
      allowAll();
      prisma.site.findUnique.mockResolvedValue(null);
      await expect(
        service.create(ctx(), { ...input, siteId: "site-x" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects a site belonging to another org", async () => {
      allowAll();
      prisma.site.findUnique.mockResolvedValue({ id: "site-x", orgId: "org-2" });
      await expect(
        service.create(ctx({ orgId: "org-1" }), { ...input, siteId: "site-x" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("defaults graceDays to 30 and siteId to null", async () => {
      allowAll();
      await service.create(ctx(), input);
      expect(prisma.requiredTraining.create.mock.calls[0][0].data).toMatchObject({
        orgId: "org-1",
        siteId: null,
        roleCode: "PSW",
        moduleId: "mod-1",
        cadence: "ANNUAL",
        graceDays: 30,
        jurisdiction: "NB",
      });
    });

    it("honours an explicit graceDays of 0 rather than falling back to 30", async () => {
      // `??` is correct here and `||` would not be: 0 is a legitimate grace
      // period meaning "due immediately, no slack".
      allowAll();
      await service.create(ctx(), { ...input, graceDays: 0 });
      expect(prisma.requiredTraining.create.mock.calls[0][0].data.graceDays).toBe(0);
    });

    it("records an audit event and queues materialization", async () => {
      allowAll();
      await service.create(ctx(), input);
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "user-1",
          orgId: "org-1",
          action: "required_training.created",
          entityType: "RequiredTraining",
          entityId: "rt-1",
        }),
      );
      // Without this the requirement exists but no staff member is ever
      // assigned the training it mandates.
      expect(materializeQ.add).toHaveBeenCalledWith("materialize", {
        requiredTrainingId: "rt-1",
      });
    });
  });

  describe("remove", () => {
    it.each([["SITE_ADMIN"], ["STAFF"]])("refuses %s", async (perm) => {
      await expect(
        service.remove(ctx({ orgPermission: perm as any }), "rt-1"),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.requiredTraining.delete).not.toHaveBeenCalled();
    });

    it("404s on a missing requirement", async () => {
      prisma.requiredTraining.findUnique.mockResolvedValue(null);
      await expect(service.remove(ctx(), "rt-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("404s rather than 403s on another org's requirement", async () => {
      // Not found, not forbidden — a 403 would confirm the id exists to a
      // caller in a different tenant.
      prisma.requiredTraining.findUnique.mockResolvedValue({
        id: "rt-1",
        orgId: "org-2",
      });
      await expect(service.remove(ctx({ orgId: "org-1" }), "rt-1")).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.requiredTraining.delete).not.toHaveBeenCalled();
    });

    it("deletes and audits its own org's requirement", async () => {
      prisma.requiredTraining.findUnique.mockResolvedValue({
        id: "rt-1",
        orgId: "org-1",
      });
      await expect(service.remove(ctx(), "rt-1")).resolves.toEqual({ ok: true });
      expect(prisma.requiredTraining.delete).toHaveBeenCalledWith({
        where: { id: "rt-1" },
      });
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "required_training.deleted",
          entityId: "rt-1",
        }),
      );
    });
  });
});
