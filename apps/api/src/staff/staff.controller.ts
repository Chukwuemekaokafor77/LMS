import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { z } from "zod";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { InvitationsService } from "./invitations.service";
import { StaffService } from "./staff.service";
import { PhiAccess } from "../audit/phi-access.decorator";
import { PhiController } from "../audit/phi.controller";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import { InviteStaffDto } from "./dto/invite-staff.dto";



@Controller("staff")
export class StaffController extends PhiController {
  constructor(
    private readonly invitations: InvitationsService,
    private readonly staff: StaffService,
  ) {}

  @Get()
  @PhiAccess({ entityType: "Staff", action: "list", idsFrom: "response" })
  async list(@CurrentStaff() actor: StaffContext | undefined) {
    if (!actor) throw new ForbiddenException("No org context");
    return this.staff.list(actor);
  }

  @Get(":id")
  @PhiAccess({ entityType: "Staff", action: "read" })
  async byId(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException("No org context");
    return this.staff.getOne(actor, id);
  }

  @Post("invitations")
  @SkipPhiAccess() // Invitations don't read existing PHI records directly in a way that needs audit?
  async invite(
    @Body() body: InviteStaffDto,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException("No org context");
    return this.invitations.invite(actor, body);
  }

  @Delete("invitations/:id")
  @SkipPhiAccess()
  async revoke(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException("No org context");
    return this.invitations.revoke(actor, id);
  }
}
