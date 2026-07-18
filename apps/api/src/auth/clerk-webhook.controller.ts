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
import { InvitationsService } from "../staff/invitations.service";
import type { OrgPermission } from "@prisma/client";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";

type ClerkUser = {
  id: string;
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  public_metadata?: {
    orgId?: string;
    siteId?: string | null;
    roleCode?: string;
    orgPermission?: OrgPermission;
    employmentType?: string | null;
  };
};

type ClerkEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUser }
  | { type: "user.deleted"; data: { id: string; deleted?: boolean } };

@Controller("webhooks/clerk")
export class ClerkWebhookController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly invitations: InvitationsService,
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

      const user = await this.prisma.user.upsert({
        where: { externalAuthId: u.id },
        create: { externalAuthId: u.id, email: primary.email_address, name },
        update: { email: primary.email_address, name: name ?? undefined },
      });

      // Materialize Staff if the user came in through an invitation.
      if (
        event.type === "user.created" &&
        u.public_metadata?.orgId &&
        u.public_metadata.roleCode
      ) {
        await this.invitations.materializeFromInvitation({
          userId: user.id,
          orgId: u.public_metadata.orgId,
          siteId: u.public_metadata.siteId ?? null,
          roleCode: u.public_metadata.roleCode,
          orgPermission: u.public_metadata.orgPermission ?? "STAFF",
          employmentType: u.public_metadata.employmentType ?? null,
        });
      }
    } else if (event.type === "user.deleted") {
      await this.prisma.user.updateMany({
        where: { externalAuthId: event.data.id },
        data: { externalAuthId: null },
      });
    }
    return { ok: true };
  }
}
