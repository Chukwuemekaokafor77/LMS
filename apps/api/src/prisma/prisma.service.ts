import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { tenantIsolationExtension } from "./tenant-isolation.extension";

/**
 * The application's Prisma client (LMS-M2).
 *
 * `PrismaService` *is* the tenant-guardrail-extended client: the constructor
 * returns the `$extends`-wrapped client, so every `this.prisma.<model>` call
 * goes through the LMS-H1 guardrail, and — because the class also `extends
 * PrismaClient` — every model delegate and raw helper (`$transaction`,
 * `$queryRaw`, …) is inherited and fully typed. No manual per-model getters, no
 * `as any`, and a newly-added Prisma model is available without touching this
 * file. The returned extended client retains the class's lifecycle methods, so
 * Nest still drives `onModuleInit`/`onModuleDestroy`.
 *
 * (Verified that the extension still applies through `$transaction` callbacks
 * and that fail-closed/injection isolation holds — see the tenant tests.)
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    return this.$extends(tenantIsolationExtension) as unknown as PrismaService;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
