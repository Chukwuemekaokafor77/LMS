import { describe, it, expect, vi, beforeEach } from "vitest";
import { BadGatewayException } from "@nestjs/common";
import { BillingService } from "./billing.service";

/**
 * Stripe SDK failures must not leak to the client — before this fix a bad API
 * key surfaced as our own 401 with "Invalid API Key provided: sk_test_*..."
 * in the body. Provider errors are logged server-side and mapped to a 502.
 */
describe("BillingService — Stripe error mapping", () => {
  let prisma: any;
  let stripe: any;
  let config: any;
  let service: BillingService;

  const stripeAuthError = Object.assign(
    new Error("Invalid API Key provided: sk_test_*ummy"),
    { statusCode: 401, type: "StripeAuthenticationError" },
  );

  beforeEach(() => {
    prisma = {
      organization: {
        findUnique: vi.fn().mockResolvedValue({
          id: "org-1",
          name: "Org",
          jurisdiction: "NB",
          stripeCustomerId: null,
        }),
        update: vi.fn(),
      },
    };
    stripe = {
      client: {
        customers: { create: vi.fn().mockRejectedValue(stripeAuthError) },
        checkout: {
          sessions: { create: vi.fn().mockRejectedValue(stripeAuthError) },
        },
      },
    };
    config = { getOrThrow: vi.fn().mockReturnValue("dummy") };
    service = new BillingService(
      prisma,
      stripe,
      config,
      { record: vi.fn() } as any,
      { add: vi.fn() } as any,
    );
  });

  it("maps a customers.create failure to an opaque 502", async () => {
    await expect(
      service.createSubscriptionCheckout("org-1", "user-1", 5),
    ).rejects.toThrowError(BadGatewayException);
    await expect(
      service.createSubscriptionCheckout("org-1", "user-1", 5),
    ).rejects.toThrowError("Payment provider error");
  });

  it("maps a checkout.sessions.create failure to an opaque 502", async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: "org-1",
      name: "Org",
      jurisdiction: "NB",
      stripeCustomerId: "cus_existing",
    });
    const err = await service
      .createSubscriptionCheckout("org-1", "user-1", 5)
      .catch((e) => e);
    expect(err).toBeInstanceOf(BadGatewayException);
    expect(err.message).not.toContain("sk_test");
  });
});
