import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClerkService } from "./clerk.service";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { CurrentUserService } from "./current-user.service";
import { ClerkWebhookController } from "./clerk-webhook.controller";
import { StaffModule } from "../staff/staff.module";

@Global()
@Module({
  imports: [StaffModule],
  controllers: [ClerkWebhookController],
  providers: [
    ClerkService,
    CurrentUserService,
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
  exports: [ClerkService, CurrentUserService],
})
export class AuthModule {}
