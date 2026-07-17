import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssignmentsService } from "./assignments.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { Queue } from "bullmq";

describe("AssignmentsService Scoring Logic", () => {
  let service: AssignmentsService;
  let prisma: any;
  let audit: any;
  let certQ: any;
  let emailQ: any;

  beforeEach(() => {
    prisma = {
      attempt: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      assignment: {
        update: vi.fn(),
      },
      staff: {
        findUnique: vi.fn(),
      },
      // No READY lessons → the lesson-completion quiz gate is vacuous here.
      // The gated paths are covered for real in test/lesson-gate.e2e-spec.ts.
      lesson: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      lessonProgress: {
        count: vi.fn().mockResolvedValue(0),
      },
      $transaction: vi.fn((cb) => cb(prisma)),
    };
    audit = { record: vi.fn() };
    certQ = { add: vi.fn() };
    emailQ = { add: vi.fn() };

    service = new AssignmentsService(prisma as any, audit as any, certQ as any, emailQ as any);
  });

  it("should calculate 100% score for all correct answers", async () => {
    const mockAttempt = {
      id: "att-1",
      submittedAt: null,
      assignment: {
        staffId: "staff-1",
        moduleId: "mod-1",
        module: {
          quiz: {
            passMark: 80,
            questions: [
              { id: "q1", correctIdx: [0] },
              { id: "q2", correctIdx: [1, 2] },
            ],
          },
        },
      },
    };

    prisma.attempt.findUnique.mockResolvedValue(mockAttempt);
    prisma.staff.findUnique.mockResolvedValue({ orgId: "org-1" });

    const result = await service.submitAttempt({
      attemptId: "att-1",
      staffId: "staff-1",
      responses: [
        { questionId: "q1", selectedIdx: [0] },
        { questionId: "q2", selectedIdx: [1, 2] },
      ],
    });

    expect(prisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scorePct: 100,
          passed: true,
        }),
      })
    );
  });

  it("should calculate 50% score and mark as failed if below passMark", async () => {
    const mockAttempt = {
      id: "att-1",
      submittedAt: null,
      assignment: {
        staffId: "staff-1",
        moduleId: "mod-1",
        module: {
          quiz: {
            passMark: 80,
            questions: [
              { id: "q1", correctIdx: [0] },
              { id: "q2", correctIdx: [1] },
            ],
          },
        },
      },
    };

    prisma.attempt.findUnique.mockResolvedValue(mockAttempt);
    prisma.staff.findUnique.mockResolvedValue({ orgId: "org-1" });

    await service.submitAttempt({
      attemptId: "att-1",
      staffId: "staff-1",
      responses: [
        { questionId: "q1", selectedIdx: [0] },
        { questionId: "q2", selectedIdx: [0] }, // WRONG
      ],
    });

    expect(prisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scorePct: 50,
          passed: false,
        }),
      })
    );
  });

  it("should handle empty responses as 0% score", async () => {
    const mockAttempt = {
      id: "att-1",
      submittedAt: null,
      assignment: {
        staffId: "staff-1",
        moduleId: "mod-1",
        module: {
          quiz: {
            passMark: 80,
            questions: [{ id: "q1", correctIdx: [0] }],
          },
        },
      },
    };

    prisma.attempt.findUnique.mockResolvedValue(mockAttempt);
    prisma.staff.findUnique.mockResolvedValue({ orgId: "org-1" });

    await service.submitAttempt({
      attemptId: "att-1",
      staffId: "staff-1",
      responses: [],
    });

    expect(prisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scorePct: 0,
          passed: false,
        }),
      })
    );
  });
});
