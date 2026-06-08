import { describe, it, expect, vi, beforeEach } from "vitest";
import { CertificateProcessor } from "./certificate.processor";

describe("CertificateProcessor Idempotency", () => {
  let processor: CertificateProcessor;
  let prisma: any;
  let s3: any;
  let audit: any;
  let emailQ: any;

  beforeEach(() => {
    prisma = {
      assignment: {
        findUnique: vi.fn(),
      },
      certificate: {
        create: vi.fn(),
      },
    };
    s3 = { putObject: vi.fn() };
    audit = { record: vi.fn() };
    emailQ = { add: vi.fn() };

    processor = new CertificateProcessor(prisma as any, s3 as any, audit as any, emailQ as any);
    // Mock the renderPdf private method to avoid real PDF generation
    (processor as any).renderPdf = vi.fn().mockResolvedValue(Buffer.from("pdf-data"));
  });

  it("should issue a certificate if one does not exist", async () => {
    const mockAssignment = {
      id: "as-1",
      staffId: "staff-1",
      staff: { 
        orgId: "org-1", 
        org: { name: "Org", jurisdiction: "BC" },
        user: { name: "User", email: "u@e.com", preferredLocale: "en-CA" },
        site: null,
        role: { labelEn: "Role", labelFr: "Role" }
      },
      module: { titleEn: "Mod", titleFr: "Mod", durationMin: 60 },
      attempts: [{ scorePct: 90, passed: true, submittedAt: new Date(), attestationHash: "hash" }],
      certificate: null, // NO CERTIFICATE
    };

    prisma.assignment.findUnique.mockResolvedValue(mockAssignment);
    prisma.certificate.create.mockResolvedValue({ id: "cert-1" });

    await (processor as any).process({ name: "issue", data: { assignmentId: "as-1" } });

    expect(prisma.certificate.create).toHaveBeenCalled();
    expect(s3.putObject).toHaveBeenCalled();
  });

  it("should NOT issue a certificate if one already exists (idempotency)", async () => {
    const mockAssignment = {
      id: "as-1",
      staffId: "staff-1",
      staff: { orgId: "org-1" },
      certificate: { id: "existing-cert" }, // ALREADY EXISTS
      attempts: [{ id: "att-1" }], // Added to avoid undefined error
    };

    prisma.assignment.findUnique.mockResolvedValue(mockAssignment);

    await (processor as any).process({ name: "issue", data: { assignmentId: "as-1" } });

    expect(prisma.certificate.create).not.toHaveBeenCalled();
    expect(s3.putObject).not.toHaveBeenCalled();
  });
});
