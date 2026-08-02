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
 * Per-question outcome returned after a submit. The answer key (correctIdx +
 * explanations) is only populated when review is unlocked — the learner passed,
 * or has used all their attempts. On a failed attempt with retries remaining we
 * return correctness only, so the certificate can't be earned by copying the
 * key off one throwaway attempt.
 */
export type QuestionResult = {
  questionId: string;
  correct: boolean;
  correctIdx?: number[];
  explainEn?: string | null;
  explainFr?: string | null;
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
   * Quiz gate: every consumable lesson of the module must be completed by this
   * staff before an attempt may start or be submitted. A lesson is consumable
   * once it has a READY video OR a readable body; a lesson that is still fully
   * content-pending (no video, no body) can't be consumed, so it doesn't block.
   * Enforced server-side on both start and submit — the UI lock alone would
   * be trivial to bypass for a product whose output is a compliance record.
   */
  private async assertLessonsComplete(moduleId: string, staffId: string) {
    const required = await this.prisma.lesson.findMany({
      where: {
        moduleId,
        OR: [{ videoStatus: "READY" }, { bodyEn: { not: null } }],
      },
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

    // Score: a question is correct when the selected indices match correctIdx
    // exactly. Iterate questions (not just responses) so unanswered questions
    // count as incorrect and appear in the review.
    const selectionByQ = new Map(
      input.responses.map((r) => [r.questionId, r.selectedIdx]),
    );
    const correctByQ = new Map<string, boolean>();
    let correct = 0;
    for (const q of quiz.questions) {
      const expected = (q.correctIdx as number[]).slice().sort();
      const got = (selectionByQ.get(q.id) ?? []).slice().sort();
      const same =
        expected.length === got.length &&
        expected.every((v, i) => v === got[i]);
      correctByQ.set(q.id, same);
      if (same) correct++;
    }
    const scorePct =
      quiz.questions.length === 0
        ? 0
        : Math.round((correct / quiz.questions.length) * 100);
    const passed = scorePct >= quiz.passMark;
    const submittedAt = new Date();

    // Review-reveal policy (compliance integrity): only hand back the answer key
    // once the learner has passed or exhausted their attempts. Otherwise return
    // correctness only, so a failed attempt can't be used to farm the answers.
    // (The attempt count is only needed on the failing path — short-circuit it.)
    const reviewRevealed =
      passed ||
      (await this.prisma.attempt.count({
        where: { assignmentId: attempt.assignmentId },
      })) >= MAX_ATTEMPTS_PER_ASSIGNMENT;
    const results: QuestionResult[] = quiz.questions.map((q) =>
      reviewRevealed
        ? {
            questionId: q.id,
            correct: correctByQ.get(q.id) ?? false,
            correctIdx: q.correctIdx as number[],
            explainEn: q.explainEn ?? null,
            explainFr: q.explainFr ?? null,
          }
        : { questionId: q.id, correct: correctByQ.get(q.id) ?? false },
    );

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

    return { ...updated, reviewRevealed, results };
  }
}
