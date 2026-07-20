import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { CurrentUserService } from "./current-user.service";
import { IDENTITY_PROVIDER } from "./identity-provider";
import { AcademySessionService } from "./academy/academy-session.service";
import { AcademyIdentityProvider } from "./academy/academy-identity-provider";

@Global()
@Module({
  providers: [
    AcademySessionService,
    // Clerk is gone (LMS-M6 complete): the sole identity provider verifies
    // ElderCare Academy session tokens. Bind a different impl here to swap it.
    { provide: IDENTITY_PROVIDER, useClass: AcademyIdentityProvider },
    CurrentUserService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [IDENTITY_PROVIDER, CurrentUserService, AcademySessionService],
})
export class AuthModule {}
