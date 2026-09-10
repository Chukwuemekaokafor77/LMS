import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckError,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";
import { Public } from "../auth/public.decorator";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import { RedisHealthIndicator } from "./redis.health";

@Public()
@SkipPhiAccess()
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redis: RedisHealthIndicator,
  ) {}

  /**
   * The PLATFORM PROBE. DigitalOcean uses this as the readiness check, so
   * anything fatal here takes the container out of rotation.
   *
   * Postgres is fatal: without it the API cannot serve a single request.
   *
   * Redis is reported but deliberately NOT fatal. A queue outage degrades the
   * app — certificates, invitations and assignment materialization stop — but
   * browsing modules, reading lessons and taking quizzes still work. Making
   * Redis fatal here would turn that partial outage into a total one: the
   * container would be killed, and because startup itself needs Redis no
   * replacement could become ready and no deploy could ship. That is close to
   * what happened on 2026-09-09. Alert on `/health/deps` instead.
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck("database", this.prisma),
      // Never throws — contributes a detail line, not a verdict.
      (): Promise<HealthIndicatorResult> => this.redis.check("redis"),
    ]);
  }

  /**
   * The MONITORING endpoint: every dependency needed for the app to be fully
   * functional, all fatal. Point uptime checks and alerting here.
   *
   * This is the one that would have gone red the moment the queue's Redis
   * disappeared, instead of `/health` staying green for weeks while every
   * certificate and invitation silently failed.
   */
  @Get("deps")
  @HealthCheck()
  deps() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck("database", this.prisma),
      async () => {
        const result = await this.redis.check("redis");
        if (result.redis?.status !== "up") {
          throw new HealthCheckError("Redis health check failed", result);
        }
        return result;
      },
    ]);
  }
}
