import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LessonProgressService } from "./lesson-progress.service";
import type { Jurisdiction } from "@prisma/client";

@Injectable()
export class ModulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: LessonProgressService,
  ) {}

  /**
   * The training library visible to staff at a given org. Includes:
   *   - global library modules matching the org's jurisdiction (or unscoped)
   *   - modules authored privately by this org
   * Excludes drafts and archived.
   */
  async listForOrg(orgId: string, jurisdiction: Jurisdiction) {
    const modules = await this.prisma.module.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { orgId },
          {
            orgId: null,
            OR: [{ jurisdiction: null }, { jurisdiction }],
          },
        ],
      },
      include: { _count: { select: { lessons: true } } },
      orderBy: { titleEn: "asc" },
    });

    return modules.map((m) => ({
      id: m.id,
      slug: m.slug,
      titleEn: m.titleEn,
      titleFr: m.titleFr,
      descriptionEn: m.descriptionEn,
      descriptionFr: m.descriptionFr,
      durationMin: m.durationMin,
      jurisdiction: m.jurisdiction,
      lessonCount: m._count.lessons,
      isOrgPrivate: m.orgId !== null,
    }));
  }

  async getBySlug(
    slug: string,
    orgId: string,
    jurisdiction: Jurisdiction,
    staffId?: string,
  ) {
    const module = await this.prisma.module.findUnique({
      where: { slug },
      include: { lessons: { orderBy: { position: "asc" } }, quiz: true },
    });
    if (
      !module ||
      module.status !== "PUBLISHED" ||
      (module.orgId !== null && module.orgId !== orgId) ||
      (module.orgId === null &&
        module.jurisdiction !== null &&
        module.jurisdiction !== jurisdiction)
    ) {
      throw new NotFoundException(`Module ${slug} not found`);
    }

    // Per-staff lesson completion + the quiz gate. A lesson gates the quiz once
    // it has consumable content — a READY video OR a readable body. A lesson
    // that is still fully content-pending (no video, no body) can't be consumed,
    // so it must not lock the learner out (mirrors AssignmentsService's server
    // gate). Note: `[].every()` is true, so a module with no gating lessons at
    // all leaves the quiz open — but the starter library seeds a body on every
    // lesson, so that vacuous case no longer surfaces a bare quiz.
    const completed = staffId
      ? await this.progress.forModule(module.id, staffId)
      : new Map<string, Date>();
    const lessons = module.lessons.map((l) => ({
      ...l,
      completedAt: completed.get(l.id) ?? null,
    }));
    const gatesQuiz = (l: (typeof lessons)[number]) =>
      l.videoStatus === "READY" || l.bodyEn !== null;
    const quizUnlocked = lessons
      .filter(gatesQuiz)
      .every((l) => l.completedAt !== null);

    return { ...module, lessons, quizUnlocked };
  }
}
