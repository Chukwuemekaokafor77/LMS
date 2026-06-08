import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../storage/s3.service";
import { QUEUES } from "../queue/queue.module";

/**
 * Per-entity retention policy. Atlantic LTC operators inherit federal
 * PIPEDA + provincial health privacy law (PHIPAA in NB). The values below
 * are conservative defaults — operator-specific overrides land in a future
 * RetentionPolicy table once a real customer asks.
 *
 * Stable training records (Assignment, Certificate) outlive PHI access
 * logs because regulators audit completion, not who looked at it.
 */
const POLICY = {
  recordAccessLogDays: 7 * 365, // PHIPAA per-record access log
  auditEventDays: 10 * 365, // state-change ledger — kept longer
  rosterImportDays: 90, // success or failure; S3 lifecycle handles file
  certificateAfterExpiryDays: 7 * 365, // FLTCA-equivalent retention
  // Attempts where the staff has been terminated >7y: redact responses
  // (keep score+hash for evidence). Never delete the Assignment itself.
  terminatedStaffAttemptRedactDays: 7 * 365,
};

const DAY = 86_400_000;

@Processor(QUEUES.retention)
export class RetentionProcessor extends WorkerHost {
  private readonly log = new Logger(RetentionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    this.log.log("Retention sweep starting");
    const now = Date.now();

    const accessCutoff = new Date(now - POLICY.recordAccessLogDays * DAY);
    const accessDeleted = await this.prisma.recordAccessLog.deleteMany({
      where: { createdAt: { lt: accessCutoff } },
    });

    const auditCutoff = new Date(now - POLICY.auditEventDays * DAY);
    const auditDeleted = await this.prisma.auditEvent.deleteMany({
      where: { createdAt: { lt: auditCutoff } },
    });

    const rosterCutoff = new Date(now - POLICY.rosterImportDays * DAY);
    const oldRosters = await this.prisma.rosterImport.findMany({
      where: {
        createdAt: { lt: rosterCutoff },
        status: { in: ["DONE", "FAILED"] },
      },
      select: { id: true, fileS3Key: true },
    });
    for (const r of oldRosters) {
      try {
        await this.s3.client.send(
          new (await import("@aws-sdk/client-s3")).DeleteObjectCommand({
            Bucket: this.s3.bucket,
            Key: r.fileS3Key,
          }),
        );
      } catch (e) {
        this.log.warn(
          `Roster ${r.id} S3 delete failed: ${(e as Error).message}`,
        );
      }
    }
    const rosterDeleted = await this.prisma.rosterImport.deleteMany({
      where: { id: { in: oldRosters.map((r) => r.id) } },
    });

    const terminatedCutoff = new Date(
      now - POLICY.terminatedStaffAttemptRedactDays * DAY,
    );
    const redacted = await this.prisma.attempt.updateMany({
      where: {
        responses: { not: undefined as unknown as object },
        assignment: {
          staff: {
            endedAt: { lt: terminatedCutoff, not: null },
          },
        },
      },
      data: {
        responses: undefined,
        attestationIp: null,
        attestationUa: null,
      },
    });

    const expiredCertCutoff = new Date(
      now - POLICY.certificateAfterExpiryDays * DAY,
    );
    const expiredCerts = await this.prisma.certificate.findMany({
      where: {
        expiresAt: { lt: expiredCertCutoff, not: null },
      },
      select: { id: true, pdfS3Key: true },
    });
    for (const c of expiredCerts) {
      try {
        await this.s3.client.send(
          new (await import("@aws-sdk/client-s3")).DeleteObjectCommand({
            Bucket: this.s3.bucket,
            Key: c.pdfS3Key,
          }),
        );
      } catch (e) {
        this.log.warn(
          `Cert ${c.id} S3 delete failed: ${(e as Error).message}`,
        );
      }
    }
    const certsDeleted = await this.prisma.certificate.deleteMany({
      where: { id: { in: expiredCerts.map((c) => c.id) } },
    });

    this.log.log(
      `Retention sweep done: access=${accessDeleted.count} audit=${auditDeleted.count} roster=${rosterDeleted.count} attemptsRedacted=${redacted.count} certs=${certsDeleted.count}`,
    );
  }
}
