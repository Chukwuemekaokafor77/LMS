import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { QUEUES } from "../queue/queue.module";

/** How long boot will wait for Redis before giving up and carrying on. */
export const SCHEDULE_TIMEOUT_MS = 5_000;
/** First retry delay; doubles each attempt, capped at RETRY_MAX_MS. */
export const RETRY_BASE_MS = 30_000;
export const RETRY_MAX_MS = 5 * 60_000;

/**
 * Schedules the nightly retention sweep on app boot. Idempotent — BullMQ
 * upserts the repeatable by jobId.
 *
 * ⚠️ This runs in `onApplicationBootstrap`, which Nest awaits INSIDE
 * `app.listen()`, before the port is bound. It is the only boot hook in the
 * app that talks to Redis, which made it the single point where a Redis
 * outage could stop the API from starting at all.
 *
 * That is what happened on 2026-09-09: the queue's Redis had been deleted, and
 * the deploy triggered by the next push never bound :4000 and failed every
 * readiness probe. Worse, it was not deterministic — a container that lost the
 * race against the ~90s readiness window died, while one that won it came up
 * and merely degraded. "Sometimes bricks the deploy" is the hardest kind of
 * failure to reason about.
 *
 * Scheduling is therefore best-effort and bounded:
 *  - it can never throw, so it cannot take the process down (main.ts's
 *    `bootstrap()` rejection would kill it before `listen`),
 *  - it can never block boot for more than SCHEDULE_TIMEOUT_MS, so a Redis
 *    that hangs rather than refuses cannot stall startup either,
 *  - it retries in the background, because the sweep is a data-retention
 *    obligation and quietly never scheduling it would be its own bug. When
 *    Redis comes back the sweep is scheduled without needing a restart.
 *
 * Redis being down now degrades the app predictably: the API serves, and the
 * queue-backed features fail loudly on their own. `/health/deps` is where that
 * becomes visible — see HealthController.
 */
@Injectable()
export class RetentionScheduler
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly log = new Logger(RetentionScheduler.name);
  private retryTimer?: NodeJS.Timeout;
  private stopped = false;

  constructor(
    @InjectQueue(QUEUES.retention) private readonly queue: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.trySchedule(1);
  }

  /** Never throws, and never waits longer than SCHEDULE_TIMEOUT_MS. */
  private async trySchedule(attempt: number): Promise<void> {
    try {
      const add = this.queue.add(
        "sweep",
        {},
        {
          jobId: "retention-nightly",
          repeat: { pattern: "0 3 * * *", tz: "America/Moncton" },
          removeOnComplete: 30,
          removeOnFail: 30,
        },
      );
      // On timeout we stop waiting, but the promise keeps running — and an
      // abandoned rejected promise is an unhandled rejection, which is exactly
      // what used to kill the process. Neutralise it.
      add.catch(() => undefined);

      await Promise.race([add, this.timeout()]);

      this.log.log("Retention sweep scheduled for 03:00 America/Moncton");
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.log.error(
        `Could not schedule the retention sweep (attempt ${attempt}): ${reason}. ` +
          "The API is starting anyway and will retry in the background. " +
          "The nightly sweep will NOT run until this succeeds.",
      );
      this.scheduleRetry(attempt);
    }
  }

  private timeout(): Promise<never> {
    return new Promise<never>((_, reject) => {
      const t = setTimeout(
        () => reject(new Error(`timed out after ${SCHEDULE_TIMEOUT_MS}ms`)),
        SCHEDULE_TIMEOUT_MS,
      );
      // Never hold the event loop open for a timer nobody is waiting on.
      t.unref?.();
    });
  }

  private scheduleRetry(lastAttempt: number) {
    if (this.stopped) return;
    const delay = Math.min(
      RETRY_BASE_MS * 2 ** (lastAttempt - 1),
      RETRY_MAX_MS,
    );
    this.retryTimer = setTimeout(() => {
      void this.trySchedule(lastAttempt + 1);
    }, delay);
    this.retryTimer.unref?.();
  }

  onModuleDestroy() {
    this.stopped = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }
}
