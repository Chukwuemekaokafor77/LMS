import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { QUEUES } from "../queue/queue.module";
import type { OrgPermission } from "@prisma/client";
import type { StaffContext } from "../tenant/tenant.types";
import { runAsSystem, runWithOrgContext } from "../tenant/tenant-context";

export type InviteInput = {
  email: string;
  roleCode: string;
  siteId?: string;
  orgPermission?: OrgPermission;
  employmentType?: string;
};

/** Invitations expire after 30 days. */
export const INVITATION_TTL_DAYS = 30;

const hashToken = (raw: string) =>
  createHash("sha256").update(raw).digest("hex");

/**
 * LMS-native staff invitations (LMS-M6 step 3). Replaced the former Clerk
 * invitation + webhook-publicMetadata mechanism:
 *
 *   invite  → Invitation row (SHA-256 of a one-time token; raw token only in
 *             the emailed accept link) + bilingual email job
 *   accept  → the signed-in invitee posts the token; email must match; the
 *             Staff row is materialized and required training enqueued
 *   revoke  → tombstoned in place (revokedAt), org-scoped
 */
@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    @InjectQueue(QUEUES.materialize) private readonly materializeQ: Queue,
    @InjectQueue(QUEUES.email) private readonly emailQ: Queue,
  ) {}

  async invite(actor: StaffContext, input: InviteInput) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Site or org admin required");
    }

    const email = input.email.toLowerCase();

    const role = await this.prisma.role.findUnique({
      where: { code: input.roleCode },
    });
    if (!role) throw new BadRequestException(`Unknown role ${input.roleCode}`);
    if (role.jurisdiction !== actor.jurisdiction) {
      throw new BadRequestException("Role does not match org jurisdiction");
    }

    if (input.siteId) {
      const site = await this.prisma.site.findUnique({
        where: { id: input.siteId },
      });
      if (!site || site.orgId !== actor.orgId) {
        throw new BadRequestException("Site not in your org");
      }
      if (
        actor.orgPermission === "SITE_ADMIN" &&
        actor.siteId !== input.siteId
      ) {
        throw new ForbiddenException("Cross-site invite — org admin required");
      }
    } else if (actor.orgPermission === "SITE_ADMIN") {
      throw new BadRequestException("siteId required for site admins");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      // Deliberately cross-org: v1 is one-org-per-user, so we must check
      // whether this user is Staff in *any* org, not just the actor's.
      const existingStaff = await runAsSystem(
        async () =>
          await this.prisma.staff.findUnique({
            where: { userId: existingUser.id },
          }),
      );
      if (existingStaff) {
        throw new ConflictException(
          "User already belongs to an organization",
        );
      }
    }

    // A re-invite supersedes any still-pending invitation for the same email
    // in THIS org (their emailed links stop working; only the newest token is
    // live). orgId is explicit because the roster processor calls invite()
    // from a system context, where the guardrail injects nothing.
    await this.prisma.invitation.updateMany({
      where: {
        orgId: actor.orgId,
        email,
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString("base64url");
    const invitation = await this.prisma.invitation.create({
      data: {
        orgId: actor.orgId,
        siteId: input.siteId ?? null,
        email,
        roleCode: input.roleCode,
        orgPermission: input.orgPermission ?? "STAFF",
        employmentType: input.employmentType ?? null,
        tokenHash: hashToken(rawToken),
        invitedById: actor.userId,
        expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * 86_400_000),
      },
    });

    // The raw token travels only through the email job → accept link.
    await this.emailQ.add("staff.invited", {
      invitationId: invitation.id,
      token: rawToken,
    });

    await this.audit.record({
      actorId: actor.userId,
      orgId: actor.orgId,
      action: "staff.invited",
      entityType: "Invitation",
      entityId: invitation.id,
      payload: {
        email,
        roleCode: input.roleCode,
        siteId: input.siteId,
      },
    });

    return { id: invitation.id, status: "pending" as const };
  }

  /** Pending (live) invitations for the actor's org — admin surface. */
  async listPending(actor: StaffContext) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Site or org admin required");
    }
    return this.prisma.invitation.findMany({
      where: {
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        roleCode: true,
        siteId: true,
        orgPermission: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async revoke(actor: StaffContext, invitationId: string) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Site or org admin required");
    }
    // Org-scoped read via the guardrail — another org's invitation is a 404.
    const inv = await this.prisma.invitation.findFirst({
      where: { id: invitationId },
    });
    if (!inv) throw new NotFoundException("Invitation not found");
    if (inv.acceptedAt) {
      throw new BadRequestException("Invitation already accepted");
    }
    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { revokedAt: new Date() },
    });
    await this.audit.record({
      actorId: actor.userId,
      orgId: actor.orgId,
      action: "staff.invitation_revoked",
      entityType: "Invitation",
      entityId: invitationId,
    });
    return { id: invitationId, status: "revoked" as const };
  }

  /**
   * Accept an invitation as the signed-in user. The caller has no org context
   * yet (they aren't Staff anywhere), so the token lookup runs as system; the
   * invitation's own orgId then scopes the materialization.
   */
  async accept(user: { id: string; email: string }, rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const inv = await runAsSystem(
      async () =>
        await this.prisma.invitation.findUnique({ where: { tokenHash } }),
    );
    if (!inv || inv.revokedAt) {
      throw new NotFoundException("Invitation not found");
    }
    if (inv.acceptedAt) {
      throw new BadRequestException("Invitation already accepted");
    }
    if (inv.expiresAt < new Date()) {
      throw new BadRequestException("Invitation expired");
    }
    if (inv.email !== user.email.toLowerCase()) {
      // The invite is bound to the email it was sent to.
      throw new ForbiddenException(
        "This invitation was issued to a different email address",
      );
    }

    const existingStaff = await runAsSystem(
      async () =>
        await this.prisma.staff.findUnique({ where: { userId: user.id } }),
    );
    if (existingStaff) {
      throw new ConflictException("You already belong to an organization");
    }

    const staff = await this.materializeFromInvitation({
      userId: user.id,
      orgId: inv.orgId,
      siteId: inv.siteId,
      roleCode: inv.roleCode,
      orgPermission: inv.orgPermission,
      employmentType: inv.employmentType,
    });

    await runWithOrgContext(inv.orgId, async () => {
      await this.prisma.invitation.update({
        where: { tokenHash },
        data: { acceptedAt: new Date() },
      });
    });

    await this.audit.record({
      actorId: user.id,
      orgId: inv.orgId,
      action: "staff.invitation_accepted",
      entityType: "Invitation",
      entityId: inv.id,
    });

    return staff;
  }

  /** Create the Staff row an invitation describes + enqueue required training. */
  async materializeFromInvitation(args: {
    userId: string;
    orgId: string;
    siteId: string | null;
    roleCode: string;
    orgPermission: OrgPermission;
    employmentType: string | null;
  }) {
    const role = await this.prisma.role.findUnique({
      where: { code: args.roleCode },
    });
    if (!role) throw new NotFoundException(`Role ${args.roleCode} not found`);

    const staff = await runWithOrgContext(
      args.orgId,
      async () =>
        await this.prisma.staff.upsert({
          where: { userId: args.userId },
          create: {
            userId: args.userId,
            orgId: args.orgId,
            siteId: args.siteId,
            roleCode: args.roleCode,
            orgPermission: args.orgPermission,
            employmentType: args.employmentType,
            startedAt: new Date(),
          },
          update: {},
        }),
    );
    await this.materializeQ.add("materialize-for-staff", {
      staffId: staff.id,
    });
    return staff;
  }
}
