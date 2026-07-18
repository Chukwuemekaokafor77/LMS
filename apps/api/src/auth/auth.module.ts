import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClerkService } from "./clerk.service";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { CurrentUserService } from "./current-user.service";
import { ClerkWebhookController } from "./clerk-webhook.controller";
import { StaffModule } from "../staff/staff.module";
import { IDENTITY_PROVIDER } from "./identity-provider";
import { ClerkIdentityProvider } from "./clerk-identity-provider";

@Global()
@Module({
  imports: [StaffModule],
  controllers: [ClerkWebhookController],
  providers: [
    ClerkService,
    // The guard + current-user resolution depend on this seam, not on Clerk —
    // the LMS-M6 cutover swaps this binding to the ElderCare OIDC verifier.
    { provide: IDENTITY_PROVIDER, useClass: ClerkIdentityProvider },
    CurrentUserService,
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
  exports: [ClerkService, IDENTITY_PROVIDER, CurrentUserService],
})
export class AuthModule {}
