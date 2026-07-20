import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { QUEUES } from "../queue/queue.module";
import { runAsSystem } from "../tenant/tenant-context";
import { EldercareFlowbackClient } from "./eldercare-flowback.client";

/**
 * Seam 3 — pushes an issued Certificate to ElderCare as a tracked, expiring
 * StaffCertification. Enqueued by the certificate processor on issue; BullMQ
 * retries with backoff (configured at enqueue) so a transient ElderCare outage
 * doesn't lose the delivery. Idempotent on the ElderCare side (certificate id),
 * so a retry after a partial success is safe.
 */
@Processor(QUEUES.flowback)
export class CredentialFlowbackProcessor extends WorkerHost {
  private readonly log = new Logger(CredentialFlowbackProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly client: EldercareFlowbackClient,
    private readonly audit: AuditService,
  ) {
    super();
  }

  async process(job: Job<{ certificateId: string }>): Promise<void> {
    if (job.name !== "deliver") return;
    await runAsSystem(() => this.deliver(job.data.certificateId));
  }

  private async deliver(certificateId: string): Promise<void> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        assignment: {
          include: { module: true, staff: { include: { user: true } } },
        },
      },
    });
    if (!cert) return;

    if (!this.client.isConfigured()) {
      this.log.warn(
        `ElderCare flow-back not configured — skipping certificate ${certificateId}`,
      );
      return;
    }

    const user = cert.assignment.staff.user;
    if (!user.externalAuthId) {
      // Should not happen post-Academy (externalAuthId = the ElderCare user id).
      this.log.warn(
        `Certificate ${certificateId}: staff has no externalAuthId — skipping flow-back`,
      );
      return;
    }

    await this.client.sendCertificate({
      external_user_id: user.externalAuthId,
      certificate_id: cert.id,
      module_title: cert.assignment.module.titleEn,
      issued_at: cert.issuedAt.toISOString(),
      expires_at: cert.expiresAt ? cert.expiresAt.toISOString() : null,
      sha256: cert.sha256,
    });

    await this.audit.record({
      actorId: user.id,
      orgId: cert.orgId,
      action: "certificate.flowback_delivered",
      entityType: "Certificate",
      entityId: cert.id,
    });
  }
}
