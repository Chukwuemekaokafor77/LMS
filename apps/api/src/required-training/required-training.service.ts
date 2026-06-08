import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  TrainingCadence,
  type Jurisdiction,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { QUEUES } from "../queue/queue.module";
import type { StaffContext } from "../tenant/tenant.types";

export type CreateRequiredTrainingInput = {
  roleCode: string;
  moduleId: string;
  cadence: TrainingCadence;
  graceDays?: number;
  siteId?: string | null;
};

@Injectable()
export class RequiredTrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @InjectQueue(QUEUES.materialize) private readonly materializeQ: Queue,
  ) {}

  async list(actor: StaffContext) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Admin required");
    }
    return this.prisma.requiredTraining.findMany({
      where: {
        orgId: actor.orgId,
        ...(actor.orgPermission === "SITE_ADMIN" && actor.siteId
          ? { OR: [{ siteId: actor.siteId }, { siteId: null }] }
          : {}),
      },
      include: {
        module: { select: { slug: true, titleEn: true, titleFr: true } },
        role: { select: { code: true, labelEn: true } },
        site: { select: { id: true, name: true } },
      },
      orderBy: [{ roleCode: "asc" }, { moduleId: "asc" }],
    });
  }

  async create(actor: StaffContext, input: CreateRequiredTrainingInput) {
    if (actor.orgPermission !== "ORG_ADMIN") {
      throw new ForbiddenException("Org admin required");
    }
    const role = await this.prisma.role.findUnique({
      where: { code: input.roleCode },
    });
    if (!role || role.jurisdiction !== actor.jurisdiction) {
      throw new BadRequestException("Role does not match org jurisdiction");
    }
    const mod = await this.prisma.module.findUnique({
      where: { id: input.moduleId },
    });
    if (!mod || mod.status !== "PUBLISHED") {
      throw new BadRequestException("Module not available");
    }
    if (mod.orgId !== null && mod.orgId !== actor.orgId) {
      throw new ForbiddenException("Module belongs to a different org");
    }
    if (input.siteId) {
      const site = await this.prisma.site.findUnique({
        where: { id: input.siteId },
      });
      if (!site || site.orgId !== actor.orgId) {
        throw new BadRequestException("Site not in your org");
      }
    }

    const rt = await this.prisma.requiredTraining.create({
      data: {
        orgId: actor.orgId,
        siteId: input.siteId ?? null,
        roleCode: input.roleCode,
        moduleId: input.moduleId,
        cadence: input.cadence,
        graceDays: input.graceDays ?? 30,
        jurisdiction: actor.jurisdiction as Jurisdiction,
      },
    });

    await this.audit.record({
      actorId: actor.staffId,
      orgId: actor.orgId,
      action: "required_training.created",
      entityType: "RequiredTraining",
      entityId: rt.id,
      payload: input as unknown as Record<string, unknown>,
    });

    await this.materializeQ.add("materialize", { requiredTrainingId: rt.id });
    return rt;
  }

  async remove(actor: StaffContext, id: string) {
    if (actor.orgPermission !== "ORG_ADMIN") {
      throw new ForbiddenException("Org admin required");
    }
    const rt = await this.prisma.requiredTraining.findUnique({
      where: { id },
    });
    if (!rt || rt.orgId !== actor.orgId) throw new NotFoundException();
    await this.prisma.requiredTraining.delete({ where: { id } });
    await this.audit.record({
      actorId: actor.staffId,
      orgId: actor.orgId,
      action: "required_training.deleted",
      entityType: "RequiredTraining",
      entityId: id,
    });
    return { ok: true };
  }
}
