import { Module } from "@nestjs/common";
import { RetentionProcessor } from "./retention.processor";
import { RetentionScheduler } from "./retention.scheduler";

@Module({
  providers: [RetentionProcessor, RetentionScheduler],
})
export class RetentionModule {}
