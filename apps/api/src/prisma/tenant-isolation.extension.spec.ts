import { describe, it, expect } from "vitest";
import { scopeQueryArgs } from "./tenant-isolation.extension";
import type { TenantContext } from "../tenant/tenant-context";

/**
 * Unit tests for the pure core of the tenant-isolation guardrail (LMS-H1).
 *
 * The real two-org, seeded-database cross-tenant suite lives in LMS-C1; these
 * tests pin the *transform contract* the guardrail depends on: fail-closed with
 * no context, injection under an org actor, passthrough under a system actor,
 * and no scope-widening.
 */
const ORG_A: TenantContext = { kind: "org", orgId: "org_A" };
const ORG_B: TenantContext = { kind: "org", orgId: "org_B" };
const SYSTEM: TenantContext = { kind: "system" };

describe("scopeQueryArgs", () => {
  describe("fail-closed", () => {
    it("throws for a PHI model with no tenant context", () => {
      expect(() => scopeQueryArgs("Staff", "findMany", {}, null)).toThrow(
        /no tenant context/,
      );
    });

    it("throws for every PHI model", () => {
      for (const model of [
        "Staff",
        "Assignment",
        "Attempt",
        "Certificate",
        "RosterImport",
      ]) {
        expect(() => scopeQueryArgs(model, "findFirst", {}, null)).toThrow();
      }
    });
  });

  describe("non-PHI models", () => {
    it("passes through untouched, even with no context", () => {
      const args = { where: { email: "x@y.z" } };
      expect(scopeQueryArgs("User", "findUnique", args, null)).toBe(args);
      expect(scopeQueryArgs("Organization", "findMany", args, null)).toBe(args);
      expect(scopeQueryArgs("AuditEvent", "create", { data: {} }, null)).toEqual(
        { data: {} },
      );
    });
  });

  describe("system actor (explicit cross-org escape)", () => {
    it("passes PHI args through untouched", () => {
      const args = { where: { createdAt: { lt: new Date(0) } } };
      expect(scopeQueryArgs("Certificate", "deleteMany", args, SYSTEM)).toBe(
        args,
      );
    });
  });

  describe("org actor — injection", () => {
    it("injects orgId into a findMany where", () => {
      expect(
        scopeQueryArgs("Staff", "findMany", { where: { siteId: "s1" } }, ORG_A),
      ).toEqual({ where: { siteId: "s1", orgId: "org_A" } });
    });

    it("injects orgId into a findUnique where (extended where unique)", () => {
      expect(
        scopeQueryArgs("Assignment", "findUnique", { where: { id: "a1" } }, ORG_A),
      ).toEqual({ where: { id: "a1", orgId: "org_A" } });
    });

    it("injects orgId into update/delete where", () => {
      expect(
        scopeQueryArgs("Attempt", "update", { where: { id: "x" }, data: { passed: true } }, ORG_A),
      ).toEqual({ where: { id: "x", orgId: "org_A" }, data: { passed: true } });
      expect(
        scopeQueryArgs("RosterImport", "delete", { where: { id: "x" } }, ORG_A),
      ).toEqual({ where: { id: "x", orgId: "org_A" } });
    });

    it("stamps orgId onto create data", () => {
      expect(
        scopeQueryArgs("Assignment", "create", { data: { staffId: "s" } }, ORG_A),
      ).toEqual({ data: { staffId: "s", orgId: "org_A" } });
    });

    it("stamps orgId onto each createMany row", () => {
      expect(
        scopeQueryArgs("Assignment", "createMany", { data: [{ staffId: "s1" }, { staffId: "s2" }] }, ORG_A),
      ).toEqual({ data: [{ staffId: "s1", orgId: "org_A" }, { staffId: "s2", orgId: "org_A" }] });
    });

    it("scopes both the where and the create branch of an upsert", () => {
      expect(
        scopeQueryArgs(
          "Staff",
          "upsert",
          { where: { userId: "u" }, create: { userId: "u" }, update: {} },
          ORG_A,
        ),
      ).toEqual({
        where: { userId: "u", orgId: "org_A" },
        create: { userId: "u", orgId: "org_A" },
        update: {},
      });
    });
  });

  describe("no scope-widening", () => {
    it("overrides a caller-supplied orgId with the context's", () => {
      expect(
        scopeQueryArgs("Staff", "findMany", { where: { orgId: "org_B" } }, ORG_A),
      ).toEqual({ where: { orgId: "org_A" } });
    });

    it("overrides orgId: undefined (the old bypass) with the context's", () => {
      expect(
        scopeQueryArgs("Staff", "findFirst", { where: { orgId: undefined } }, ORG_B),
      ).toEqual({ where: { orgId: "org_B" } });
    });
  });
});
