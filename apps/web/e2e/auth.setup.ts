import { test as setup } from "@playwright/test";
import crypto from "node:crypto";

/**
 * Authenticates the browser as the seeded E2E learner by minting the Academy
 * session cookie directly — the same HS256 JWT the SSO handoff produces
 * (see api/src/auth/academy/academy-session.service.ts), so no live ElderCare
 * is needed. The secret MUST match the running API's ACADEMY_SESSION_SECRET.
 */
const SECRET =
  process.env.ACADEMY_SESSION_SECRET ?? "test-academy-session-secret";
const LEARNER = process.env.E2E_LEARNER_EXTERNAL_ID ?? "e2e_learner";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const authFile = "e2e/.auth/learner.json";

const b64url = (input: string) => Buffer.from(input).toString("base64url");

function mintSession(externalAuthId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      typ: "academy_session",
      sub: externalAuthId,
      iss: "eldercare-academy",
      iat: now,
      exp: now + 8 * 60 * 60,
    }),
  );
  const data = `${header}.${payload}`;
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

setup("authenticate as the seeded learner", async ({ context }) => {
  const { hostname } = new URL(BASE);
  await context.addCookies([
    {
      name: "academy_session",
      value: mintSession(LEARNER),
      domain: hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await context.storageState({ path: authFile });
});
