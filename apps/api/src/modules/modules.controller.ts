import {
  Controller,
  ForbiddenException,
  Get,
  Param,
} from "@nestjs/common";
import { ModulesService } from "./modules.service";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import type { Jurisdiction } from "@prisma/client";
import { PhiController } from "../audit/phi.controller";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";

@Controller("modules")
export class ModulesController extends PhiController {
  constructor(private readonly modules: ModulesService) {}

  @Get()
  @SkipPhiAccess()
  list(@CurrentStaff() staff: StaffContext | undefined) {
    if (!staff) throw new ForbiddenException("No org context");
    return this.modules.listForOrg(
      staff.orgId,
      staff.jurisdiction as Jurisdiction,
    );
  }

  @Get(":slug")
  @SkipPhiAccess()
  bySlug(
    @Param("slug") slug: string,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    if (!staff) throw new ForbiddenException("No org context");
    return this.modules.getBySlug(
      slug,
      staff.orgId,
      staff.jurisdiction as Jurisdiction,
    );
  }
}
