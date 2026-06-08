import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import type { PrismaClient } from "@prisma/client";
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
      // PrismaService is a hand-rolled wrapper, not a PrismaClient (see LMS-M2);
      // it exposes the $queryRaw pingCheck needs, so cast until M2 makes it a
      // real client.
      () =>
        this.prismaIndicator.pingCheck(
          "database",
          this.prisma as unknown as PrismaClient,
        ),
    ]);
  }
}
