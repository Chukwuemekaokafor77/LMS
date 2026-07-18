import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { Webhook } from "svix";
import { PrismaService } from "../prisma/prisma.service";
import { Public } from "./public.decorator";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";

type ClerkUser = {
  id: string;
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
};

type ClerkEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUser }
  | { type: "user.deleted"; data: { id: string; deleted?: boolean } };

@Controller("webhooks/clerk")
export class ClerkWebhookController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post()
  @SkipPhiAccess()
  @HttpCode(200)
  async handle(
    @Req() req: Request,
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTs: string,
    @Headers("svix-signature") svixSig: string,
  ) {
    const secret = this.config.getOrThrow<string>("CLERK_WEBHOOK_SECRET");
    const raw = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!raw) throw new BadRequestException("Missing raw body");

    let event: ClerkEvent;
    try {
      event = new Webhook(secret).verify(raw.toString("utf8"), {
        "svix-id": svixId,
        "svix-timestamp": svixTs,
        "svix-signature": svixSig,
      }) as ClerkEvent;
    } catch {
      throw new BadRequestException("Invalid signature");
    }

    if (event.type === "user.created" || event.type === "user.updated") {
      const u = event.data;
      const primary = u.email_addresses.find(
        (e) => e.id === u.primary_email_address_id,
      );
      if (!primary) return { ok: true };
      const name =
        [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || null;

      // Identity sync only. Staff materialization moved to the LMS-native
      // invitation accept flow (LMS-M6 step 3) — the webhook no longer reads
      // publicMetadata.
      await this.prisma.user.upsert({
        where: { externalAuthId: u.id },
        create: { externalAuthId: u.id, email: primary.email_address, name },
        update: { email: primary.email_address, name: name ?? undefined },
      });
    } else if (event.type === "user.deleted") {
      await this.prisma.user.updateMany({
        where: { externalAuthId: event.data.id },
        data: { externalAuthId: null },
      });
    }
    return { ok: true };
  }
}
