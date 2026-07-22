import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { RequiredTrainingService } from "./required-training.service";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import { CreateRequiredTrainingDto } from "./dto/create-required-training.dto";



@Controller("required-trainings")
export class RequiredTrainingController {
  constructor(private readonly svc: RequiredTrainingService) {}

  @Get()
  @SkipPhiAccess()
  list(@CurrentStaff() actor: StaffContext | undefined) {
    if (!actor) throw new ForbiddenException();
    return this.svc.list(actor);
  }

  @Post()
  @SkipPhiAccess()
  create(
    @Body() body: CreateRequiredTrainingDto,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    return this.svc.create(actor, body);
  }

  @Delete(":id")
  @SkipPhiAccess()
  remove(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    return this.svc.remove(actor, id);
  }
}
