import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  RetentionScheduler,
  SCHEDULE_TIMEOUT_MS,
  RETRY_BASE_MS,
} from "./retention.scheduler";

/**
 * This hook runs inside `app.listen()`, before the port is bound, and it is the
 * only boot hook in the app that talks to Redis. On 2026-09-09 that made a
 * deleted Redis able to stop the API from starting at all — non-deterministically,
 * which was the worst part: a container that lost the race against DigitalOcean's
 * ~90s readiness window died, one that won it came up and merely degraded.
 *
 * These tests pin the guarantee that replaced that: boot completes, bounded,
 * whatever Redis does.
 */
describe("RetentionScheduler — boot must not depend on Redis", () => {
  let queue: { add: ReturnType<typeof vi.fn> };
  let scheduler: RetentionScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    queue = { add: vi.fn().mockResolvedValue({ id: "retention-nightly" }) };
    scheduler = new RetentionScheduler(queue as never);
  });

  afterEach(() => {
    scheduler.onModuleDestroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("schedules the repeatable sweep when Redis is healthy", async () => {
    await scheduler.onApplicationBootstrap();

    expect(queue.add).toHaveBeenCalledTimes(1);
    const [name, payload, opts] = queue.add.mock.calls[0];
    expect(name).toBe("sweep");
    expect(payload).toEqual({});
    expect(opts).toMatchObject({
      jobId: "retention-nightly",
      repeat: { pattern: "0 3 * * *", tz: "America/Moncton" },
    });
  });

  it("does not throw when Redis REFUSES — boot continues", async () => {
    queue.add.mockRejectedValue(new Error("getaddrinfo ENOTFOUND redis.host"));

    // The assertion is simply that this resolves. If it rejects, the unhandled
    // rejection reaches main.ts's bootstrap() and the process dies before
    // binding the port.
    await expect(scheduler.onApplicationBootstrap()).resolves.toBeUndefined();
  });

  it("does not hang when Redis HANGS — boot continues within the timeout", async () => {
    // The case catching alone would not cover: ioredis buffers the command in
    // its offline queue and the promise never settles.
    queue.add.mockReturnValue(new Promise(() => {}));

    const boot = scheduler.onApplicationBootstrap();
    let settled = false;
    void boot.then(() => {
      settled = true;
    });

    // Still waiting just before the deadline...
    await vi.advanceTimersByTimeAsync(SCHEDULE_TIMEOUT_MS - 1);
    expect(settled).toBe(false);

    // ...and released at it, rather than blocking startup indefinitely.
    await vi.advanceTimersByTimeAsync(2);
    await expect(boot).resolves.toBeUndefined();
    expect(settled).toBe(true);
  });

  it("never leaves an abandoned rejection to kill the process", async () => {
    // A promise that rejects AFTER we stopped waiting on it. Without the
    // internal .catch() this is an unhandled rejection — the exact failure
    // mode being designed out.
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);

    queue.add.mockReturnValue(
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("late failure")), SCHEDULE_TIMEOUT_MS * 2),
      ),
    );

    const boot = scheduler.onApplicationBootstrap();
    await vi.advanceTimersByTimeAsync(SCHEDULE_TIMEOUT_MS + 1);
    await boot;
    await vi.advanceTimersByTimeAsync(SCHEDULE_TIMEOUT_MS * 2);
    await Promise.resolve();

    expect(unhandled).not.toHaveBeenCalled();
    process.off("unhandledRejection", unhandled);
  });

  it("retries in the background and schedules once Redis returns", async () => {
    // Retention is a data-retention obligation — failing quietly forever would
    // trade a loud outage for a silent compliance gap.
    queue.add.mockRejectedValueOnce(new Error("ENOTFOUND"));

    await scheduler.onApplicationBootstrap();
    expect(queue.add).toHaveBeenCalledTimes(1);

    queue.add.mockResolvedValue({ id: "retention-nightly" });
    await vi.advanceTimersByTimeAsync(RETRY_BASE_MS + 1);

    expect(queue.add).toHaveBeenCalledTimes(2);
  });

  it("backs off between retries instead of hammering a dead Redis", async () => {
    queue.add.mockRejectedValue(new Error("ENOTFOUND"));

    await scheduler.onApplicationBootstrap();
    expect(queue.add).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(RETRY_BASE_MS + 1);
    expect(queue.add).toHaveBeenCalledTimes(2);

    // Second retry waits twice as long — not due yet at the base interval.
    await vi.advanceTimersByTimeAsync(RETRY_BASE_MS + 1);
    expect(queue.add).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(RETRY_BASE_MS + 1);
    expect(queue.add).toHaveBeenCalledTimes(3);
  });

  it("stops retrying once the module is destroyed", async () => {
    queue.add.mockRejectedValue(new Error("ENOTFOUND"));
    await scheduler.onApplicationBootstrap();

    scheduler.onModuleDestroy();
    await vi.advanceTimersByTimeAsync(RETRY_BASE_MS * 10);

    expect(queue.add).toHaveBeenCalledTimes(1);
  });
});
