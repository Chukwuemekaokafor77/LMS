import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LessonProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mark a lesson complete for the calling staff. Access mirrors the video
   * playback gate: the lesson must be a preview, or the staff must hold an
   * active (non-expired/revoked) assignment to the lesson's module.
   * Idempotent — re-completing returns the existing row.
   */
  async complete(lessonId: string, staffId: string, orgId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, moduleId: true, isPreview: true },
    });
    if (!lesson) throw new NotFoundException("Lesson not found");

    if (!lesson.isPreview) {
      const assignment = await this.prisma.assignment.findFirst({
        where: {
          staffId,
          moduleId: lesson.moduleId,
          status: { in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
        },
        select: { id: true },
      });
      if (!assignment) throw new ForbiddenException("Not assigned");
    }

    // The tenant guardrail re-stamps orgId on where/create regardless; passing
    // it explicitly keeps the types honest (same convention as attempt.create).
    return this.prisma.lessonProgress.upsert({
      where: { staffId_lessonId: { staffId, lessonId } },
      update: {},
      create: { staffId, lessonId, orgId },
    });
  }

  /** completedAt per lesson of a module for one staff, keyed by lessonId. */
  async forModule(moduleId: string, staffId: string) {
    const rows = await this.prisma.lessonProgress.findMany({
      where: { staffId, lesson: { moduleId } },
      select: { lessonId: true, completedAt: true },
    });
    return new Map(rows.map((r) => [r.lessonId, r.completedAt]));
  }
}
