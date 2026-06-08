import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type AuditInput = {
  actorId?: string | null;
  orgId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class AuditService {
  private readonly log = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(e: AuditInput) {
    try {
      await this.prisma.auditEvent.create({
        data: {
          actorId: e.actorId ?? null,
          orgId: e.orgId ?? null,
          action: e.action,
          entityType: e.entityType,
          entityId: e.entityId,
          payload: e.payload as object | undefined,
          ip: e.ip,
          userAgent: e.userAgent,
        },
      });
    } catch (err) {
      // Audit failures must never break the user-facing request.
      this.log.error(`Failed to record audit event ${e.action}`, err as Error);
    }
  }
}
