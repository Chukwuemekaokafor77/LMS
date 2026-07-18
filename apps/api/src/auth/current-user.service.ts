import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  IDENTITY_PROVIDER,
  type IdentityProvider,
} from "./identity-provider";

@Injectable()
export class CurrentUserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
  ) {}

  /**
   * Resolve (or provision on first sight) the local User for a verified
   * identity subject (`User.externalAuthId` — today a Clerk user id, post-M6
   * the ElderCare OIDC `sub`).
   */
  async upsertFromIdentity(externalId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { externalAuthId: externalId },
    });
    if (existing) return existing;

    const profile = await this.identity.fetchProfile(externalId);

    // Email may already exist from a prior auth — link it.
    return this.prisma.user.upsert({
      where: { email: profile.email },
      create: {
        externalAuthId: externalId,
        email: profile.email,
        name: profile.name,
      },
      update: { externalAuthId: externalId, name: profile.name ?? undefined },
    });
  }
}
