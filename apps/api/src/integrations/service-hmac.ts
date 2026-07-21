import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies an inbound service-to-service request signed with the shared
 * ElderCare⇄Academy secret. The signing format is exactly the one the Academy
 * uses outbound (see academy-exchange.client.ts / eldercare-flowback.client.ts):
 *
 *     signature = HMAC-SHA256(secret, "<unix-ts>.<raw-body>")   (hex)
 *
 * so ElderCare signs identically. Verification is timing-safe and enforces a
 * timestamp freshness window to bound replay. Must be given the *raw* request
 * bytes (req.rawBody) — re-serialized JSON would not match byte-for-byte.
 */
export function verifyServiceHmac(opts: {
  secret: string;
  timestamp: string | undefined;
  signature: string | undefined;
  rawBody: Buffer;
  /** Max allowed clock skew / replay window, seconds (default 300). */
  toleranceSec?: number;
  /** Injectable clock for tests (ms). */
  nowMs?: number;
}): boolean {
  const { secret, timestamp, signature, rawBody, toleranceSec = 300, nowMs = Date.now() } = opts;
  if (!timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(nowMs / 1000 - ts) > toleranceSec) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
