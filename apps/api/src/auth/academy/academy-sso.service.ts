import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { runAsSystem } from "../../tenant/tenant-context";
import { AcademyExchangeClient, type EldercareClaims } from "./academy-exchange.client";
import { AcademySessionService } from "./academy-session.service";
import { mapEldercareRole, mapProvince } from "./eldercare-role-map";
import { isEntitlementActive } from "../../integrations/entitlement-status";

const LOCALE_MAP: Record<string, string> = { fr: "fr-CA", en: "en-CA" };

/**
 * The Academy side of the handoff (Seam 1 + Seam 2): consume ElderCare's
 * one-time token, JIT-provision Organization/Site/User/Staff from the claims
 * (ElderCare is the system of record), enforce the entitlement, and mint the
 * Academy session the web app stores as its cookie.
 */
@Injectable()
export class AcademySsoService {
  private readonly log = new Logger(AcademySsoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangeClient: AcademyExchangeClient,
    private readonly sessions: AcademySessionService,
    private readonly audit: AuditService,
  ) {}

  async signIn(oneTimeToken: string) {
    let claims: EldercareClaims;
    try {
      claims = await this.exchangeClient.exchange(oneTimeToken);
    } catch (err) {
      this.log.warn(`ElderCare exchange failed: ${(err as Error).message}`);
      throw new BadRequestException("Invalid or expired sign-in link");
    }

    if (!isEntitlementActive(claims.entitlement?.status)) {
      throw new ForbiddenException(
        "Your agency's ElderCare subscription is not active",
      );
    }

    const jurisdiction = mapProvince(claims.org.province);
    if (!jurisdiction) {
      throw new BadRequestException(
        `Your agency's province (${claims.org.province ?? "unset"}) is not supported yet`,
      );
    }

    const role = mapEldercareRole(claims.role, jurisdiction);
    if (!role) {
      throw new ForbiddenException(
        `Your ElderCare role (${claims.role}) has no training seat`,
      );
    }

    // JIT provisioning — cross-tenant by nature (the org may not exist yet),
    // so it runs as system; every create stamps its orgId explicitly.
    const { user } = await runAsSystem(() => this.provision(claims, jurisdiction, role));

    await this.audit.record({
      actorId: user.id,
      orgId: user.staffOrgId,
      action: "academy.sso_signin",
      entityType: "User",
      entityId: user.id,
      payload: { eldercareRole: claims.role, roleCode: role.code },
    });

    const session = this.sessions.mint(claims.sub);
    return { sessionToken: session.token, expiresIn: session.expiresIn };
  }

  private async provision(
    claims: EldercareClaims,
    jurisdiction: import("@prisma/client").Jurisdiction,
    role: NonNullable<ReturnType<typeof mapEldercareRole>>,
  ) {
    const orgLocale = jurisdiction === "NB" ? "fr-CA" : "en-CA";

    const org = await this.prisma.organization.upsert({
      where: { externalOrgId: claims.org.id },
      create: {
        externalOrgId: claims.org.id,
        name: claims.org.name,
        jurisdiction,
        preferredLocale: orgLocale,
      },
      update: { name: claims.org.name },
    });

    // Persist the entitlement baseline so the auth guard has a row to enforce
    // mid-session. `lastEventAt` is deliberately left untouched here (login is
    // not a webhook event), so a subsequent ElderCare webhook always applies.
    await this.prisma.entitlement.upsert({
      where: { orgId: org.id },
      create: {
        orgId: org.id,
        status: claims.entitlement.status,
        seats: claims.entitlement.seats,
      },
      update: {
        status: claims.entitlement.status,
        seats: claims.entitlement.seats,
      },
    });

    let siteId: string | null = null;
    if (claims.facility) {
      const site = await this.prisma.site.upsert({
        where: { externalFacilityId: claims.facility.id },
        create: {
          externalFacilityId: claims.facility.id,
          orgId: org.id,
          name: claims.facility.name,
        },
        update: { name: claims.facility.name },
      });
      siteId = site.id;
    }

    await this.prisma.role.upsert({
      where: { code: role.code },
      create: {
        code: role.code,
        labelEn: role.labelEn,
        labelFr: role.labelFr,
        jurisdiction,
      },
      update: {},
    });

    const preferredLocale = LOCALE_MAP[claims.locale ?? ""] ?? "en-CA";
    const user = await this.prisma.user.upsert({
      where: { externalAuthId: claims.sub },
      create: {
        externalAuthId: claims.sub,
        email: claims.email.toLowerCase(),
        name: claims.name,
        preferredLocale,
      },
      update: {
        email: claims.email.toLowerCase(),
        name: claims.name ?? undefined,
        preferredLocale,
      },
    });

    const existingStaff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
    });
    if (existingStaff && existingStaff.orgId !== org.id) {
      // One-org-per-user: the ElderCare account moved agencies. Migrating the
      // training history across tenants is a support decision, not an auto-op.
      throw new ConflictException(
        "This account belongs to a different agency — contact support",
      );
    }

    // ElderCare is the system of record: role/site/permission follow it.
    const staff = existingStaff
      ? await this.prisma.staff.update({
          where: { id: existingStaff.id },
          data: {
            siteId,
            roleCode: role.code,
            orgPermission: role.orgPermission,
          },
        })
      : await this.prisma.staff.create({
          data: {
            userId: user.id,
            orgId: org.id,
            siteId,
            roleCode: role.code,
            orgPermission: role.orgPermission,
            startedAt: new Date(),
          },
        });

    return { user: { id: user.id, staffOrgId: staff.orgId } };
  }
}
