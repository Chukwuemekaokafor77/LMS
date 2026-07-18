import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { createHash } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { QUEUES } from "../queue/queue.module";

type SubmissionResponse = {
  questionId: string;
  selectedIdx: number[];
};

/**
 * Owner decision (2026-07-17): quiz attempts are capped at 5 per assignment.
 * An attempt is consumed when it is started; already-started attempts may
 * still be submitted. A renewal (new assignment from cadence) gets a fresh 5.
 */
export const MAX_ATTEMPTS_PER_ASSIGNMENT = 5;

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @InjectQueue(QUEUES.certificate) private readonly certQ: Queue,
    @InjectQueue(QUEUES.email) private readonly emailQ: Queue,
  ) {}

  async getForStaff(assignmentId: string, staffId: string) {
    const a = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: {
          include: {
            lessons: { orderBy: { position: "asc" } },
            quiz: {
              include: {
                // Learner-facing read: never ship the answer key. correctIdx /
                // explain* stay server-side — scoring re-reads them internally
                // in submitAttempt.
                questions: {
                  orderBy: { position: "asc" },
                  select: {
                    id: true,
                    promptEn: true,
                    promptFr: true,
                    type: true,
                    choicesEn: true,
                    choicesFr: true,
                    position: true,
                  },
                },
              },
            },
          },
        },
        attempts: { orderBy: { startedAt: "desc" } },
        certificate: true,
      },
    });
    if (!a) throw new NotFoundException();
    if (a.staffId !== staffId) throw new ForbiddenException();
    return { ...a, maxAttempts: MAX_ATTEMPTS_PER_ASSIGNMENT };
  }

  /**
   * Quiz gate: every lesson of the module with a READY video must be completed
   * by this staff before an attempt may start or be submitted. Lessons whose
   * video is still pending/processing can't be watched, so they don't block.
   * Enforced server-side on both start and submit — the UI lock alone would
   * be trivial to bypass for a product whose output is a compliance record.
   */
  private async assertLessonsComplete(moduleId: string, staffId: string) {
    const required = await this.prisma.lesson.findMany({
      where: { moduleId, videoStatus: "READY" },
      select: { id: true },
    });
    if (required.length === 0) return;
    const done = await this.prisma.lessonProgress.count({
      where: { staffId, lessonId: { in: required.map((l) => l.id) } },
    });
    if (done < required.length) {
      throw new BadRequestException(
        "All lessons must be completed before taking the quiz",
      );
    }
  }

  async startAttempt(assignmentId: string, staffId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { staff: true },
    });
    if (!assignment) throw new NotFoundException();
    if (assignment.staffId !== staffId) throw new ForbiddenException();
    if (assignment.status === "COMPLETED" || assignment.status === "REVOKED") {
      throw new BadRequestException(`Assignment ${assignment.status.toLowerCase()}`);
    }
    const used = await this.prisma.attempt.count({
      where: { assignmentId },
    });
    if (used >= MAX_ATTEMPTS_PER_ASSIGNMENT) {
      throw new BadRequestException(
        `Attempt limit reached (${MAX_ATTEMPTS_PER_ASSIGNMENT} of ${MAX_ATTEMPTS_PER_ASSIGNMENT} used)`,
      );
    }
    await this.assertLessonsComplete(assignment.moduleId, staffId);
    const attempt = await this.prisma.attempt.create({
      data: { 
        assignmentId,
        orgId: assignment.staff.orgId,
      },
    });
    await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "IN_PROGRESS" },
    });
    return attempt;
  }

  async submitAttempt(input: {
    attemptId: string;
    staffId: string;
    responses: SubmissionResponse[];
    ip?: string;
    userAgent?: string;
  }) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: input.attemptId },
      include: {
        assignment: {
          include: {
            module: {
              include: {
                quiz: { include: { questions: true } },
              },
            },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException();
    if (attempt.assignment.staffId !== input.staffId) {
      throw new ForbiddenException();
    }
    if (attempt.submittedAt) {
      throw new BadRequestException("Attempt already submitted");
    }
    const quiz = attempt.assignment.module.quiz;
    if (!quiz) throw new BadRequestException("Module has no quiz");

    await this.assertLessonsComplete(
      attempt.assignment.moduleId,
      input.staffId,
    );

    // Score: percent of questions where selected indices match correctIdx exactly.
    const byId = new Map(quiz.questions.map((q) => [q.id, q]));
    let correct = 0;
    for (const r of input.responses) {
      const q = byId.get(r.questionId);
      if (!q) continue;
      const expected = (q.correctIdx as number[]).slice().sort();
      const got = r.selectedIdx.slice().sort();
      const same =
        expected.length === got.length &&
        expected.every((v, i) => v === got[i]);
      if (same) correct++;
    }
    const scorePct =
      quiz.questions.length === 0
        ? 0
        : Math.round((correct / quiz.questions.length) * 100);
    const passed = scorePct >= quiz.passMark;
    const submittedAt = new Date();

    // Tamper-evident attestation: SHA-256 over a canonical string.
    const hash = createHash("sha256")
      .update(
        [
          attempt.assignment.staffId,
          attempt.assignment.moduleId,
          submittedAt.toISOString(),
          String(scorePct),
          passed ? "PASS" : "FAIL",
        ].join("|"),
      )
      .digest("hex");

    const updated = await this.prisma.$transaction(async (tx) => {
      const a = await tx.attempt.update({
        where: { id: attempt.id },
        data: {
          submittedAt,
          scorePct,
          passed,
          attestationIp: input.ip ?? null,
          attestationUa: input.userAgent ?? null,
          attestationHash: hash,
          responses: input.responses as unknown as object,
        },
      });
      if (passed) {
        await tx.assignment.update({
          where: { id: attempt.assignmentId },
          data: { status: "COMPLETED", completedAt: submittedAt },
        });
      }
      return a;
    });

    // AuditEvent.actorId is a User id (LMS-M4), so resolve the staff's userId.
    const actorStaff = await this.prisma.staff.findUnique({
      where: { id: input.staffId },
      select: { userId: true, orgId: true },
    });
    await this.audit.record({
      actorId: actorStaff?.userId ?? null,
      orgId: actorStaff?.orgId ?? null,
      action: passed ? "assignment.completed" : "assignment.attempt_failed",
      entityType: "Assignment",
      entityId: attempt.assignmentId,
      payload: { scorePct, attemptId: attempt.id, hash },
      ip: input.ip,
      userAgent: input.userAgent,
    });

    if (passed) {
      await this.certQ.add("issue", { assignmentId: attempt.assignmentId });
    }

    return updated;
  }
}
