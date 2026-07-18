# Phase A — end-to-end UX verification

**Date:** 2026-07-17 · **Scope:** every learner + admin surface, driven as a real
user against the local stack (per [LMS_COMPLETION_PLAN.md](../LMS_COMPLETION_PLAN.md)
Phase A). The 2026-06 audit proved the API's safety infrastructure; this pass
proves the **experience** — and closes the build-but-broken items it found.

**Method.** Real Clerk dev-instance auth end-to-end (a dev-browser client signed
in via ticket, driving both the Next.js pages and the API with real JWTs — no
auth stubs). Local Postgres/Redis; **local S3 via MinIO** (`docker compose up -d
minio minio-init`, see `.env.example`); Stripe/Mux/Resend on dummy keys, so
those flows are verified to the provider boundary and covered by the
signature-verified C2 e2e suites beyond it.

Legend: `[x]` driven and working · `[~]` verified to the provider boundary
(needs a real key/tunnel to go further) — same status language as the audit.

## Learner loop

- [x] Sign-up → `POST /onboarding/organization` → org + site + ORG_ADMIN staff
- [x] `GET /me`, `GET /me/assignments` (guard fail-closed: 401 without token)
- [x] Required-training create → **assignments materialize** (correct `dueAt`
      = now + graceDays, expiry = cadence; idempotent per LMS-M5)
- [x] Module page: lessons listed with per-staff progress ticks, READY lessons
      clickable → **lesson player page (Mux signed playback)**; quiz CTA locked
      with hint until all READY lessons complete *(built + gated in PR #12)*
- [x] `POST /lessons/:id/complete` — assignment-gated, idempotent; **quiz gate
      enforced server-side on attempt start AND submit** (e2e:
      `lesson-gate.e2e-spec.ts`)
- [x] Quiz fail path (0%, attestation hash/IP/UA recorded) and pass path
      (100% → `Assignment COMPLETED`)
- [x] Certificate issued (BullMQ) → PDF rendered → S3 stored → **presigned
      download returns a valid PDF** (verified bytes, `%PDF` magic)
- [x] Learner payload carries **no quiz answer key** *(leak found in this pass —
      `correctIdx` + explanations were serialized into the quiz page HTML;
      fixed in PR #13, e2e: `answer-key.e2e-spec.ts`)*
- [~] Actual video streaming — no Mux credentials locally; playback verified to
      the signed-URL boundary live and via the stubbed C1 gate test

## Admin surfaces

- [x] `/admin` overview, `/admin/staff` (list shows real staff), layout gates
      `STAFF` permission out; API enforces org scoping regardless (LMS-C1)
- [x] Staff invite → **LMS-native invitation** (token emailed, SHA-256 stored;
      replaced Clerk invitations in LMS-M6 step 3) + pending list + revoke
- [x] Invite acceptance → staff materialization — now fully driveable locally:
      signed-in invitee posts the token; email-bound, single-use, expiring
      (e2e: `invitations.e2e-spec.ts`; no webhook/tunnel needed anymore)
- [x] Roster CSV: presigned upload → commit → processed rows + per-row errors
      (`row 4: invalid email`) recorded on the import
- [x] Reports: JSON + CSV (inspector columns incl. attestation hash and
      certificate sha256) + PDF (valid bytes)
- [~] Billing checkout — wired to the Stripe boundary; provider failures now
      return an opaque 502 instead of leaking Stripe's error/status *(PR #14)*;
      needs a real test key to drive checkout end-to-end
- [x] Onboarding + accept-invite + sign-in/up pages render; dashboard shows
      outstanding/completed with certificate download button

## Fixed during this pass

| Item | Where |
|---|---|
| No lesson player; quiz reachable without watching lessons | PR #12 — `LessonProgress` model (guardrail-covered PHI), player page, server-side gate |
| Quiz answer key shipped to the learner | PR #13 |
| Stripe error/status relayed verbatim to the client | PR #14 |
| Cert/roster S3 flows impossible locally without AWS | `chore/local-dev-s3-env-hygiene` — MinIO in compose + `.env.example` |
| Duplicate empty `CLERK_SECRET_KEY=` in `apps/api/.env` 401'd all API auth (dotenv last-wins) | fixed locally; warning added to `.env.example` |

## Open items (not bugs)

- **Attempt limits — DECIDED 2026-07-17: capped at 5 per assignment**
  (owner call; implemented in `feat/attempt-cap-5`). An attempt is consumed on
  start; a started attempt may still be submitted; a cadence renewal gets a
  fresh 5. Enforced server-side in `startAttempt`; the quiz UI shows
  "Attempts used: n of 5" and disables start/retry when exhausted.
- Seeded lessons have no videos (content is Phase B); the quiz gate only
  counts READY-video lessons, so seed modules remain take-able.
- One transient web→API `ECONNREFUSED` in dev (single occurrence, fine on
  retry, both listeners dual-stack — not reproduced).
- **Running the vitest suite locally wipes the dev database** — the test seeds
  use the same `DATABASE_URL` as `pnpm dev` and delete every table first.
  Re-run `pnpm --filter @maple-care/api run seed` (+ re-onboard) afterwards,
  or point tests at a separate DB if this bites too often.
