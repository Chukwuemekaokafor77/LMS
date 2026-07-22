import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { AssignmentsService } from "./assignments.service";
import { PhiAccess } from "../audit/phi-access.decorator";
import { SubmitAssignmentDto } from "./dto/submit-assignment.dto";



@Controller("assignments")
export class AssignmentsController {
  constructor(private readonly svc: AssignmentsService) {}

  @Get(":id")
  @PhiAccess({ entityType: "Assignment", action: "read" })
  get(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    return this.svc.getForStaff(id, actor.staffId);
  }

  @Post(":id/attempts")
  @PhiAccess({ entityType: "Attempt", action: "list" }) // Starting an attempt is reading/creating a record
  start(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    return this.svc.startAttempt(id, actor.staffId);
  }

  @Post("attempts/:attemptId/submit")
  @PhiAccess({ entityType: "Attempt", action: "read", idsFrom: (res: any) => [res.id] })
  submit(
    @Param("attemptId") attemptId: string,
    @Body() body: SubmitAssignmentDto,
    @Req() req: Request,
    @Headers("user-agent") ua: string | undefined,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] ??
      req.socket.remoteAddress ??
      undefined;
    return this.svc.submitAttempt({
      attemptId,
      staffId: actor.staffId,
      responses: body.responses,
      ip,
      userAgent: ua,
    });
  }
}
