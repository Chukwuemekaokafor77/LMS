import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { redisConnectionFromUrl } from "../redis/redis-connection";

export const QUEUES = {
  email: "email",
  roster: "roster-import",
  materialize: "assignment-materialize",
  certificate: "certificate-generate",
  retention: "retention-sweep",
  flowback: "credential-flowback",
} as const;

// Global so the registered queue tokens are injectable from any feature module
// (InvitationsService, AssignmentsService, RosterController, the processors, …)
// without each importing QueueModule. Without this the app cannot boot.
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>("REDIS_URL");
        // Shared with the Redis health indicator on purpose. A health check
        // that connects differently from the queue is worse than none: it goes
        // green while the queue is down, or red while the queue is fine.
        return { connection: redisConnectionFromUrl(url) };
      },
    }),
    BullModule.registerQueue(
      { name: QUEUES.email },
      { name: QUEUES.roster },
      { name: QUEUES.materialize },
      { name: QUEUES.certificate },
      { name: QUEUES.retention },
      { name: QUEUES.flowback },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
