import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createHmac } from "crypto";
import Stripe from "stripe";
import { Webhook } from "svix";
import { PrismaClient } from "@prisma/client";
import {
  setupTestApp,
  type TestApp,
  TEST_STRIPE_WEBHOOK_SECRET,
  TEST_MUX_WEBHOOK_SECRET,
  TEST_CLERK_WEBHOOK_SECRET,
} from "./harness";
import { seedC2Base, type C2Base } from "./seed-c2";

/**
 * LMS-C2 — webhook signature verification + idempotency for all three
 * providers. A bad signature is rejected (400); a valid one is processed and
 * replaying it is a no-op. Each provider's real verification runs (Mux included,
 * via stubMux:false) — only the signing helpers are test-side.
 */
let t: TestApp;
let db: PrismaClient;
let base: C2Base;
const CUSTOMER = "cus_c2_test";

const stripe = new Stripe("sk_test_dummy", { apiVersion: "2025-02-24.acacia" });

function stripeHeaders(payload: string) {
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret: TEST_STRIPE_WEBHOOK_SECRET,
  });
}

function muxSignature(payload: string, secret = TEST_MUX_WEBHOOK_SECRET) {
  const ts = Math.floor(Date.now() / 1000);
  const v1 = createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  return `t=${ts},v1=${v1}`;
}

beforeAll(async () => {
  db = new PrismaClient();
  t = await setupTestApp({ stubMux: false }); // exercise real Mux verification
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await db?.$disconnect();
});

beforeEach(async () => {
  base = await seedC2Base(db);
  await db.organization.update({
    where: { id: base.orgId },
    data: { stripeCustomerId: CUSTOMER },
  });
});

describe("LMS-C2 webhooks", () => {
  describe("Stripe", () => {
    const subEvent = (subId: string) =>
      JSON.stringify({
        id: "evt_1",
        type: "customer.subscription.created",
        data: {
          object: {
            id: subId,
            customer: CUSTOMER,
            status: "active",
            items: { data: [{ quantity: 5, price: { unit_amount: 1000, currency: "cad" } }] },
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 86_400,
          },
        },
      });

    it("rejects a bad signature (400)", async () => {
      await t
        .anon()
        .post("/webhooks/stripe")
        .set("stripe-signature", "t=1,v1=deadbeef")
        .set("content-type", "application/json")
        .send(subEvent("sub_bad"))
        .expect(400);
    });

    it("upserts a subscription on a valid event and is idempotent on replay", async () => {
      const payload = subEvent("sub_c2");
      const sig = stripeHeaders(payload);

      await t.anon().post("/webhooks/stripe").set("stripe-signature", sig).set("content-type", "application/json").send(payload).expect(200);
      let subs = await db.subscription.findMany({ where: { stripeSubscriptionId: "sub_c2" } });
      expect(subs).toHaveLength(1);
      expect(subs[0].orgId).toBe(base.orgId);
      expect(subs[0].seats).toBe(5);

      // Replay the same event → still exactly one row.
      const sig2 = stripeHeaders(payload);
      await t.anon().post("/webhooks/stripe").set("stripe-signature", sig2).set("content-type", "application/json").send(payload).expect(200);
      subs = await db.subscription.findMany({ where: { stripeSubscriptionId: "sub_c2" } });
      expect(subs).toHaveLength(1);
    });
  });

  describe("Mux", () => {
    const readyEvent = (lessonId: string) =>
      JSON.stringify({
        type: "video.asset.ready",
        data: {
          id: "asset_1",
          passthrough: lessonId,
          playback_ids: [{ id: "pb_ready", policy: "signed" }],
          duration: 120,
        },
      });

    async function makeLesson() {
      const l = await db.lesson.create({
        data: { moduleId: base.moduleId, position: 1, titleEn: "L", titleFr: "L", videoStatus: "PENDING" },
      });
      return l.id;
    }

    it("rejects a bad signature (400)", async () => {
      const lessonId = await makeLesson();
      await t
        .anon()
        .post("/webhooks/mux")
        .set("mux-signature", "t=1,v1=deadbeef")
        .set("content-type", "application/json")
        .send(readyEvent(lessonId))
        .expect(400);
    });

    it("marks the lesson READY on a valid video.asset.ready", async () => {
      const lessonId = await makeLesson();
      const payload = readyEvent(lessonId);
      await t
        .anon()
        .post("/webhooks/mux")
        .set("mux-signature", muxSignature(payload))
        .set("content-type", "application/json")
        .send(payload)
        .expect(200);
      const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
      expect(lesson?.videoStatus).toBe("READY");
      expect(lesson?.muxPlaybackId).toBe("pb_ready");
    });
  });

  describe("Clerk (svix)", () => {
    function clerkHeaders(payload: string) {
      const wh = new Webhook(TEST_CLERK_WEBHOOK_SECRET);
      const id = "msg_c2";
      const timestamp = new Date();
      const signature = wh.sign(id, timestamp, payload);
      return {
        "svix-id": id,
        "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
        "svix-signature": signature,
      };
    }

    const userCreated = (clerkId: string) =>
      JSON.stringify({
        type: "user.created",
        data: {
          id: clerkId,
          email_addresses: [{ id: "em_1", email_address: "invited@example.com" }],
          primary_email_address_id: "em_1",
          first_name: "Invited",
          last_name: "User",
          public_metadata: { orgId: base.orgId, roleCode: base.roleCode, orgPermission: "STAFF" },
        },
      });

    it("rejects a bad signature (400)", async () => {
      await t
        .anon()
        .post("/webhooks/clerk")
        .set("svix-id", "msg_x")
        .set("svix-timestamp", String(Math.floor(Date.now() / 1000)))
        .set("svix-signature", "v1,deadbeef")
        .set("content-type", "application/json")
        .send(userCreated("clerk_new"))
        .expect(400);
    });

    it("materializes a User + Staff from an invitation on a valid event", async () => {
      const payload = userCreated("clerk_invited_c2");
      const headers = clerkHeaders(payload);
      await t
        .anon()
        .post("/webhooks/clerk")
        .set(headers)
        .set("content-type", "application/json")
        .send(payload)
        .expect(200);

      const user = await db.user.findUnique({ where: { externalAuthId: "clerk_invited_c2" } });
      expect(user).not.toBeNull();
      const staff = await db.staff.findUnique({ where: { userId: user!.id } });
      expect(staff?.orgId).toBe(base.orgId);
      expect(staff?.roleCode).toBe(base.roleCode);
    });
  });
});
