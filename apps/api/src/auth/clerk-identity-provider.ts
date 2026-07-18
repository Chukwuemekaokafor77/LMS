import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ClerkService } from "./clerk.service";
import type {
  IdentityProvider,
  IdentityProfile,
  VerifiedIdentity,
} from "./identity-provider";

/** The current (and so far only) IdentityProvider implementation. */
@Injectable()
export class ClerkIdentityProvider implements IdentityProvider {
  constructor(private readonly clerk: ClerkService) {}

  async verifyBearer(token: string): Promise<VerifiedIdentity> {
    const payload = await this.clerk.verifyBearer(token);
    if (!payload.sub) throw new UnauthorizedException("Invalid token subject");
    return { externalId: payload.sub, sessionId: payload.sid };
  }

  async fetchProfile(externalId: string): Promise<IdentityProfile> {
    const cu = await this.clerk.getClient().users.getUser(externalId);
    const email = cu.primaryEmailAddress?.emailAddress;
    if (!email) {
      throw new Error(`Identity ${externalId} has no primary email`);
    }
    const name =
      [cu.firstName, cu.lastName].filter(Boolean).join(" ").trim() || null;
    return { externalId, email, name };
  }
}
