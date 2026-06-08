import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { QUEUES } from "../queue/queue.module";

/**
 * Schedules the nightly retention sweep on app boot. Idempotent — BullMQ
 * upserts the repeatable by jobId.
 */
@Injectable()
export class RetentionScheduler implements OnApplicationBootstrap {
  private readonly log = new Logger(RetentionScheduler.name);

  constructor(
    @InjectQueue(QUEUES.retention) private readonly queue: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.queue.add(
      "sweep",
      {},
      {
        jobId: "retention-nightly",
        repeat: { pattern: "0 3 * * *", tz: "America/Moncton" },
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    );
    this.log.log("Retention sweep scheduled for 03:00 America/Moncton");
  }
}
