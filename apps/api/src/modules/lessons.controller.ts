import { Controller, ForbiddenException, Param, Post } from "@nestjs/common";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { LessonProgressService } from "./lesson-progress.service";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";

@Controller("lessons")
export class LessonsController {
  constructor(private readonly progress: LessonProgressService) {}

  @Post(":id/complete")
  @SkipPhiAccess()
  complete(
    @Param("id") id: string,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    if (!staff) throw new ForbiddenException("No org context");
    return this.progress.complete(id, staff.staffId, staff.orgId);
  }
}
