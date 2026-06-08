import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClerkService } from "./clerk.service";

@Injectable()
export class CurrentUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clerk: ClerkService,
  ) {}

  async upsertFromClerk(clerkUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });
    if (existing) return existing;

    const cu = await this.clerk.getClient().users.getUser(clerkUserId);
    const email = cu.primaryEmailAddress?.emailAddress;
    if (!email) {
      throw new Error(`Clerk user ${clerkUserId} has no primary email`);
    }
    const name =
      [cu.firstName, cu.lastName].filter(Boolean).join(" ").trim() || null;

    // Email may already exist from a prior auth — link it.
    return this.prisma.user.upsert({
      where: { email },
      create: { clerkUserId, email, name },
      update: { clerkUserId, name: name ?? undefined },
    });
  }
}
