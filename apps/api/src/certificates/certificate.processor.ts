import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Queue, type Job } from "bullmq";
import { createHash } from "crypto";
import PDFDocument from "pdfkit";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../storage/s3.service";
import { AuditService } from "../audit/audit.service";
import { QUEUES } from "../queue/queue.module";

@Processor(QUEUES.certificate)
export class CertificateProcessor extends WorkerHost {
  private readonly log = new Logger(CertificateProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly audit: AuditService,
    @InjectQueue(QUEUES.email) private readonly emailQ: Queue,
  ) {
    super();
  }

  async process(job: Job<{ assignmentId: string }>): Promise<void> {
    if (job.name !== "issue") return;
    const { assignmentId } = job.data;

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: true,
        staff: {
          include: {
            user: true,
            org: true,
            site: true,
            role: true,
          },
        },
        attempts: {
          where: { passed: true },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
        certificate: true,
      },
    });
    if (!assignment || assignment.attempts.length === 0) return;
    if (assignment.certificate) return; // idempotent

    const passingAttempt = assignment.attempts[0];
    const locale = assignment.staff.user.preferredLocale;

    const pdfBytes = await this.renderPdf({
      orgName: assignment.staff.org.name,
      siteName: assignment.staff.site?.name ?? null,
      jurisdiction: assignment.staff.org.jurisdiction,
      learnerName: assignment.staff.user.name ?? assignment.staff.user.email,
      roleLabel:
        locale === "fr-CA"
          ? assignment.staff.role.labelFr
          : assignment.staff.role.labelEn,
      moduleTitle:
        locale === "fr-CA" ? assignment.module.titleFr : assignment.module.titleEn,
      durationMin: assignment.module.durationMin,
      scorePct: passingAttempt.scorePct ?? 0,
      submittedAt: passingAttempt.submittedAt ?? new Date(),
      attestationHash: passingAttempt.attestationHash ?? "",
      locale,
    });

    const sha = createHash("sha256").update(pdfBytes).digest("hex");
    const key = `certificates/${assignment.staff.orgId}/${assignment.id}.pdf`;
    await this.s3.putObject(key, pdfBytes, "application/pdf");

    const cert = await this.prisma.certificate.create({
      data: {
        assignmentId: assignment.id,
        orgId: assignment.staff.orgId,
        pdfS3Key: key,
        sha256: sha,
        expiresAt: assignment.expiresAt,
      },
    });

    await this.audit.record({
      actorId: assignment.staffId,
      orgId: assignment.staff.orgId,
      action: "certificate.issued",
      entityType: "Certificate",
      entityId: cert.id,
      payload: { sha256: sha, assignmentId: assignment.id },
    });

    await this.emailQ.add("certificate.issued", { certificateId: cert.id });
  }

  private async renderPdf(args: {
    orgName: string;
    siteName: string | null;
    jurisdiction: string;
    learnerName: string;
    roleLabel: string;
    moduleTitle: string;
    durationMin: number;
    scorePct: number;
    submittedAt: Date;
    attestationHash: string;
    locale: string;
  }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: "LETTER", margin: 60 });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const fr = args.locale === "fr-CA";

      doc.fontSize(28).text(fr ? "Attestation de réussite" : "Certificate of Completion", {
        align: "center",
      });
      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .fillColor("#666")
        .text(
          fr
            ? `${args.orgName}${args.siteName ? ` — ${args.siteName}` : ""}`
            : `${args.orgName}${args.siteName ? ` — ${args.siteName}` : ""}`,
          { align: "center" },
        );

      doc.moveDown(2).fillColor("#000");
      doc.fontSize(14).text(fr ? "Présentée à" : "Presented to", { align: "center" });
      doc.moveDown(0.3);
      doc.fontSize(22).text(args.learnerName, { align: "center" });
      doc.fontSize(12).fillColor("#666").text(args.roleLabel, { align: "center" });

      doc.moveDown(2).fillColor("#000");
      doc
        .fontSize(14)
        .text(
          fr
            ? "Pour avoir complété la formation"
            : "For successfully completing the training",
          { align: "center" },
        );
      doc.moveDown(0.3);
      doc.fontSize(18).text(args.moduleTitle, { align: "center" });

      doc.moveDown(2);
      const fmt = args.submittedAt.toLocaleDateString(args.locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.fontSize(12).text(
        fr
          ? `Date : ${fmt}    Score : ${args.scorePct}%    Durée : ${args.durationMin} min`
          : `Date: ${fmt}    Score: ${args.scorePct}%    Duration: ${args.durationMin} min`,
        { align: "center" },
      );

      doc.moveDown(3);
      doc
        .fontSize(8)
        .fillColor("#999")
        .text(
          fr
            ? `Empreinte d'attestation (SHA-256) : ${args.attestationHash}`
            : `Attestation hash (SHA-256): ${args.attestationHash}`,
          { align: "center" },
        );
      doc
        .text(
          fr
            ? `Émis par Maple Care · Compétence : ${args.jurisdiction}`
            : `Issued by Maple Care · Jurisdiction: ${args.jurisdiction}`,
          { align: "center" },
        );

      doc.end();
    });
  }
}
