import * as Sentry from "@sentry/node";
import type { Job } from "bullmq";

/**
 * Reports a BullMQ job's FINAL failure to Sentry. Background jobs throw outside
 * the HTTP request path, so the SentryInterceptor never sees them — this closes
 * that gap for the cert-issuance, email, roster, retention, materialize, and
 * (the ElderCare↔Academy seam) credential-flow-back workers.
 *
 * Only the last exhausted attempt is reported — intermediate retries are skipped
 * so a job with backoff doesn't fan out N events per real failure. No-op when
 * Sentry isn't configured (no SENTRY_DSN).
 */
export function captureJobFailure(
  queue: string,
  job: Job | undefined,
  err: unknown,
): void {
  if (!Sentry.getClient()) return;

  const maxAttempts = job?.opts?.attempts ?? 1;
  const attemptsMade = job?.attemptsMade ?? 1;
  if (attemptsMade < maxAttempts) return; // will retry — wait until exhausted

  Sentry.captureException(err, {
    tags: { queue, job: job?.name ?? "unknown" },
    extra: { jobId: job?.id, attemptsMade, maxAttempts },
  });
}
