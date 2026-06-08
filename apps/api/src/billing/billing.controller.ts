import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { BillingService } from "./billing.service";
import { StripeService } from "./stripe.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { Public } from "../auth/public.decorator";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { PhiController } from "../audit/phi.controller";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";
import { CheckoutDto } from "./dto/checkout.dto";



@Controller()
export class BillingController extends PhiController {
  private readonly log = new Logger(BillingController.name);

  constructor(
    private readonly billing: BillingService,
    private readonly stripe: StripeService,
  ) {}

  @Post("billing/checkout")
  @SkipPhiAccess()
  async createCheckout(
    @Body() body: CheckoutDto,
    @CurrentUser() user: { id: string } | undefined,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    if (!user) throw new UnauthorizedException();
    if (!staff || staff.orgPermission !== "ORG_ADMIN") {
      throw new ForbiddenException("Org admin required");
    }
    return this.billing.createSubscriptionCheckout(staff.orgId, user.id, body.seats);
  }

  @Public()
  @Post("webhooks/stripe")
  @SkipPhiAccess()
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string | undefined,
  ) {
    if (!signature) throw new BadRequestException("Missing stripe-signature");
    const raw = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!raw) throw new BadRequestException("Missing raw body");

    let event;
    try {
      event = this.stripe.constructEvent(raw, signature);
    } catch (err) {
      this.log.warn(`Stripe signature failed: ${(err as Error).message}`);
      throw new BadRequestException("Invalid signature");
    }

    await this.billing.handleWebhookEvent(event);
    return { received: true };
  }
}
