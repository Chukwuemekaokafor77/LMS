import { Module } from "@nestjs/common";
import { EldercareFlowbackClient } from "./eldercare-flowback.client";
import { CredentialFlowbackProcessor } from "./credential-flowback.processor";

/** Cross-product integrations with ElderCare (Seam 3 certificate flow-back). */
@Module({
  providers: [EldercareFlowbackClient, CredentialFlowbackProcessor],
})
export class IntegrationsModule {}
