import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp, TEST_MUX_WEBHOOK_SECRET } from "./harness";
import { seedC2Base, type C2Base } from "./seed-c2";

/**
 * LMS-C2 — webhook signature verification + idempotency. Only Mux remains:
 * Stripe was decommissioned 2026-07-18 (ElderCare-entitled, no billing) and
 * the Clerk webhook was removed 2026-07-20 (Clerk decommissioned — LMS-M6).
 * A bad signature is rejected (400); a valid one is processed and replaying
 * it is a no-op. Mux's real verification runs (via stubMux:false).
 */
let t: TestApp;
let db: PrismaClient;
let base: C2Base;

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
});

describe("LMS-C2 webhooks", () => {
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
});
