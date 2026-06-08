import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import type Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";
import { StripeService } from "./stripe.service";
import { AuditService } from "../audit/audit.service";
import { QUEUES } from "../queue/queue.module";

/**
 * Per-seat subscription billing for LTC operators.
 * Per-course consumer checkout from the previous (creator-marketplace)
 * design has been removed — Maple Care sells subscriptions to
 * organizations, not courses to individuals.
 *
 * Full Stripe Subscription wiring lands in the next batch; this file
 * keeps the webhook plumbing so signature verification keeps working.
 */
@Injectable()
export class BillingService {
  private readonly log = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    @InjectQueue(QUEUES.email) private readonly emailQueue: Queue,
  ) {}

  /**
   * Create a Stripe Checkout session for an org to start their subscription.
   * Org admins call this; the resulting subscription is per-seat.
   */
  async createSubscriptionCheckout(
    orgId: string,
    actorUserId: string,
    seats: number,
  ) {
    if (seats < 1) throw new BadRequestException("seats must be >= 1");
    const priceId = this.config.getOrThrow<string>("STRIPE_PRICE_PER_SEAT_ID");

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException("Organization not found");

    let stripeCustomerId = org.stripeCustomerId;
    if (!stripeCustomerId) {
      const cust = await this.stripe.client.customers.create({
        name: org.name,
        metadata: { orgId: org.id, jurisdiction: org.jurisdiction },
      });
      stripeCustomerId = cust.id;
      await this.prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId },
      });
    }

    const webBase = this.config.getOrThrow<string>("WEB_BASE_URL");
    const session = await this.stripe.client.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: seats }],
      automatic_tax: { enabled: true },
      success_url: `${webBase}/admin/billing?status=success`,
      cancel_url: `${webBase}/admin/billing?status=cancelled`,
      metadata: { orgId: org.id, actorUserId, seats: String(seats) },
    });

    return { url: session.url };
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.upsertSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await this.cancelSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        this.log.debug(`Unhandled stripe event ${event.type}`);
    }
  }

  private async upsertSubscription(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const org = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (!org) {
      this.log.warn(`Subscription ${sub.id} for unknown customer ${customerId}`);
      return;
    }
    const item = sub.items.data[0];
    const status = (
      sub.status === "active" || sub.status === "trialing"
        ? sub.status.toUpperCase()
        : sub.status === "past_due"
          ? "PAST_DUE"
          : "CANCELED"
    ) as "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED";

    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      create: {
        orgId: org.id,
        stripeSubscriptionId: sub.id,
        status,
        seats: item?.quantity ?? 1,
        pricePerSeatCents: item?.price.unit_amount ?? 0,
        currency: (item?.price.currency ?? "cad").toUpperCase(),
        currentPeriodEnd: new Date(
          (sub as unknown as { current_period_end: number })
            .current_period_end * 1000,
        ),
      },
      update: {
        status,
        seats: item?.quantity ?? 1,
        pricePerSeatCents: item?.price.unit_amount ?? 0,
        currentPeriodEnd: new Date(
          (sub as unknown as { current_period_end: number })
            .current_period_end * 1000,
        ),
      },
    });

    await this.audit.record({
      orgId: org.id,
      action: "subscription.upserted",
      entityType: "Subscription",
      entityId: sub.id,
      payload: { status: sub.status, seats: item?.quantity },
    });
  }

  private async cancelSubscription(sub: Stripe.Subscription) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: "CANCELED" },
    });
  }
}
