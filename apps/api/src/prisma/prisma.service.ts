import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { tenantIsolationExtension } from "./tenant-isolation.extension";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new PrismaClient().$extends(tenantIsolationExtension);

  async onModuleInit() {
    await (this.client as any).$connect();
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
  }

  // Expose the client properties
  get staff() { return this.client.staff; }
  get assignment() { return this.client.assignment; }
  get attempt() { return this.client.attempt; }
  get certificate() { return this.client.certificate; }
  get rosterImport() { return this.client.rosterImport; }
  get user() { return this.client.user; }
  get organization() { return this.client.organization; }
  get site() { return this.client.site; }
  get role() { return this.client.role; }
  get module() { return this.client.module; }
  get lesson() { return this.client.lesson; }
  get quiz() { return this.client.quiz; }
  get question() { return this.client.question; }
  get requiredTraining() { return this.client.requiredTraining; }
  get subscription() { return this.client.subscription; }
  get auditEvent() { return this.client.auditEvent; }
  get recordAccessLog() { return this.client.recordAccessLog; }

  // Generic access
  get $queryRaw() { return (this.client as any).$queryRaw; }
  get $executeRaw() { return (this.client as any).$executeRaw; }
  get $transaction() { return (this.client as any).$transaction; }
}
