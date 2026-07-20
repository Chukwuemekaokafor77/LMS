import { Injectable, UnauthorizedException } from "@nestjs/common";
import type {
  IdentityProfile,
  IdentityProvider,
  VerifiedIdentity,
} from "../identity-provider";
import { AcademySessionService } from "./academy-session.service";

/**
 * The only IdentityProvider after the Clerk decommission (LMS-M6 complete):
 * the bearer is an Academy session token (minted at /auth/sso), verified with
 * the Academy session secret. `sub` is the user's externalAuthId (their
 * ElderCare user id).
 */
@Injectable()
export class AcademyIdentityProvider implements IdentityProvider {
  constructor(private readonly sessions: AcademySessionService) {}

  async verifyBearer(token: string): Promise<VerifiedIdentity> {
    const { externalAuthId } = this.sessions.verify(token);
    return { externalId: externalAuthId };
  }

  fetchProfile(_externalId: string): Promise<IdentityProfile> {
    // Academy users are provisioned synchronously at /auth/sso from the
    // ElderCare claims, so a valid session always corresponds to an existing
    // User. Reaching here means a session outlived its User (e.g. deleted) —
    // the session is no longer valid, so 401 rather than a fabricated profile.
    return Promise.reject(
      new UnauthorizedException("Session no longer valid — sign in again"),
    );
  }
}
