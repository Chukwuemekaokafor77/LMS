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
   * identity subject. The DB column is still `clerkUserId` — it becomes
   * `externalAuthId` in the LMS-M6 step-2 rename.
   */
  async upsertFromIdentity(externalId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId: externalId },
    });
    if (existing) return existing;

    const profile = await this.identity.fetchProfile(externalId);

    // Email may already exist from a prior auth — link it.
    return this.prisma.user.upsert({
      where: { email: profile.email },
      create: {
        clerkUserId: externalId,
        email: profile.email,
        name: profile.name,
      },
      update: { clerkUserId: externalId, name: profile.name ?? undefined },
    });
  }
}
