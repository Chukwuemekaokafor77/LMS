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
import { PrismaService } from "../prisma/prisma.service";
import { ClerkService } from "../auth/clerk.service";
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

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clerk: ClerkService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    @InjectQueue(QUEUES.materialize) private readonly materializeQ: Queue,
  ) {}

  /**
   * Invite a single staff member: validates inputs against the caller's org,
   * issues a Clerk magic-link invitation, and pre-creates a pending Staff
   * stub when the invitee accepts (via the Clerk webhook user.created
   * handler — see [auth/clerk-webhook.controller.ts]).
   */
  async invite(actor: StaffContext, input: InviteInput) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Site or org admin required");
    }

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
      where: { email: input.email.toLowerCase() },
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

    const webBase = this.config.getOrThrow<string>("WEB_BASE_URL");
    const invitation = await this.clerk
      .getClient()
      .invitations.createInvitation({
        emailAddress: input.email.toLowerCase(),
        redirectUrl: `${webBase}/onboarding/accept-invite`,
        publicMetadata: {
          orgId: actor.orgId,
          siteId: input.siteId ?? null,
          roleCode: input.roleCode,
          orgPermission: input.orgPermission ?? "STAFF",
          employmentType: input.employmentType ?? null,
        },
        notify: true,
      });

    await this.audit.record({
      actorId: actor.userId,
      orgId: actor.orgId,
      action: "staff.invited",
      entityType: "Invitation",
      entityId: invitation.id,
      payload: {
        email: input.email,
        roleCode: input.roleCode,
        siteId: input.siteId,
      },
    });

    return { id: invitation.id, status: invitation.status };
  }

  async revoke(actor: StaffContext, invitationId: string) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Site or org admin required");
    }
    const inv = await this.clerk
      .getClient()
      .invitations.revokeInvitation(invitationId);
    await this.audit.record({
      actorId: actor.userId,
      orgId: actor.orgId,
      action: "staff.invitation_revoked",
      entityType: "Invitation",
      entityId: invitationId,
    });
    return { id: inv.id, status: inv.status };
  }

  /**
   * Called from the Clerk webhook user.created handler when an invited user
   * accepts. Reads the invitation's publicMetadata and creates the Staff row.
   */
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

    // Runs from the Clerk webhook (no HTTP auth → no org context), but the
    // invitation metadata tells us exactly which org the new Staff belongs to.
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
