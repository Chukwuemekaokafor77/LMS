import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { AuthoringService } from "./authoring.service";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import {
  CreateLessonDto,
  CreateModuleDto,
  ReorderLessonsDto,
  UpdateLessonDto,
  UpdateModuleDto,
  UpsertQuizDto,
} from "./dto/authoring.dto";

/** Org-admin authoring surface for org-private modules (content, not PHI). */
@Controller("authoring")
export class AuthoringController {
  constructor(private readonly authoring: AuthoringService) {}

  private actor(staff: StaffContext | undefined): StaffContext {
    if (!staff) throw new ForbiddenException("No org context");
    return staff;
  }

  @Get("modules")
  @SkipPhiAccess()
  list(@CurrentStaff() staff: StaffContext | undefined) {
    return this.authoring.listModules(this.actor(staff));
  }

  @Post("modules")
  @SkipPhiAccess()
  createModule(
    @Body() body: CreateModuleDto,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.createModule(this.actor(staff), body);
  }

  @Get("modules/:id")
  @SkipPhiAccess()
  getModule(
    @Param("id") id: string,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.getModule(this.actor(staff), id);
  }

  @Patch("modules/:id")
  @SkipPhiAccess()
  updateModule(
    @Param("id") id: string,
    @Body() body: UpdateModuleDto,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.updateModule(this.actor(staff), id, body);
  }

  @Post("modules/:id/lessons")
  @SkipPhiAccess()
  createLesson(
    @Param("id") id: string,
    @Body() body: CreateLessonDto,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.createLesson(this.actor(staff), id, body);
  }

  @Patch("lessons/:id")
  @SkipPhiAccess()
  updateLesson(
    @Param("id") id: string,
    @Body() body: UpdateLessonDto,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.updateLesson(this.actor(staff), id, body);
  }

  @Delete("lessons/:id")
  @SkipPhiAccess()
  deleteLesson(
    @Param("id") id: string,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.deleteLesson(this.actor(staff), id);
  }

  @Put("modules/:id/lessons/order")
  @SkipPhiAccess()
  reorder(
    @Param("id") id: string,
    @Body() body: ReorderLessonsDto,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.reorderLessons(this.actor(staff), id, body);
  }

  @Put("modules/:id/quiz")
  @SkipPhiAccess()
  upsertQuiz(
    @Param("id") id: string,
    @Body() body: UpsertQuizDto,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    return this.authoring.upsertQuiz(this.actor(staff), id, body);
  }
}
