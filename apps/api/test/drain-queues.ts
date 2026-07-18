import { Queue } from "bullmq";
import { QUEUES } from "../src/queue/queue.module";

/**
 * Quiesce the background workers before a seed wipe.
 *
 * A passing submitAttempt enqueues a real certificate job; the worker (running
 * inside the test app against the same Redis) processes it asynchronously and
 * can insert a Certificate row *between* the wipe's certificate.deleteMany and
 * assignment.deleteMany — an FK violation and a flaky suite. The email queue is
 * drained too (the certificate processor chains an email job).
 *
 * Removes waiting/delayed jobs, then waits for in-flight ones to finish.
 */
export async function drainQueues(): Promise<void> {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  for (const name of [QUEUES.certificate, QUEUES.email]) {
    const q = new Queue(name, { connection: { url } });
    try {
      await q.drain(true); // waiting + delayed
      const deadline = Date.now() + 5_000;
      while ((await q.getActiveCount()) > 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 25));
      }
    } finally {
      await q.close();
    }
  }
}
