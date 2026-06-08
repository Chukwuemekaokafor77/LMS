import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";
import { Public } from "../auth/public.decorator";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";

@Public()
@SkipPhiAccess()
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck("database", this.prisma),
    ]);
  }
}
