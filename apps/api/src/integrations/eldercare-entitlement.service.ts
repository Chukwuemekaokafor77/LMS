import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

/** Payload of ElderCare's entitlement webhook (mirror on the psw side). */
export type EntitlementWebhookPayload = {
  external_org_id: string;
  status: string;
  seats?: number | null;
  /** ElderCare event id — dedupes replays. */
  event_id?: string | null;
  /** ISO-8601 emitted-at — drops stale, out-of-order deliveries. */
  event_at?: string | null;
};

export type ApplyResult =
  | { ok: true; applied: true; status: string }
  | { ok: true; applied: false; reason: "unknown_org" | "duplicate" | "stale" };

/**
 * Applies an ElderCare entitlement change to the local `Entitlement` row so the
 * auth guard can enforce it mid-session (Phase-D follow-up; today access is only
 * checked at SSO). Idempotent on `event_id` and ordered by `event_at`.
 *
 * `Entitlement`/`Organization`/`AuditEvent` are non-PHI models, so none are in
 * the tenant-isolation guardrail's PHI_MODELS set — this runs on the unguarded
 * webhook path (no tenant context) without a runAsSystem escape, and every
 * query is org-scoped explicitly.
 */
@Injectable()
export class EldercareEntitlementService {
  private readonly log = new Logger(EldercareEntitlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async apply(payload: EntitlementWebhookPayload): Promise<ApplyResult> {
    const externalOrgId = payload?.external_org_id;
    const status = payload?.status;
    if (typeof externalOrgId !== "string" || !externalOrgId || typeof status !== "string" || !status) {
      throw new BadRequestException("Invalid entitlement payload");
    }
    const seats = typeof payload.seats === "number" ? payload.seats : null;
    const eventId = typeof payload.event_id === "string" ? payload.event_id : null;
    const eventAt = payload.event_at ? new Date(payload.event_at) : null;
    if (eventAt && Number.isNaN(eventAt.getTime())) {
      throw new BadRequestException("Invalid event_at");
    }

    const org = await this.prisma.organization.findUnique({
      where: { externalOrgId },
      select: { id: true },
    });
    if (!org) {
      // An agency ElderCare knows about that has never used the Academy — there
      // is nothing to gate, and no Academy access exists. Accept (200) so
      // ElderCare doesn't retry a delivery that can never apply.
      this.log.warn(`Entitlement webhook for unknown org ${externalOrgId} — accepted, no-op`);
      return { ok: true, applied: false, reason: "unknown_org" };
    }

    const existing = await this.prisma.entitlement.findUnique({
      where: { orgId: org.id },
      select: { lastEventId: true, lastEventAt: true },
    });
    if (existing) {
      if (eventId && existing.lastEventId === eventId) {
        return { ok: true, applied: false, reason: "duplicate" };
      }
      if (eventAt && existing.lastEventAt && eventAt <= existing.lastEventAt) {
        return { ok: true, applied: false, reason: "stale" };
      }
    }

    await this.prisma.entitlement.upsert({
      where: { orgId: org.id },
      create: { orgId: org.id, status, seats, lastEventId: eventId, lastEventAt: eventAt },
      update: { status, seats, lastEventId: eventId, lastEventAt: eventAt },
    });

    await this.audit.record({
      orgId: org.id,
      action: "entitlement.updated",
      entityType: "Entitlement",
      entityId: org.id,
      payload: { status, seats, eventId, source: "eldercare_webhook" },
    });

    this.log.log(`Entitlement for org ${org.id} → ${status}`);
    return { ok: true, applied: true, status };
  }
}
