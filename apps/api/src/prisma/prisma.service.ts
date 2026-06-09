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

  // Generic access. These MUST be bound to the underlying client: callers use
  // them as `this.prisma.$transaction(fn)`, which would otherwise invoke the
  // method with `this` = PrismaService (not the PrismaClient) and crash inside
  // Prisma ("Cannot read properties of undefined (reading 'adapter')"). The real
  // fix is to extend PrismaClient (LMS-M2); this binding is the stopgap.
  get $queryRaw() { return (this.client as any).$queryRaw.bind(this.client); }
  get $executeRaw() { return (this.client as any).$executeRaw.bind(this.client); }
  get $transaction() { return (this.client as any).$transaction.bind(this.client); }
}
