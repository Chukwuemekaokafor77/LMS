import { Module } from "@nestjs/common";
import { EldercareFlowbackClient } from "./eldercare-flowback.client";
import { CredentialFlowbackProcessor } from "./credential-flowback.processor";
import { EldercareEntitlementController } from "./eldercare-entitlement.controller";
import { EldercareEntitlementService } from "./eldercare-entitlement.service";

/**
 * Cross-product integrations with ElderCare:
 *  - Seam 3 certificate flow-back (Academy → ElderCare), and
 *  - the entitlement webhook (ElderCare → Academy) that keeps the local
 *    `Entitlement` current for the auth guard's mid-session check.
 */
@Module({
  controllers: [EldercareEntitlementController],
  providers: [
    EldercareFlowbackClient,
    CredentialFlowbackProcessor,
    EldercareEntitlementService,
  ],
})
export class IntegrationsModule {}
