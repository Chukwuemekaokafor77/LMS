import { describe, it, expect, beforeEach } from "vitest";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Tenant Isolation Middleware", () => {
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = new PrismaService();
    // Mock internal client methods to avoid real DB connection
    const client = (prisma as any).client;
    vi.spyOn(client, "$connect").mockResolvedValue(undefined);
    // Mock the actual query execution to return empty results but NOT throw
    vi.spyOn(client, "_executeRequest").mockResolvedValue([]);
  });

  it("should throw when orgId is missing in where clause for PHI models (Staff)", async () => {
    await expect(prisma.staff.findMany({})).rejects.toThrow(
      "Tenant isolation violation: Query on Staff missing 'orgId' in where clause."
    );
  });

  it("should throw when orgId is missing in where clause for PHI models (Assignment)", async () => {
    await expect(prisma.assignment.findMany({})).rejects.toThrow(
      "Tenant isolation violation: Query on Assignment missing 'orgId' in where clause."
    );
  });

  it("should allow query when orgId is present (Assignment)", async () => {
    try {
      await prisma.assignment.findMany({ where: { orgId: "any-org" } });
    } catch (err: any) {
      expect(err.message).not.toContain("Tenant isolation violation");
    }
  });

  it("should not throw for non-PHI models (User)", async () => {
    try {
      await prisma.user.findMany({});
    } catch (err: any) {
      expect(err.message).not.toContain("Tenant isolation violation");
    }
  });
});
