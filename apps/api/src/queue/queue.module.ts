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
        // rediss:// (DO Managed Valkey and the like) requires TLS. Because we
        // pass host/port to ioredis rather than the URL, TLS must be enabled
        // explicitly. rejectUnauthorized:false mirrors the Postgres
        // sslmode=require posture used against the same DO cluster family
        // (encrypt in-transit; the managed cert isn't in Node's CA bundle).
        const tls =
          u.protocol === "rediss:" ? { tls: { rejectUnauthorized: false } } : {};
        return {
          connection: {
            host: u.hostname,
            port: Number(u.port || 6379),
            username: u.username ? decodeURIComponent(u.username) : undefined,
            password: u.password ? decodeURIComponent(u.password) : undefined,
            ...tls,
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
