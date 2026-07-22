# Security review — go-live sprint (2026-07-22)

Scope: the new production surface added this sprint across **both** repos — the
Academy deployment, the SSO handoff, the two HMAC webhooks (entitlement +
certificate flow-back), the entitlement-lapse channel, and shared DO
infrastructure. The audited tenant-isolation core (LMS-C1/C2), PHI logging, and
existing webhook verification were **not** changed and remain intact.

## What's solid (verified, no action)

- **HMAC service auth** (`service-hmac.ts`, psw `_verify_service_signature`) —
  `timingSafeEqual` constant-time compare + a 300 s timestamp window (replay
  bound). Signature = `HMAC-SHA256(secret, "<ts>.<raw-body>")` over the **raw**
  bytes on both sides. Correct.
- **Fail-closed on missing secret** — every HMAC path checks the secret first
  and returns 503/401 when unset, so a blanked secret disables the feature
  *closed*, never open.
- **Session cookies** — `httpOnly`, `secure` (prod), `sameSite=lax`, 8 h HS256.
- **Diagnostic logging** — ids/role/province/entitlement only; **no PII**
  (email/name) in logs.
- **Secrets hygiene** — `.env` gitignored; only `.env.example` (placeholders)
  tracked; no committed secret material.
- **psw academy endpoints** — rate-limited (10/30/60 per min) + HMAC.

## Fixed in this branch (`sec/post-sprint-hardening`)

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | **High** | **CORS wide open** — `cors: true` reflected any origin. A PHI API should not accept cross-origin browser calls from arbitrary sites. | Restrict to `WEB_BASE_URL` (the Academy web origin). Server-to-server callers send no `Origin`, so webhooks/health are unaffected. |
| 2 | **Medium** | **Dead `/sign-in` redirects** — protected pages sent unauthenticated users to `/sign-in`, a route removed with Clerk → 404 (confusing, and a broken auth path). | Redirect to `/`, which routes to ElderCare (the only sign-in surface). |
| 3 | Low | Always-on SSO-claims log at LOG level (verbose, though no PII). | Downgraded to `debug`; rejection WARNs kept. |

## Owner action items (not auto-fixed)

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| A | **High** | **No app-level rate limiting on the Academy public endpoints** (`/auth/sso`, `/webhooks/eldercare/entitlement`, `/webhooks/mux`). The psw side rate-limits its academy routes; the Academy side doesn't. *Mitigating factors:* Cloudflare fronts the app (edge DDoS), SSO one-time-tokens are 256-bit, single-use, 60 s, and webhooks fast-reject on bad HMAC. So it's defense-in-depth, not a hole. | Add `@nestjs/throttler` with a global default (~100/min) + a tighter `@Throttle` on `/auth/sso` and the webhooks, for parity with ElderCare. ~1 small PR. I can implement on request. |
| B | **Medium** | **Shared-secret blast radius** — one `ACADEMY_EXCHANGE_SECRET` guards three channels (SSO exchange, cert flow-back, entitlement webhook) across two systems. A leak forges all three. | Fine for launch (strong random + replay window). Post-pilot, consider a separate secret per channel (defense in depth) and add it to the rotation runbook. |
| C | Low | **`doctl apps update --spec` silently blanks SECRET envs** — bit us 3× this sprint. A blanked secret fails *closed* (good) but silently disables a control (availability risk) — e.g., a blank `ACADEMY_EXCHANGE_SECRET` 503s the exchange. | Operational: prefer dashboard env edits; re-verify all secrets after any spec update (see the deployment memory). Consider a startup log line naming which optional secrets are unset. |
| D | Low | **Redis TLS `rejectUnauthorized:false`** (queue.module) — encrypts in transit but doesn't verify the managed cert, mirroring Postgres `sslmode=require`. | Acceptable within DO's TOR1 network. To harden later, pin the DO CA cert instead of disabling verification. |
| E | Low | **psw `FROM_EMAIL` defaults to a personal Gmail** (`elderlycarecompanion1@gmail.com`). | Set `FROM_EMAIL` to a domain address in prod (SPF/DKIM-aligned); the default is just a dev fallback. |
| F | Low | **`accept-invite` page is a Clerk remnant** — links to nonexistent `/sign-up`/`/sign-in`. The LMS-native invitation API still exists, but this web page predates the SSO model. | Reconcile the invitation UX with SSO (or remove the page) — a small product decision, not a security hole. |

## Cross-cutting posture

- **Residency**: identity + training PHI now in Canada end-to-end (DO TOR1 +
  Spaces TOR1) — the point of removing Clerk, achieved.
- **Blast radius between products**: the Academy shares ElderCare's Postgres
  cluster + Valkey. Isolation is at the database level (separate `academy` DB)
  and app-layer tenancy; acceptable at pilot scale. Note that a compromise of
  the shared cluster credentials would reach both products — a dedicated cluster
  is the isolation upgrade if/when warranted.
