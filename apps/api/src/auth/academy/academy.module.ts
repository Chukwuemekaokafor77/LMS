import { Module } from "@nestjs/common";
import { AcademySsoController } from "./academy-sso.controller";
import { AcademySsoService } from "./academy-sso.service";
import { AcademyExchangeClient } from "./academy-exchange.client";

// AcademySessionService, PrismaService, and AuditService are provided by
// Global modules (AuthModule, PrismaModule, AuditModule respectively) — no
// explicit import needed for AcademySsoService to inject them.
@Module({
  controllers: [AcademySsoController],
  providers: [AcademyExchangeClient, AcademySsoService],
})
export class AcademyModule {}
