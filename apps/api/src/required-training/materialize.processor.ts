import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Queue, type Job } from "bullmq";
import { TrainingCadence } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { QUEUES } from "../queue/queue.module";
import { runAsSystem } from "../tenant/tenant-context";

type Jobs =
  | { name: "materialize"; data: { requiredTrainingId: string } }
  | {
      name: "materialize-for-staff";
      data: { staffId: string };
    };

const CADENCE_DAYS: Record<TrainingCadence, number | null> = {
  ONCE: null,
  ANNUAL: 365,
  TWO_YEARS: 730,
  THREE_YEARS: 1095,
};

@Processor(QUEUES.materialize)
export class MaterializeProcessor extends WorkerHost {
  private readonly log = new Logger(MaterializeProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUES.email) private readonly emailQ: Queue,
  ) {
    super();
  }

  async process(job: Job<Jobs["data"]>): Promise<void> {
    // Background job (no HTTP context). Each branch operates within one org
    // (derived from the RequiredTraining/Staff it looks up) and writes orgId
    // explicitly on every Assignment it creates. Runs as system.
    await runAsSystem(async () => {
      if (job.name === "materialize") {
        await this.materializeForRequiredTraining(
          (job.data as { requiredTrainingId: string }).requiredTrainingId,
        );
      } else if (job.name === "materialize-for-staff") {
        await this.materializeForNewStaff(
          (job.data as { staffId: string }).staffId,
        );
      } else {
        this.log.warn(`Unknown materialize job ${job.name}`);
      }
    });
  }

  /** Walk every staff matching the role+site, create initial Assignment if missing. */
  private async materializeForRequiredTraining(rtId: string) {
    const rt = await this.prisma.requiredTraining.findUnique({
      where: { id: rtId },
    });
    if (!rt) return;

    const staff = await this.prisma.staff.findMany({
      where: {
        orgId: rt.orgId,
        roleCode: rt.roleCode,
        endedAt: null,
        ...(rt.siteId ? { siteId: rt.siteId } : {}),
      },
      select: { id: true },
    });

    for (const s of staff) {
      await this.ensureAssignment({
        orgId: rt.orgId,
        staffId: s.id,
        moduleId: rt.moduleId,
        requiredTrainingId: rt.id,
        graceDays: rt.graceDays,
        cadence: rt.cadence,
      });
    }
  }

  /** Backfill all RequiredTraining for a newly-created staff. */
  private async materializeForNewStaff(staffId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff) return;
    const rts = await this.prisma.requiredTraining.findMany({
      where: {
        orgId: staff.orgId,
        roleCode: staff.roleCode,
        OR: [{ siteId: null }, { siteId: staff.siteId ?? undefined }],
      },
    });
    for (const rt of rts) {
      await this.ensureAssignment({
        orgId: staff.orgId,
        staffId: staff.id,
        moduleId: rt.moduleId,
        requiredTrainingId: rt.id,
        graceDays: rt.graceDays,
        cadence: rt.cadence,
      });
    }
  }

  /**
   * Idempotently create the initial Assignment for a staff×required-training.
   *
   * Materialization must be safe to re-run (jobs retry; an admin may re-save a
   * RequiredTraining) — but `dueAt` is `now + graceDays`, so the
   * `@@unique([staffId, moduleId, dueAt])` constraint can't catch a re-run that
   * lands on a different millisecond (LMS-M5). So we dedupe explicitly: if the
   * staff already has a *current* assignment (ASSIGNED/IN_PROGRESS/COMPLETED)
   * for this required-training, do nothing. A renewal after the prior lapses
   * (EXPIRED/REVOKED) is still allowed. The unique constraint remains as a
   * race backstop.
   */
  private async ensureAssignment(args: {
    orgId: string;
    staffId: string;
    moduleId: string;
    requiredTrainingId: string;
    graceDays: number;
    cadence: TrainingCadence;
  }): Promise<void> {
    const existing = await this.prisma.assignment.findFirst({
      where: {
        staffId: args.staffId,
        requiredTrainingId: args.requiredTrainingId,
        status: { in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
      },
      select: { id: true },
    });
    if (existing) return;

    const dueAt = new Date(Date.now() + args.graceDays * 86_400_000);
    const cadenceDays = CADENCE_DAYS[args.cadence];
    try {
      const a = await this.prisma.assignment.create({
        data: {
          orgId: args.orgId,
          staffId: args.staffId,
          moduleId: args.moduleId,
          requiredTrainingId: args.requiredTrainingId,
          dueAt,
          expiresAt:
            cadenceDays === null
              ? null
              : new Date(dueAt.getTime() + cadenceDays * 86_400_000),
        },
      });
      await this.emailQ.add("assignment.assigned", { assignmentId: a.id });
    } catch (e) {
      // Race backstop: a concurrent run created it between our check and insert.
      if ((e as { code?: string }).code !== "P2002") {
        this.log.error(
          `Failed to create assignment for staff ${args.staffId}`,
          e as Error,
        );
      }
    }
  }
}
