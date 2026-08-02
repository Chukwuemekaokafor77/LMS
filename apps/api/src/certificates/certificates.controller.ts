import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../storage/s3.service";
import { PhiAccess } from "../audit/phi-access.decorator";

@Controller("certificates")
export class CertificatesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /**
   * Certificate metadata for the in-app certificate view (no PDF bytes). Same
   * ownership/admin rule as download. The learner name, module, score, and the
   * attestation hash mirror what the PDF renders — a single source of truth.
   */
  @Get(":id")
  @PhiAccess({ entityType: "Certificate", action: "read" })
  async metadata(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            module: true,
            staff: {
              include: { user: true, org: true, site: true, role: true },
            },
            attempts: {
              where: { passed: true },
              orderBy: { submittedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });
    if (!cert) throw new NotFoundException();

    const a = cert.assignment;
    const owns = a.staffId === actor.staffId;
    const isAdmin =
      actor.orgPermission !== "STAFF" && a.staff.orgId === actor.orgId;
    if (!owns && !isAdmin) throw new ForbiddenException();

    const attempt = a.attempts[0];
    return {
      id: cert.id,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      sha256: cert.sha256,
      learnerName: a.staff.user.name ?? a.staff.user.email,
      roleLabelEn: a.staff.role.labelEn,
      roleLabelFr: a.staff.role.labelFr,
      orgName: a.staff.org.name,
      siteName: a.staff.site?.name ?? null,
      jurisdiction: a.staff.org.jurisdiction,
      moduleTitleEn: a.module.titleEn,
      moduleTitleFr: a.module.titleFr,
      moduleSlug: a.module.slug,
      durationMin: a.module.durationMin,
      scorePct: attempt?.scorePct ?? null,
      attestationHash: attempt?.attestationHash ?? null,
    };
  }

  /** Returns a short-lived signed S3 URL for the learner's certificate PDF. */
  @Get(":id/download")
  @PhiAccess({ entityType: "Certificate", action: "download" })
  async download(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: { assignment: { include: { staff: true } } },
    });
    if (!cert) throw new NotFoundException();

    const owns = cert.assignment.staffId === actor.staffId;
    const isAdmin =
      actor.orgPermission !== "STAFF" &&
      cert.assignment.staff.orgId === actor.orgId;
    if (!owns && !isAdmin) throw new ForbiddenException();

    const url = await this.s3.presignGet(cert.pdfS3Key, 300);
    return { url, sha256: cert.sha256, issuedAt: cert.issuedAt };
  }
}
