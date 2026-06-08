/* eslint-disable no-console */
// Idempotent: creates the Maple Care per-seat Product + Price in Stripe.
// Re-run is safe — products/prices are looked up by metadata and reused.
//
//   pnpm --filter @maple-care/api stripe:setup
//
// Output: prints STRIPE_PRICE_PER_SEAT_ID. Paste into your .env.

import "dotenv/config";
import Stripe from "stripe";

const PRODUCT_KEY = "maple_care_seat_v1";
const PRICE_KEY = "maple_care_seat_v1_cad_monthly";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("STRIPE_SECRET_KEY not set");
    process.exit(1);
  }
  const stripe = new Stripe(key, { apiVersion: "2025-09-30.clover" });

  const products = await stripe.products.search({
    query: `metadata['key']:'${PRODUCT_KEY}' AND active:'true'`,
  });
  const product =
    products.data[0] ??
    (await stripe.products.create({
      name: "Maple Care — Compliance LMS Seat",
      description: "Per-staff-seat monthly subscription. Per-seat billing.",
      tax_code: "txcd_10103001", // SaaS (digital service)
      metadata: { key: PRODUCT_KEY },
    }));
  console.log(`product = ${product.id}`);

  const prices = await stripe.prices.search({
    query: `product:'${product.id}' AND metadata['key']:'${PRICE_KEY}' AND active:'true'`,
  });
  const price =
    prices.data[0] ??
    (await stripe.prices.create({
      product: product.id,
      currency: "cad",
      unit_amount: 500, // CA$5.00 / staff / month — placeholder, change in dashboard for prod
      recurring: { interval: "month" },
      tax_behavior: "exclusive",
      metadata: { key: PRICE_KEY },
    }));

  console.log(`price   = ${price.id}`);
  console.log("");
  console.log("Add this to your .env:");
  console.log(`STRIPE_PRICE_PER_SEAT_ID=${price.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
