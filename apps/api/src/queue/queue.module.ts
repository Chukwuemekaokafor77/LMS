import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";

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
        const u = new URL(url);
        return {
          connection: {
            host: u.hostname,
            port: Number(u.port || 6379),
            password: u.password || undefined,
            username: u.username || undefined,
          },
        };
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
