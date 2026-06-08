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
