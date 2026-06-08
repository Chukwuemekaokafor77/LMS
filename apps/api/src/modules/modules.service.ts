import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Jurisdiction } from "@prisma/client";

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getBySlug(slug: string, orgId: string, jurisdiction: Jurisdiction) {
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
    return module;
  }
}
