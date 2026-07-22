import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { TerminusModule } from "@nestjs/terminus";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";
import { AuthModule } from "./auth/auth.module";
import { AcademyModule } from "./auth/academy/academy.module";
import { AuditModule } from "./audit/audit.module";
import { QueueModule } from "./queue/queue.module";
import { StorageModule } from "./storage/storage.module";
import { ModulesModule } from "./modules/modules.module";
import { AuthoringModule } from "./authoring/authoring.module";
import { VideoModule } from "./video/video.module";
import { EmailModule } from "./email/email.module";
import { MeModule } from "./me/me.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { StaffModule } from "./staff/staff.module";
import { RosterModule } from "./roster/roster.module";
import { RequiredTrainingModule } from "./required-training/required-training.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { CertificatesModule } from "./certificates/certificates.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { ReportsModule } from "./reports/reports.module";
import { RetentionModule } from "./retention/retention.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Default throttle config (ttl in ms). Applied only where ThrottlerGuard is
    // explicitly attached — i.e. the public server-to-server endpoints — NOT
    // globally: most API traffic is SSR from the web container's single IP, so a
    // global per-IP limit would make users throttle each other. Off under test
    // so the e2e suite's request volume can't trip it.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
      skipIf: () => process.env.NODE_ENV === "test",
    }),
    TerminusModule,
    PrismaModule,
    AuditModule,
    QueueModule,
    StorageModule,
    StaffModule,
    AuthModule,
    AcademyModule,
    ModulesModule,
    AuthoringModule,
    VideoModule,
    EmailModule,
    MeModule,
    OnboardingModule,
    RosterModule,
    RequiredTrainingModule,
    AssignmentsModule,
    CertificatesModule,
    IntegrationsModule,
    ReportsModule,
    RetentionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
