import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { Jurisdiction, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { runAsSystem } from "../tenant/tenant-context";

const JURISDICTION_DEFAULT_LOCALE: Record<Jurisdiction, string> = {
  NB: "fr-CA",
  NS: "en-CA",
  PE: "en-CA",
  NL: "en-CA",
  ON: "en-CA",
};

const JURISDICTION_REGULATOR: Record<Jurisdiction, string> = {
  NB: "NB Department of Social Development",
  NS: "NS Department of Seniors and Long-term Care",
  PE: "PE Department of Health and Wellness",
  NL: "NL Department of Health and Community Services",
  ON: "ON Ministry of Long-Term Care",
};

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Create an Organization and make the calling user its first ORG_ADMIN Staff.
   * Caller must not already be Staff somewhere — v1 is one-org-per-user.
   */
  async createOrganization(
    userId: string,
    input: {
      name: string;
      jurisdiction: Jurisdiction;
      siteName: string;
      siteAddress?: string;
      regulatorLicenseNumber?: string;
    },
  ) {
    // Tenant bootstrap: the caller is not Staff anywhere yet, so there is no
    // org context to scope by — we're *creating* the org. Run as system; the
    // staff.create inside stamps the brand-new org's id explicitly.
    return runAsSystem(() => this.bootstrapOrganization(userId, input));
  }

  private async bootstrapOrganization(
    userId: string,
    input: {
      name: string;
      jurisdiction: Jurisdiction;
      siteName: string;
      siteAddress?: string;
      regulatorLicenseNumber?: string;
    },
  ) {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { userId },
    });
    if (existingStaff) {
      throw new ConflictException(
        "You already belong to an organization. Contact support to switch.",
      );
    }

    if (!input.name?.trim()) throw new BadRequestException("name required");
    if (!input.siteName?.trim())
      throw new BadRequestException("siteName required");

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const org = await tx.organization.create({
        data: {
          name: input.name.trim(),
          jurisdiction: input.jurisdiction,
          primaryRegulator: JURISDICTION_REGULATOR[input.jurisdiction],
          preferredLocale: JURISDICTION_DEFAULT_LOCALE[input.jurisdiction],
          dataResidencyAttestedAt: new Date(),
        },
      });

      const site = await tx.site.create({
        data: {
          orgId: org.id,
          name: input.siteName.trim(),
          address: input.siteAddress?.trim(),
          regulatorLicenseNumber: input.regulatorLicenseNumber?.trim(),
        },
      });

      // First staff record needs a role; ORG_ADMIN here uses a synthetic
      // "ADMIN" role. Real occupational role gets set later by the admin.
      const adminRoleCode = `${input.jurisdiction}_ADMIN`;
      await tx.role.upsert({
        where: { code: adminRoleCode },
        update: {},
        create: {
          code: adminRoleCode,
          labelEn: "Administration",
          labelFr: "Administration",
          jurisdiction: input.jurisdiction,
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId,
          orgId: org.id,
          siteId: site.id,
          roleCode: adminRoleCode,
          orgPermission: "ORG_ADMIN",
        },
      });

      await this.audit.record({
        actorId: userId,
        orgId: org.id,
        action: "organization.created",
        entityType: "Organization",
        entityId: org.id,
        payload: { jurisdiction: input.jurisdiction },
      });

      return { org, site, staff };
    });
  }
}
