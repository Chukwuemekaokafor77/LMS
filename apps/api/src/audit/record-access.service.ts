import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type RecordAccess = {
  actorUserId?: string | null;
  orgId?: string | null;
  entityType: string;
  entityId: string;
  action: "read" | "list" | "export" | "download";
  ip?: string;
  userAgent?: string;
};

/**
 * PHIPAA s.10/11 require recording every access to personal health
 * information by a custodian or its agents. This is the per-record
 * counterpart to AuditService (state changes).
 */
@Injectable()
export class RecordAccessService {
  private readonly log = new Logger(RecordAccessService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(e: RecordAccess) {
    try {
      await this.prisma.recordAccessLog.create({
        data: {
          actorUserId: e.actorUserId ?? null,
          orgId: e.orgId ?? null,
          entityType: e.entityType,
          entityId: e.entityId,
          action: e.action,
          ip: e.ip,
          userAgent: e.userAgent,
        },
      });
    } catch (err) {
      this.log.error(
        `Failed to record PHI access ${e.entityType}:${e.entityId}`,
        err as Error,
      );
    }
  }

  async recordMany(events: RecordAccess[]) {
    if (events.length === 0) return;
    try {
      await this.prisma.recordAccessLog.createMany({
        data: events.map((e) => ({
          actorUserId: e.actorUserId ?? null,
          orgId: e.orgId ?? null,
          entityType: e.entityType,
          entityId: e.entityId,
          action: e.action,
          ip: e.ip,
          userAgent: e.userAgent,
        })),
      });
    } catch (err) {
      this.log.error("Failed to record PHI access batch", err as Error);
    }
  }
}
