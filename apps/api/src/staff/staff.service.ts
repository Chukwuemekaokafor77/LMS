import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { StaffContext } from "../tenant/tenant.types";

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: StaffContext) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Site or org admin required");
    }
    return this.prisma.staff.findMany({
      where: {
        orgId: actor.orgId,
        ...(actor.orgPermission === "SITE_ADMIN" && actor.siteId
          ? { siteId: actor.siteId }
          : {}),
        endedAt: null,
      },
      include: {
        user: { select: { name: true, email: true, preferredLocale: true } },
        role: { select: { code: true, labelEn: true, labelFr: true } },
        site: { select: { id: true, name: true } },
      },
      orderBy: [{ siteId: "asc" }, { createdAt: "desc" }],
    });
  }

  async getOne(actor: StaffContext, staffId: string) {
    const s = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: true,
        role: true,
        site: true,
        assignments: {
          include: {
            module: {
              select: { slug: true, titleEn: true, titleFr: true },
            },
            certificate: true,
          },
          orderBy: { dueAt: "desc" },
        },
      },
    });
    if (!s || s.orgId !== actor.orgId) throw new NotFoundException();
    if (
      actor.orgPermission === "STAFF" &&
      s.id !== actor.staffId
    ) {
      throw new ForbiddenException();
    }
    if (
      actor.orgPermission === "SITE_ADMIN" &&
      actor.siteId &&
      s.siteId !== actor.siteId
    ) {
      throw new ForbiddenException("Cross-site read");
    }
    return s;
  }
}
