import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import type { StaffContext } from "../tenant/tenant.types";
import type {
  CreateLessonDto,
  CreateModuleDto,
  QuizQuestionDto,
  ReorderLessonsDto,
  UpdateLessonDto,
  UpdateModuleDto,
  UpsertQuizDto,
} from "./dto/authoring.dto";

/**
 * Org-admin authoring for **org-private** modules (Module.orgId = actor's org).
 * The global library (orgId null) is Academy-authored (platform-side) and not editable here.
 *
 * Module/Lesson/Quiz are content — not PHI models — so the tenant guardrail
 * does not inject orgId; every method scopes ownership explicitly (the same
 * pattern as the video upload gate). Drafts are invisible to learners: the
 * learner read paths filter status = PUBLISHED.
 */
@Injectable()
export class AuthoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private requireOrgAdmin(actor: StaffContext) {
    if (actor.orgPermission !== "ORG_ADMIN") {
      throw new ForbiddenException("Org admin required");
    }
  }

  /** Own-org module or 404 — never reveals other orgs' (or global) content. */
  private async ownModule(actor: StaffContext, moduleId: string) {
    const mod = await this.prisma.module.findFirst({
      where: { id: moduleId, orgId: actor.orgId },
    });
    if (!mod) throw new NotFoundException("Module not found");
    return mod;
  }

  private async ownLesson(actor: StaffContext, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { id: true, orgId: true } } },
    });
    if (!lesson || lesson.module.orgId !== actor.orgId) {
      throw new NotFoundException("Lesson not found");
    }
    return lesson;
  }

  listModules(actor: StaffContext) {
    this.requireOrgAdmin(actor);
    return this.prisma.module.findMany({
      where: { orgId: actor.orgId },
      include: {
        _count: { select: { lessons: true } },
        quiz: { select: { id: true, passMark: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async createModule(actor: StaffContext, dto: CreateModuleDto) {
    this.requireOrgAdmin(actor);
    const base = dto.titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const slug = `${base || "module"}-${randomBytes(3).toString("hex")}`;

    const mod = await this.prisma.module.create({
      data: {
        orgId: actor.orgId,
        slug,
        titleEn: dto.titleEn,
        titleFr: dto.titleFr,
        descriptionEn: dto.descriptionEn,
        descriptionFr: dto.descriptionFr,
        durationMin: dto.durationMin,
        // Org-private modules are visible to the whole org regardless of
        // jurisdiction (the learner read path only jurisdiction-filters the
        // global library), so no jurisdiction stamp is needed.
        jurisdiction: null,
        status: "DRAFT",
      },
    });
    await this.audit.record({
      actorId: actor.userId,
      orgId: actor.orgId,
      action: "module.created",
      entityType: "Module",
      entityId: mod.id,
      payload: { slug: mod.slug },
    });
    return mod;
  }

  async getModule(actor: StaffContext, moduleId: string) {
    this.requireOrgAdmin(actor);
    await this.ownModule(actor, moduleId);
    return this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: { orderBy: { position: "asc" } },
        quiz: { include: { questions: { orderBy: { position: "asc" } } } },
      },
    });
  }

  async updateModule(actor: StaffContext, moduleId: string, dto: UpdateModuleDto) {
    this.requireOrgAdmin(actor);
    const mod = await this.ownModule(actor, moduleId);

    if (dto.status === "PUBLISHED" && mod.status !== "PUBLISHED") {
      const [lessonCount, quiz] = await Promise.all([
        this.prisma.lesson.count({ where: { moduleId } }),
        this.prisma.quiz.findUnique({
          where: { moduleId },
          include: { _count: { select: { questions: true } } },
        }),
      ]);
      if (lessonCount === 0 && (!quiz || quiz._count.questions === 0)) {
        throw new BadRequestException(
          "Add at least one lesson or a quiz before publishing",
        );
      }
    }

    const updated = await this.prisma.module.update({
      where: { id: moduleId },
      data: {
        titleEn: dto.titleEn,
        titleFr: dto.titleFr,
        descriptionEn: dto.descriptionEn,
        descriptionFr: dto.descriptionFr,
        durationMin: dto.durationMin,
        status: dto.status,
        publishedAt:
          dto.status === "PUBLISHED" && !mod.publishedAt
            ? new Date()
            : undefined,
      },
    });
    if (dto.status && dto.status !== mod.status) {
      await this.audit.record({
        actorId: actor.userId,
        orgId: actor.orgId,
        action: `module.${dto.status.toLowerCase()}`,
        entityType: "Module",
        entityId: moduleId,
      });
    }
    return updated;
  }

  async createLesson(actor: StaffContext, moduleId: string, dto: CreateLessonDto) {
    this.requireOrgAdmin(actor);
    await this.ownModule(actor, moduleId);
    const position = await this.prisma.lesson.count({ where: { moduleId } });
    return this.prisma.lesson.create({
      data: {
        moduleId,
        position,
        titleEn: dto.titleEn,
        titleFr: dto.titleFr,
        isPreview: dto.isPreview ?? false,
      },
    });
  }

  async updateLesson(actor: StaffContext, lessonId: string, dto: UpdateLessonDto) {
    await this.requireAdminLesson(actor, lessonId);
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        titleEn: dto.titleEn,
        titleFr: dto.titleFr,
        isPreview: dto.isPreview,
      },
    });
  }

  async deleteLesson(actor: StaffContext, lessonId: string) {
    const lesson = await this.requireAdminLesson(actor, lessonId);
    await this.prisma.$transaction(async (tx) => {
      await tx.lesson.delete({ where: { id: lessonId } });
      // Compact positions so ordering stays dense. Ascending order is safe:
      // each row moves into the slot just freed below it.
      const rest = await tx.lesson.findMany({
        where: { moduleId: lesson.moduleId, position: { gt: lesson.position } },
        orderBy: { position: "asc" },
        select: { id: true, position: true },
      });
      for (const l of rest) {
        await tx.lesson.update({
          where: { id: l.id },
          data: { position: l.position - 1 },
        });
      }
    });
    return { ok: true };
  }

  async reorderLessons(
    actor: StaffContext,
    moduleId: string,
    dto: ReorderLessonsDto,
  ) {
    this.requireOrgAdmin(actor);
    await this.ownModule(actor, moduleId);
    const existing = await this.prisma.lesson.findMany({
      where: { moduleId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((l) => l.id));
    if (
      dto.lessonIds.length !== existingIds.size ||
      !dto.lessonIds.every((id) => existingIds.has(id))
    ) {
      throw new BadRequestException(
        "lessonIds must be exactly the module's lessons",
      );
    }
    // Two-phase to dodge the (moduleId, position) unique constraint.
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < dto.lessonIds.length; i++) {
        await tx.lesson.update({
          where: { id: dto.lessonIds[i] },
          data: { position: i + 10_000 },
        });
      }
      for (let i = 0; i < dto.lessonIds.length; i++) {
        await tx.lesson.update({
          where: { id: dto.lessonIds[i] },
          data: { position: i },
        });
      }
    });
    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { position: "asc" },
    });
  }

  async upsertQuiz(actor: StaffContext, moduleId: string, dto: UpsertQuizDto) {
    this.requireOrgAdmin(actor);
    await this.ownModule(actor, moduleId);
    this.validateQuestions(dto.questions);

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.upsert({
        where: { moduleId },
        create: {
          moduleId,
          passMark: dto.passMark,
          randomize: dto.randomize ?? true,
        },
        update: { passMark: dto.passMark, randomize: dto.randomize ?? true },
      });
      // Whole-quiz replace: authoring edits the quiz as one form. Historical
      // attempts keep their response snapshots; scoring happens at submit time.
      await tx.question.deleteMany({ where: { quizId: quiz.id } });
      for (let i = 0; i < dto.questions.length; i++) {
        const q = dto.questions[i];
        await tx.question.create({
          data: {
            quizId: quiz.id,
            position: i,
            promptEn: q.promptEn,
            promptFr: q.promptFr,
            type: q.type,
            choicesEn: q.choicesEn,
            choicesFr: q.choicesFr,
            correctIdx: q.correctIdx,
            explainEn: q.explainEn ?? null,
            explainFr: q.explainFr ?? null,
          },
        });
      }
      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: { questions: { orderBy: { position: "asc" } } },
      });
    });
  }

  private validateQuestions(questions: QuizQuestionDto[]) {
    questions.forEach((q, i) => {
      const label = `question ${i + 1}`;
      if (q.choicesEn.length !== q.choicesFr.length) {
        throw new BadRequestException(
          `${label}: choicesEn and choicesFr must have the same length`,
        );
      }
      if (q.type === "TRUE_FALSE" && q.choicesEn.length !== 2) {
        throw new BadRequestException(
          `${label}: TRUE_FALSE needs exactly 2 choices`,
        );
      }
      const max = q.choicesEn.length - 1;
      if (q.correctIdx.some((c) => c > max)) {
        throw new BadRequestException(
          `${label}: correctIdx out of range for its choices`,
        );
      }
      if (new Set(q.correctIdx).size !== q.correctIdx.length) {
        throw new BadRequestException(`${label}: duplicate correctIdx entries`);
      }
      if (q.type !== "MULTIPLE" && q.correctIdx.length !== 1) {
        throw new BadRequestException(
          `${label}: ${q.type} needs exactly one correct answer`,
        );
      }
    });
  }

  private async requireAdminLesson(actor: StaffContext, lessonId: string) {
    this.requireOrgAdmin(actor);
    return this.ownLesson(actor, lessonId);
  }
}
