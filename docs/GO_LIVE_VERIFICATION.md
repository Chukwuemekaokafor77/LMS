# Go-Live Verification (Phase E item 4)

The local stack was verified against mocks. Before declaring the Academy live,
drive each channel against the **real** ElderCare deployment with **real
provider keys**. Prep is done; run once the secrets are set and the apps are
deployed ([DEPLOY_ACADEMY.md](DEPLOY_ACADEMY.md)).

> **Already investigated (2026-07-21): the "exchange 504" is not a bug.** A
> signed probe against live ElderCare returns an edge **504 masking an origin
> 503** (`x-do-orig-status: 503`). The exchange handler's first step is
> `_verify_service_signature`, which returns 503 *"Academy is not configured"*
> when `ACADEMY_EXCHANGE_SECRET` is unset — which it currently is on ElderCare
> prod (the Academy isn't deployed yet). **Setting `ACADEMY_EXCHANGE_SECRET` on
> ElderCare (item 2 wiring) resolves it.** Re-run the probe below to confirm.

## Prerequisites

- `academy-api` + `academy-web` deployed (DO TOR1), DNS resolving.
- Secrets set on both apps; `ACADEMY_EXCHANGE_SECRET` **byte-identical** on the
  Academy and ElderCare.
- On ElderCare: `ACADEMY_BASE_URL`, `ACADEMY_API_URL`, `ACADEMY_EXCHANGE_SECRET`
  set; the "Training" button shipped in the deployed app.

## 1. Service channel (exchange) — the 504 investigation

```bash
ELDERCARE_API_URL=https://api.eldercare-companion.com \
ACADEMY_EXCHANGE_SECRET='<the real shared secret>' \
  ./scripts/verify-eldercare-exchange.sh
```
- **Now (secret unset on ElderCare):** origin **503** → the probe says "unset."
- **After setting the secret, real value:** origin **400** "invalid/expired
  token" = ✅ healthy (reachable + HMAC accepted).
- **Mismatched secret:** origin **401** = the two sides disagree — realign.

## 2. SSO handoff, end-to-end

1. Log into ElderCare (web or app) as a caregiver in an **active-subscription**
   agency in a supported province (NB/NS/PE/NL).
2. Tap **Training** → the browser opens `academy.<domain>/sso?t=…` and lands on
   the training dashboard **already signed in** (no Academy login).
3. Confirm in the Academy: an `Organization`/`Site`/`User`/`Staff` were
   JIT-provisioned with the mapped role; `AuditEvent` `academy.sso_signin` +
   an `Entitlement` row (status active) exist.
4. Negative: a lapsed-subscription user gets the friendly block (403), not a session.

## 3. Certificate flow-back (Seam 3)

1. As the handed-off caregiver, complete a module (watch lessons → pass the quiz).
2. A `Certificate` issues → BullMQ `flowback` job POSTs to ElderCare
   `/api/v1/academy/certificate`.
3. In ElderCare, the caregiver's credential list shows the training as a
   **verified, expiring `StaffCertification`** (`issuing_authority = "ElderCare
   Academy"`, `expiry_date` from cadence).
4. Confirm the existing credential-expiry reminder is scheduled off that expiry.
5. Idempotency: re-run the job (or re-issue) → the same `StaffCertification`
   updates, no duplicate.

## 4. Entitlement webhook (mid-session enforcement)

1. With a caregiver holding a live Academy session, change the agency's
   ElderCare subscription to lapsed (Stripe test event or admin cancel).
2. ElderCare's `academy_notify.push_entitlement` POSTs to
   `api.academy.<domain>/webhooks/eldercare/entitlement`.
3. The caregiver's next Academy request returns **403** (blocked mid-session);
   the `Entitlement` row shows the non-active status.
4. Reactivate → a follow-up push → access restored without re-login.

## 5. Mux upload → playback (real keys)

1. In Admin → Modules, upload a lesson video → Mux processes it → the
   `video.asset.ready` webhook flips the lesson to `READY` (verify the webhook
   reached `api.academy.<domain>/webhooks/mux` with a valid signature).
2. As a learner, play the lesson → signed playback URL works end-to-end
   (this is the piece the local mock could not exercise).

## 6. Resend production email

1. Trigger a real email (staff invite or a due-soon reminder) with the prod
   `RESEND_API_KEY`.
2. Confirm delivery from `no-reply@academy.<domain>` (SPF/DKIM aligned so it
   isn't spam-filed) in EN and FR.

## Sign-off

When 1–6 pass against live infra, the Academy is go-live-verified. Record the
run (date, who, results) and update the Phase E status in
[LMS_COMPLETION_PLAN.md](../LMS_COMPLETION_PLAN.md) §2.
