import { Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuditService } from "./audit.service";
import { RecordAccessService } from "./record-access.service";
import { PhiAccessInterceptor } from "./phi-access.interceptor";

@Global()
@Module({
  providers: [
    AuditService,
    RecordAccessService,
    { provide: APP_INTERCEPTOR, useClass: PhiAccessInterceptor },
  ],
  exports: [AuditService, RecordAccessService],
})
export class AuditModule {}
