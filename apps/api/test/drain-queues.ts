import { Queue } from "bullmq";
import { QUEUES } from "../src/queue/queue.module";

/**
 * Quiesce the background workers before a seed wipe.
 *
 * A passing submitAttempt enqueues a real certificate job; the worker (running
 * inside the test app against the same Redis) processes it asynchronously and
 * can insert a Certificate row *between* the wipe's certificate.deleteMany and
 * assignment.deleteMany — an FK violation and a flaky suite.
 *
 * WHY EVERY QUEUE, NOT A HAND-PICKED PAIR. This used to drain `certificate` and
 * `email` only — the two implicated in the failure that prompted it. But the
 * hazard is not specific to those two: it is that *any* worker still holding a
 * job writes to the database while the wipe is deleting from it, and five spec
 * files call this before wiping. `materialize` creates Assignments, `roster`
 * creates Staff, `flowback` writes credential deliveries, and `retention`
 * deletes across tables — all of them can land mid-wipe. Enumerating the queues
 * by hand also meant a queue added later was silently not drained, which is how
 * the list fell four behind.
 *
 * Deriving the list from QUEUES keeps it complete by construction.
 *
 * Removes waiting/delayed jobs, then waits for in-flight ones to finish.
 */
export async function drainQueues(): Promise<void> {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const stillActive: string[] = [];

  for (const name of Object.values(QUEUES)) {
    const q = new Queue(name, { connection: { url } });
    try {
      await q.drain(true); // waiting + delayed
      const deadline = Date.now() + 10_000;
      while ((await q.getActiveCount()) > 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 25));
      }
      if ((await q.getActiveCount()) > 0) stillActive.push(name);
    } finally {
      await q.close();
    }
  }

  if (stillActive.length) {
    // Don't throw — a slow runner shouldn't fail an otherwise good suite. But
    // say it plainly: a job outliving this window is the precondition for the
    // mid-wipe races above, so an unexplained constraint violation later in the
    // run most likely starts here.
    console.warn(
      `drainQueues: still active after 10s — ${stillActive.join(", ")}. ` +
        "A job writing during the wipe can surface as a unique/FK violation in a seed.",
    );
  }
}
