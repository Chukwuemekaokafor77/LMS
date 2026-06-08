import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClerkClient, type ClerkClient } from "@clerk/backend";

@Injectable()
export class ClerkService implements OnModuleInit {
  private client!: ClerkClient;
  private secretKey!: string;
  private publishableKey?: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.secretKey = this.config.getOrThrow<string>("CLERK_SECRET_KEY");
    this.publishableKey = this.config.get<string>(
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    );
    this.client = createClerkClient({
      secretKey: this.secretKey,
      publishableKey: this.publishableKey,
    });
  }

  getClient() {
    return this.client;
  }

  async verifyBearer(token: string) {
    const { verifyToken } = await import("@clerk/backend");
    return verifyToken(token, { secretKey: this.secretKey });
  }
}
