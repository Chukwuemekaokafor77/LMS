import {
  Controller,
  ForbiddenException,
  Get,
  UnauthorizedException,
} from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { PrismaService } from "../prisma/prisma.service";
import { PhiAccess } from "../audit/phi-access.decorator";
import { SKIP_PHI_ACCESS_KEY } from "../audit/skip-phi-access.decorator";

@Controller("me")
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @PhiAccess({ entityType: "Staff", action: "read", idsFrom: (res: any) => res.staff ? [res.staff.staffId] : [] })
  async me(
    @CurrentUser() user: { id: string; email: string } | undefined,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    if (!user) throw new UnauthorizedException();
    const u = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { id: true, email: true, name: true, preferredLocale: true },
    });
    return { user: u, staff: staff ?? null };
  }

  @Get("assignments")
  @PhiAccess({ entityType: "Assignment", action: "list", idsFrom: "response" })
  async assignments(@CurrentStaff() staff: StaffContext | undefined) {
    if (!staff) throw new ForbiddenException("No org context");
    const rows = await this.prisma.assignment.findMany({
      where: {
        staffId: staff.staffId,
        status: { in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
      },
      include: {
        module: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleFr: true,
            durationMin: true,
          },
        },
        certificate: { select: { id: true, issuedAt: true, expiresAt: true } },
      },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    });
    return rows;
  }
}
