# Maple Care LMS — As-Built Reconciliation & Hardening Plan

**Status:** 🟢 All CRITICAL + HIGH findings closed (2026-06-08). The safety infrastructure is now **verified, not just scaffolded**: the tenant-isolation guardrail was rewritten as fail-closed orgId injection (LMS-H1) and is **proven by a real two-org cross-tenant suite** (LMS-C1), with real-DB coverage of cert issuance / scoring / materialization / signature-verified webhooks behind a 60% service-coverage gate (LMS-C2); CI now stands up Postgres+Redis with a schema-drift gate, lint and typecheck (LMS-H2), and the API type-checks/builds (LMS-H3). **Remaining: five MEDIUM cleanups (LMS-M1–M5)** — none block a PHI pilot on the tested surface, though M1 (rotate live Clerk keys) and M4 (broken audit trail) are worth doing before an operator relies on it. _(Original reconciliation note: the LMS was further along than ROADMAP Part A claimed — most of Phase 1 plus chunks of Phase 2/3 were already implemented, but unverified; this doc closed that gap.)_

> **⚠️ This is a paused product.** ElderCare is the active focus (see `ROADMAP.md` Part B, in the separate `psw` repo). This plan exists so that (a) the ROADMAP stops misrepresenting "paused" as "untouched," and (b) when an LMS resume trigger fires, the first engineer in has a precise, code-verified punch list instead of re-deriving the state. **Do not start this work** until a resume trigger fires — but keep this doc honest if the code changes.

**Repo:** `C:\Users\emekamichael\LMS` (separate from `psw`). All file paths below are relative to that repo root.
**Audit scope:** Full `apps/api/src` (line-by-line on all PHI/tenant/billing/webhook paths), `apps/api/prisma/schema.prisma`, CI, Dockerfiles, env. `apps/web` structure-level only.
**Last updated:** 2026-06-08
**Owner:** _(assign when a resume trigger fires)_

Legend — Severity: 🔴 CRITICAL (blocks any PHI pilot) · 🟠 HIGH (fix before first paid operator) · 🟡 MEDIUM (first patch) · 🔵 LOW (backlog).
Status: `[ ]` open · `[~]` partial / built-but-unverified · `[!]` built-but-broken · `[x]` done + verified.

---

## How to use this document

1. The ROADMAP Phase 1 checkboxes are **superseded by this doc.** The "Roadmap reconciliation" table below maps each Phase 1 line to its true as-built state; the findings sections carry the work.
2. Resolve **CRITICAL** before any real PHI touches the system — these are the unverified cross-tenant-leak surface, which is the single biggest commercial + legal risk for a multi-tenant LMS.
3. Resolve **HIGH** before the first paying operator.
4. MEDIUM/LOW are first-patch / backlog.
5. Work top-down. Each finding has a stable ID (`LMS-C1`, `LMS-H1`, …), location, root cause, fix, verification, effort, and a status box. Keep the boxes flipped as work lands — do not repeat the ROADMAP's status-drift mistake.

---

## What is already solid (do not regress)

These were verified by code-read this session and are genuinely good — the point of the hardening work is to *prove* them with tests, not rebuild them:

- **Application-layer tenant scoping is careful.** Admin/list paths filter `orgId` explicitly ([staff.service.ts:17](apps/api/src/staff/staff.service.ts)); by-id reads do a post-fetch ownership check (`if (!s || s.orgId !== actor.orgId) throw NotFound`, plus site/self gates — [staff.service.ts:50](apps/api/src/staff/staff.service.ts)); certificate download checks owner-or-same-org-admin ([certificates.controller.ts:38](apps/api/src/certificates/certificates.controller.ts)). No IDOR found in the reviewed paths.
- **Webhook signature verification is implemented for all three providers** — Stripe (`constructEvent` over `rawBody` — [billing.controller.ts:64](apps/api/src/billing/billing.controller.ts)), Mux (`verifySignature` — [mux.service.ts:30](apps/api/src/video/mux.service.ts)), Clerk (svix `verify` — [clerk-webhook.controller.ts](apps/api/src/auth/clerk-webhook.controller.ts)). `rawBody: true` is set in [main.ts:11](apps/api/src/main.ts).
  - **⚠️ Correction (2026-06-08):** the Mux call referenced a non-existent `Mux.webhooks` **static** (the v9 SDK exposes `verifySignature` on the client *instance*), so it never compiled and the Mux path was never actually exercised. Fixed in **LMS-H3**. The Stripe/Clerk verifications were sound; all three still need the integration tests in LMS-C2.
- **PHI access logging is default-on.** The interceptor is a global `APP_INTERCEPTOR` ([audit.module.ts:12](apps/api/src/audit/audit.module.ts)) and *fails loud* in dev when a handler is missing `@PhiAccess`/`@SkipPhiAccess` ([phi-access.interceptor.ts:43](apps/api/src/audit/phi-access.interceptor.ts)).
- **Global request validation is on** — `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` ([main.ts:14](apps/api/src/main.ts)).
- **Global Clerk auth guard** ([auth.module.ts:16](apps/api/src/auth/auth.module.ts)) with a `@Public()` opt-out for webhooks/health.
- **Schema denormalizes `orgId` onto every PHI table** (`Staff`, `Assignment`, `Attempt`, `Certificate`, `RosterImport` all carry `orgId` + `@@index` — [schema.prisma](apps/api/prisma/schema.prisma)). This is what makes a *correct* guardrail cheap to build (see LMS-H1).
- **`.env` is gitignored and not tracked** — no committed-secret leak (see LMS-M1 for the residual).

---

# CRITICAL — block any PHI pilot

### LMS-C1 · The "cross-tenant isolation" test proves nothing 🔴
- **Where:** [apps/api/test/tenant-isolation.e2e-spec.ts](apps/api/test/tenant-isolation.e2e-spec.ts)
- **Root cause:** The roadmap calls real cross-tenant tests *"the #1 priority — write these before any other test."* The file that exists mocks `client._executeRequest` to return `[]` and only asserts whether the guardrail extension throws. It **never seeds Org A + Org B and never proves Org A cannot read Org B's row.** Two of its four cases assert *inside a `catch` block*, so when no error is thrown they pass **vacuously** (green for the wrong reason). The headline safety net is illusory.
- **Fix:**
  1. Stand up a real throwaway Postgres for tests (Testcontainers, or the CI `services:` block from LMS-H2) and run `prisma migrate deploy` against it in global setup.
  2. Seed two orgs (A, B) each with a site, staff, module, assignment, attempt, certificate, roster import.
  3. For **every** PHI-reading service/controller path (`me` assignments, `staff` list+getOne, `certificates` download, `reports` fetch/csv/pdf, `roster` get, `video` playback gate, `assignments` submit), authenticate as an Org-A actor and assert Org-B rows are invisible (empty list) or 404 (by-id) — and the reverse.
  4. Replace the vacuous `try/catch` assertions with direct `await expect(...).resolves/.rejects` form so a non-throw can't pass silently.
- **Verify:** Suite seeds 2 orgs; each PHI path has an A-cannot-see-B case; mutating tests confirm an Org-A token cannot update/delete an Org-B row. Flip one app-layer `orgId` check to prove a test actually fails (mutation check), then revert.
- **Effort:** L. **Status:** `[x]` (done 2026-06-08, merged PR #4; CI green). [test/tenant-isolation.e2e-spec.ts](apps/api/test/tenant-isolation.e2e-spec.ts) seeds two complete org graphs (A, B) in a real Postgres ([test/seed-two-orgs.ts](apps/api/test/seed-two-orgs.ts), via a plain unextended client) and drives the **real** HTTP stack ([test/harness.ts](apps/api/test/harness.ts): real tenant-scope middleware + Clerk guard + Prisma guardrail; only ClerkService/S3/Mux stubbed — the bearer token *is* the clerkUserId, so the real guard resolves the seeded Staff and sets org context). Every PHI path (me/assignments, staff list+getOne, certificate download, reports, assignment get, roster get, attempt submit, video gate) asserts A-cannot-see/mutate-B and the reverse with direct `.expect()`/`.resolves` forms (no vacuous catch-blocks), plus a non-vacuous proof the guardrail is load-bearing (a system read sees Org-B's row; the same read under Org-A context returns null). This is what proves the **LMS-H1 request→context→guardrail chain end-to-end**. Vitest is blocked in the dev sandbox, so the suite was first validated via an equivalent standalone ts-node harness (27/27) before CI ran the vitest version green. **Surfaced and fixed two latent DI wiring bugs that meant the app could never boot** (CI builds but never *ran* it — same class as LMS-H3): `QueueModule` made `@Global` (feature modules inject BullMQ queues without importing it) and `RosterModule` now imports `StaffModule` (RosterProcessor needs InvitationsService); added `unplugin-swc` so vitest emits the decorator metadata NestJS DI needs.

### LMS-C2 · ~Zero integration coverage on the PHI / billing / webhook surface 🔴
- **Where:** `apps/api` — only 3 spec files exist (`assignments.service.spec.ts`, `certificate.processor.spec.ts`, the mocked guardrail test). All mock Prisma; none hit a DB or HTTP layer.
- **Root cause:** Roadmap Phase 1 targets are unmet: cert-issuance idempotency, attempt scoring against real data, materialization cadence/expiry/grace math, and **signature-verified webhook handlers** (Stripe/Mux/Clerk) all lack tests; "≥60% service-layer coverage" is nowhere close. CI runs `vitest` but spins up no Postgres/Redis, so nothing that touches a real DB *can* be integration-tested today (see LMS-H2).
- **Fix:** On the LMS-C1 real-DB harness, add:
  1. **Certificate idempotency** — run `certificate.processor` twice for one assignment → exactly one `Certificate` row, stable `sha256`.
  2. **Attempt scoring** — promote the mocked `assignments.service.spec` cases to real-DB (single/multi/true-false; pass/fail boundary at `passMark`).
  3. **Materialization** — `materialize.processor` produces the right assignments for a role×site×jurisdiction `RequiredTraining` with correct `dueAt`/expiry/grace.
  4. **Webhooks** — POST a body with a bad signature → 400; with a valid signature → idempotent upsert (Stripe subscription; Mux status transition `preparing→ready`; Clerk org/user lifecycle). Use each SDK's test-signing helper.
  5. Wire `vitest run --coverage` and set a CI floor of 60% on `src/**/*.service.ts`.
- **Verify:** `pnpm --filter @maple-care/api test` green against a real DB in CI; coverage gate enforced; replaying any webhook is a no-op.
- **Effort:** L. **Status:** `[x]` (done 2026-06-08, merged PR #5; CI green). On the C1 real-DB harness: certificate idempotency ([flows.e2e-spec.ts](apps/api/test/flows.e2e-spec.ts)), attempt scoring (single/multiple/true-false with 2/3=67% as the exact pass boundary), materialization (dueAt/grace/expiry math), and all three **signature-verified** webhook handlers ([webhooks.e2e-spec.ts](apps/api/test/webhooks.e2e-spec.ts) — bad sig→400, valid→idempotent upsert, each signed with the provider's own helper; Mux runs real verification via `stubMux:false`). CI runs `vitest run --coverage` with a **60% floor on `src/**/*.service.ts`** (thin SDK adapters excluded). Coverage came in at **60.81% stmts / 62.46% lines / 74.68% funcs** — clears the floor but the margin is thin (low draggers: `required-training`/`modules`/`invitations` services). Surfaced/fixed a latent bug the scoring test was first to reach — `PrismaService.$transaction`/`$queryRaw`/`$executeRaw` returned the client method **unbound**, breaking `submitAttempt`/`onboarding` transactions in prod too (bound to the client; full fix is LMS-M2). Also logged **LMS-M4** (broken audit trail) and **LMS-M5** (materialization not idempotent). Tests run serially (`fileParallelism:false`) since they share one DB.

---

# HIGH — fix before first paid operator

### LMS-H1 · Tenant-isolation guardrail is broken-by-design 🟠
- **Where:** [apps/api/src/prisma/tenant-isolation.extension.ts](apps/api/src/prisma/tenant-isolation.extension.ts)
- **Root cause:** The extension requires a literal top-level `orgId` in the `where` clause of any read/write on a PHI model, else it throws in dev and `console.error`s in prod. Three defects:
  1. **Throws on legitimate `findUnique`.** Prisma's `findUnique.where` accepts only *unique* fields; `orgId` isn't unique, so `findUnique({ where: { id, orgId } })` is a type error — the rule is unsatisfiable. Yet ~15 `findUnique({ where: { id } })` calls on PHI models exist ([certificates.controller.ts:30](apps/api/src/certificates/certificates.controller.ts), [staff.service.ts:35](apps/api/src/staff/staff.service.ts), email/roster/onboarding/video/materialize). Each throws in dev/test (`NODE_ENV !== 'production'`).
  2. **Throws on valid relation/`staffId` scoping.** [me.controller.ts:37](apps/api/src/me/me.controller.ts) (`findMany` by `staffId`), [video.service.ts:72](apps/api/src/video/video.service.ts) (`findFirst` by `staffId`), and the retention `updateMany` scoped via `assignment.staff` ([retention.processor.ts:83](apps/api/src/retention/retention.processor.ts)) are correctly isolated but lack a top-level `orgId` → tripped.
  3. **Prod no-op + value-blind.** In prod it only logs, so it provides zero enforcement where it matters; and `"orgId" in where` is true even for `where: { orgId: undefined }`, so it's trivially bypassable.
  Net: simultaneously too strict (dev landmine) and useless (prod). It can't actually be running in dev today or most PHI endpoints would 500 — which means it's giving false confidence.
- **Fix:** Replace the "assert orgId is present" design with **request-scoped orgId injection**:
  1. Add an `AsyncLocalStorage<{ orgId: string }>` populated by the Clerk guard / `CurrentStaff` resolver.
  2. Prisma client extension that, for PHI models, *injects* `where.orgId = ctx.orgId` (and `data.orgId` on create) instead of asserting it — so isolation is automatic and `findUnique`-by-id becomes a guarded `findFirst({ where: { id, orgId } })` (or wrap reads to enforce orgId post-fetch where a true unique lookup is needed).
  3. For legitimate cross-org system jobs (retention sweep), expose an explicit `runAsSystem()` escape that sets a sentinel context — so cross-org access is *opt-in and greppable*, not an accidental prod no-op.
  4. Keep "throw in dev/test" for a genuinely missing context; in prod, fail-closed (throw) rather than log-and-pass for a missing org context — a 500 is safer than a cross-tenant leak.
- **Verify:** LMS-C1 suite passes with the new extension active (no `SKIP_*` env); a PHI query with no request context throws in *all* envs; retention sweep still processes cross-org under `runAsSystem()`; `where: { orgId: undefined }` no longer slips through.
- **Effort:** M. **Status:** `[x]` (done 2026-06-08, merged PR #3; CI green). Implemented as request-scoped **orgId injection** (not "assert orgId present"): an `AsyncLocalStorage` tenant context ([tenant-context.ts](apps/api/src/tenant/tenant-context.ts)) seeded by middleware before guards and populated by the Clerk guard; the extension ([tenant-isolation.extension.ts](apps/api/src/prisma/tenant-isolation.extension.ts)) injects `where.orgId`/`data.orgId` for the 5 PHI models, overrides any caller value (kills the `orgId: undefined` bypass), and **fails closed in every env**. `runAsSystem()` is the explicit cross-org escape (guard bootstrap, onboarding tenant-create, one-org-per-user check, all 5 processors incl. retention — **closes LMS-L2**); `runWithOrgContext()` for the Clerk-webhook invitation path. **Correction to root-cause #1:** the "findUnique can't carry orgId" claim was pre-Prisma-4.5; this repo is on Prisma 5 where *extended-where-unique* is GA (verified against the DB), so injection is uniform across all ops and **no call sites were rewritten**. Verified locally: typecheck/lint/build green + a DB smoke test (fail-closed / org-injection / system-passthrough / non-PHI-passthrough). **End-to-end isolation across two seeded orgs is proven by LMS-C1 (next).**

### LMS-H2 · CI is missing the drift gate, lint, typecheck, and DB services 🟠
- **Where:** [.github/workflows/lms-ci.yml](.github/workflows/lms-ci.yml)
- **Root cause:** vs. the roadmap's own spec (`install → typecheck → lint → test → prisma migrate diff --exit-code`), the workflow: comments out lint (`# pnpm lint`), has no standalone typecheck (only `build`), has **no `prisma migrate diff --exit-code` shadow-DB drift gate**, and spins up **no Postgres/Redis** (so LMS-C1/C2 integration tests can't run in CI). `prisma validate`/`format` don't catch schema-vs-migration drift.
- **Fix:**
  1. Add a `services:` block (postgres:16, redis:7) with health checks; set `DATABASE_URL`/`REDIS_URL` for the test job; run `prisma migrate deploy` before tests.
  2. Add `pnpm --filter @maple-care/api exec prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code` (fails on uncommitted schema drift).
  3. Re-enable lint (configure ESLint first) and add an explicit `typecheck` step (`tsc --noEmit` for api + web).
  4. Gate coverage (LMS-C2) at 60% on the service layer.
- **Verify:** A PR that edits `schema.prisma` without a migration fails CI; lint + typecheck run; integration tests run against the service DBs.
- **Effort:** M. **Status:** `[x]` (done 2026-06-08, merged PR #2; CI green). The drift gate proved itself on its first run by catching **real pre-existing drift** — `schema.prisma` had `orgId` (+FK, +`@@index`) on `Assignment`/`Attempt`/`Certificate` with no migration that added them, so a DB built from migrations lacked the columns the app + the (future) H1 guardrail rely on; fixed with a generated reconciling migration (additive, NOT NULL — empty-table only; no prod data exists). Wiring the web build also surfaced that the committed tree never built web in a clean env (missing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`); CI now supplies a non-secret build-time placeholder. **One caveat carried forward:** the **60% service-layer coverage floor is deferred to LMS-C2** — only coverage *plumbing* (vitest v8, lcov, `src/**/*.service.ts`) landed here; gating at a floor now would gate at ~0% since no service tests exist yet.

### LMS-H3 · The API does not type-check or build 🟠
- **Where:** `apps/api/src` — all 12 PHI controllers, [video/mux.service.ts:31](apps/api/src/video/mux.service.ts), [billing/stripe.service.ts:15](apps/api/src/billing/stripe.service.ts), [health/health.controller.ts:25](apps/api/src/health/health.controller.ts), [auth/clerk.service.ts:28](apps/api/src/auth/clerk.service.ts), and the `assignments`/`onboarding` services.
- **Root cause:** Discovered while wiring the LMS-H2 typecheck/build gate: `tsc --noEmit` **and** `nest build` both fail with **17 errors** on the committed tree. CI never caught it — the repo had no git history until 2026-06-08, and the pre-existing `Build API` step (which `nest build` runs through `tsc`) was therefore latently red from day one. The 17 errors: (a) **11×** — 12 controllers `extends PhiController` (the LMS-L1 no-op base) but only one calls `super()`, so every derived constructor is a `TS2377`; (b) `Mux.webhooks.verifySignature` references a non-existent **static** — the v9 SDK exposes it on the client instance — **so Mux webhook signature verification never compiled** (see the corrected "already solid" note above); (c) the Stripe `apiVersion` literal doesn't match the installed `stripe@17` types; (d) `PrismaHealthIndicator.pingCheck` is handed the hand-rolled `PrismaService`, not a `PrismaClient`; (e) **2×** `$transaction` callbacks have implicitly-`any` `tx`; (f) `ClerkService.verifyBearer` has a non-portable inferred return type.
- **Fix:** Delete the dead `PhiController` base + every `extends`/`super()` (**this also closes LMS-L1**); call `verifyWebhook` on the Mux client instance; pin Stripe `apiVersion` to the version the installed SDK is typed for; cast `PrismaService → PrismaClient` at the health `pingCheck` with an inline pointer to LMS-M2 (stopgap until M2 makes it a real client); annotate `tx: Prisma.TransactionClient`; give `verifyBearer` an explicit `ReturnType<typeof import("@clerk/backend").verifyToken>`.
- **Verify:** `pnpm -r run typecheck` and `pnpm --filter @maple-care/api build` both exit 0 (api + web). This is the **prerequisite for LMS-H2's typecheck/build gate to be green** — sequence it before H2.
- **Effort:** S. **Status:** `[x]` (done 2026-06-08; verified `tsc --noEmit` + `nest build` green locally).

---

# MEDIUM — first patch

### LMS-M1 · Live Clerk test secrets sit in the working-tree `.env` 🟡
- **Where:** `.env` (gitignored, **not** tracked — confirmed via `git ls-files`).
- **Root cause:** `.env` carries working `CLERK_SECRET_KEY=sk_test_…` and publishable keys in plaintext (the file's own header says "Never commit real secrets"). No git leak, but these are live credentials to a Clerk dev instance sitting on disk; if the tree is ever shared/zipped they're exposed.
- **Fix:** Rotate the Clerk dev keys; keep real values only in the developer's local untracked `.env`, and ensure `.env.example` carries placeholders only. Document the rotation in the runbook.
- **Verify:** `.env.example` has no real key material; rotated keys; `git ls-files | grep .env` shows only `.env.example`.
- **Effort:** S. **Status:** `[ ]`

### LMS-M2 · `PrismaService` hand-rolled getter wrapper drops type safety and hides new models 🟡
- **Where:** [apps/api/src/prisma/prisma.service.ts](apps/api/src/prisma/prisma.service.ts)
- **Root cause:** Each model is exposed via a manual getter and `$transaction`/`$queryRaw`/`$executeRaw` are cast to `any`. A new model is invisible until someone adds a getter; the `any` casts erase type safety on raw queries and transactions.
- **Fix:** Use the conventional `extends PrismaClient` (or expose the `$extends`-wrapped client via a typed accessor) with `onModuleInit`/`onModuleDestroy`, so all models + raw helpers are typed and auto-available. Re-confirm the tenant extension still applies through `$transaction` callbacks after the change.
- **Verify:** `tsc --noEmit` clean with no `as any` on the Prisma surface; a newly added model is usable without editing `PrismaService`; LMS-C1 transaction-path tests still enforce isolation.
- **Effort:** S. **Status:** `[x]` (done 2026-06-08, merged PR #7; CI green). `PrismaService` now `extends PrismaClient` and returns the `$extends`-wrapped (guardrail) client from its constructor — so all model delegates + raw helpers are inherited and typed (no manual getters, no `as any`), a new model needs no edit here, `this.prisma.<model>` still routes through the LMS-H1 guardrail, and Nest still drives `onModuleInit`/`onModuleDestroy`. Removed all three stopgaps that pointed here: the C2 `.bind()` shim on `$transaction`/`$queryRaw`/`$executeRaw`, the H3 `as unknown as PrismaClient` cast at the health `pingCheck`, and the H3 `tx: Prisma.TransactionClient` annotations. Validated via the ts-node harness (boot + isolation + in-`$transaction` guardrail + scoring) — 8/8.

### LMS-M3 · DTO/validation coverage unconfirmed; no reject-path test 🟡
- **Where:** `apps/api/src/**/dto/*`, controllers accepting body/query.
- **Root cause:** `ValidationPipe` is global and several DTOs exist, but the roadmap's "DTO on every body/query handler" and "smoke-test that unknown fields / wrong types reject with 400" are unverified.
- **Fix:** Audit every controller method that takes `@Body()`/`@Query()` for a class-validator DTO; add a small e2e that POSTs an unknown field and a wrong-typed field to a representative endpoint and asserts 400.
- **Verify:** Reject-path e2e green; no controller body/query param typed as a bare `any`/inline object.
- **Effort:** S. **Status:** `[x]` (done 2026-06-08, merged PR #8; CI green). Audited all nine `@Body()`/`@Query()` handlers — each is backed by a class-validator DTO (no bare `any`/inline). Added [test/reject-path.e2e-spec.ts](apps/api/test/reject-path.e2e-spec.ts): the global `ValidationPipe` returns 400 for unknown-field / wrong-type / missing-required / bad-enum on a body endpoint and unknown / wrong-typed query params on a query endpoint, with a valid-body 201 sanity case.

### LMS-M4 · Audit trail silently broken for staff-initiated actions 🟡
- **Where:** [apps/api/src/certificates/certificate.processor.ts](apps/api/src/certificates/certificate.processor.ts), [apps/api/src/assignments/assignments.service.ts](apps/api/src/assignments/assignments.service.ts), [apps/api/src/staff/invitations.service.ts](apps/api/src/staff/invitations.service.ts) — via [apps/api/src/audit/audit.service.ts](apps/api/src/audit/audit.service.ts).
- **Root cause:** These callers pass a **`Staff` id** as `AuditEvent.actorId`, but that column's FK references **`User.id`** ([schema.prisma](apps/api/prisma/schema.prisma) — `actor User? @relation(fields:[actorId])`). Every such `auditEvent.create` therefore throws a foreign-key violation, which `AuditService.record` deliberately swallows ("audit failures must never break the request"). Net: **certificate-issued, attempt-completed/failed, and staff-invited events are never recorded** — for a PHI product the audit trail is a core compliance artifact, and it's quietly empty for the most important staff actions. Discovered by LMS-C2's cert/scoring tests (the swallowed FK errors surfaced in the logs). Onboarding's `actorId: userId` is correct; billing omits `actorId`.
- **Fix:** Pass the actor's **User** id (resolve `staff.userId`, or change call sites that hold a `staffId` to look it up / thread the userId through). Optionally add a second `actorStaffId` column if both are wanted. Add a test asserting the expected `AuditEvent` rows actually land (not swallowed).
- **Verify:** Issuing a certificate / completing an attempt / inviting staff each writes the expected `AuditEvent`; no swallowed FK errors in logs.
- **Effort:** S. **Status:** `[x]` (done 2026-06-08, merged PR #6; CI green). All six call sites now pass a **User** id: added `userId` to `StaffContext` (populated by the Clerk guard) for the StaffContext callers (required-training, invitations); `certificate.processor` uses `assignment.staff.userId`; `assignments.submitAttempt` resolves the staff's userId; `roster.processor` resolves the uploader's userId (fails the import cleanly if absent). The cert-idempotency suite now asserts a `certificate.issued` `AuditEvent` lands with `actorId === the worker's User id` (zero rows before the fix). Also clears the swallowed-FK log spam seen in CI.

### LMS-M5 · Required-training materialization is not idempotent 🟡
- **Where:** [apps/api/src/required-training/materialize.processor.ts](apps/api/src/required-training/materialize.processor.ts).
- **Root cause:** The only thing preventing duplicate `Assignment`s on a re-run is the `@@unique([staffId, moduleId, dueAt])` constraint, but `dueAt` is computed as `Date.now() + graceDays` **at run time** — so two runs even milliseconds apart produce different `dueAt` and both succeed. A retried/re-enqueued materialize job (or an operator re-saving a `RequiredTraining`) silently creates duplicate assignments for the same staff+module. LMS-C2 tests the cadence/grace/expiry **math** but intentionally does **not** assert idempotency (it doesn't hold).
- **Fix:** Make materialization idempotent regardless of timing — e.g. dedupe on an existing open assignment for `(staffId, moduleId, requiredTrainingId)` before creating, or derive a deterministic `dueAt` (truncate to the day, or base it on a fixed anchor) so the unique constraint actually catches re-runs.
- **Verify:** Running `materialize` twice for the same `RequiredTraining` yields one assignment per matching staff.
- **Effort:** S. **Status:** `[ ]`

---

# LOW — backlog

### LMS-L1 · `PhiController` base class is a dead no-op marker 🔵
- **Where:** [apps/api/src/audit/phi.controller.ts](apps/api/src/audit/phi.controller.ts) — 12 controllers `extends PhiController`, but it does nothing (the interceptor is global).
- **Fix:** Either delete it (and the `extends` clauses) or give it real behavior. Right now it implies structure that doesn't exist.
- **Effort:** S. **Status:** `[x]` — resolved in **LMS-H3**: the base class and all 12 `extends` clauses were deleted (they were also the source of 11 of H3's compile errors).

### LMS-L2 · Retention sweep relies on the prod guardrail no-op for cross-org deletes 🔵
- **Where:** [apps/api/src/retention/retention.processor.ts:50-128](apps/api/src/retention/retention.processor.ts)
- **Root cause:** The sweep does intentional cross-org `deleteMany`/`updateMany` (correct for a global system job), but today that only "works" because the prod guardrail logs-and-passes. Under the LMS-H1 fail-closed rewrite it must be made explicit.
- **Fix:** Run the sweep under the LMS-H1 `runAsSystem()` escape so cross-org access is intentional and greppable, not incidental.
- **Verify:** Retention test passes under the fail-closed extension.
- **Effort:** S (folds into LMS-H1). **Status:** `[x]` — done in **LMS-H1** (PR #3): `RetentionProcessor.process()` wraps the whole sweep in `runAsSystem()`, so its cross-org `deleteMany`/`updateMany`/`findMany` on PHI models are now intentional and greppable rather than relying on the old prod no-op. Retention-under-fail-closed test is part of LMS-C2.

---

## Roadmap reconciliation — Phase 1 as-built

Supersedes the `[ ]` boxes under "LMS Phase 1" in `ROADMAP.md` (in the `psw` repo). Status uses this doc's legend.

| Roadmap Phase 1 line | As-built | Tracking |
| --- | --- | --- |
| Vitest + supertest harness | `[x]` real Nest+supertest e2e harness wired (PR #4) | LMS-C1 ✓ |
| Cross-tenant isolation tests (#1) | `[x]` real two-org seeded suite, non-vacuous (PR #4) | LMS-C1 ✓ |
| Certificate issuance idempotency | `[x]` real-DB test (PR #5) | LMS-C2 ✓ |
| Attempt scoring | `[x]` real-DB single/multi/T-F + pass boundary (PR #5) | LMS-C2 ✓ |
| Required-training materialization | `[x]` real-DB grace/expiry math (PR #5) | LMS-C2 ✓ |
| Stripe webhook handler | `[x]` sig-verify + idempotency tested (PR #5) | LMS-C2 ✓ |
| Mux webhook handler | `[x]` sig-verify tested (real verify, PR #5) | LMS-C2 ✓ |
| Clerk webhook handler | `[x]` svix-verify + materialize tested (PR #5) | LMS-C2 ✓ |
| ≥60% service coverage | `[x]` gated in CI — 60.81% stmts (PR #5) | LMS-C2 ✓ |
| class-validator + class-transformer | `[x]` installed | — |
| Global `ValidationPipe` | `[x]` `main.ts` | — |
| DTOs on every body/query handler | `[x]` all 9 handlers audited (PR #8) | LMS-M3 ✓ |
| Reject-unknown-field smoke test | `[x]` reject-path e2e (PR #8) | LMS-M3 ✓ |
| Base `PhiController` default-on | `[x]` interceptor global; the no-op base class was deleted in LMS-H3 | LMS-L1 ✓ / LMS-H3 |
| `@SkipPhiAccess()` decorator | `[x]` exists + used | — |
| Migrate PHI controllers to annotated | `[x]` all annotated | — |
| Test: every handler annotated-or-skipped | `[~]` runtime guard only, no test | LMS-C2 |
| `lms-ci.yml` on every PR | `[x]` push + PR to main | — |
| CI steps (typecheck/lint/test/migrate-diff) | `[x]` services + drift gate + lint + typecheck live (PR #2) | LMS-H2 ✓ |
| Dockerfile `apps/api` | `[x]` | — |
| Dockerfile `apps/web` | `[x]` | — |
| Preview env per PR | `[ ]` (optional) | — |
| Prisma `$extends` orgId guardrail | `[x]` rewritten as fail-closed orgId injection (PR #3) | LMS-H1 ✓ |
| Throws dev / logs prod | `[x]` superseded — now fails closed (throws) in *every* env | LMS-H1 ✓ |

---

## Suggested sequencing (when a resume trigger fires)

One engineer, ~1.5–2 weeks of focused work to make the LMS PHI-pilot-safe. Order matters — the guardrail rewrite and the test harness are mutually reinforcing.

0. **LMS-H3 (make the API type-check/build)** — discovered while starting H2; the api doesn't compile, so the H2 typecheck/build gate can't be green until this lands. Folds in LMS-L1. ~½ day. **✅ done 2026-06-08.**
1. **LMS-H2 (CI services + drift gate)** — stands up the Postgres/Redis CI block the integration tests need, and the migrate-diff gate. ~½ day. **✅ done 2026-06-08 (PR #2).**
2. **LMS-H1 (guardrail rewrite)** — AsyncLocalStorage orgId injection + `runAsSystem()` (folds in LMS-L2). Fixes the dev landmine so the rest of the suite can run. ~2 days. **✅ done 2026-06-08 (PR #3, folds LMS-L2).**
3. **LMS-C1 (real cross-tenant suite)** — the #1 commercial-risk closer; depends on 1 + 2. ~3 days. **✅ done 2026-06-08 (PR #4); also fixed two latent DI wiring bugs that blocked app boot.**
4. **LMS-C2 (idempotency/scoring/materialization/webhook tests + coverage gate)** — on the same harness. ~3 days. **✅ done 2026-06-08 (PR #5); 60% coverage gate live; surfaced LMS-M4/M5.**
5. **LMS-M1/M2/M3/M4/M5** — cleanup pass. (LMS-L1 already closed by H3.) M4 (broken audit trail) and M5 (non-idempotent materialization) were logged during LMS-C2; M4 is a compliance gap worth doing early.

**Definition of done:** real two-org isolation suite green in CI against a live Postgres; guardrail fail-closed in every env with an explicit system-job escape; webhook + cert-idempotency tested; ≥60% service coverage gated; ROADMAP Part A reconciled to this doc. Only then is the LMS "happy path works" → "trustable with operator PHI."

---

## Changelog
- _2026-06-08_ — **LMS-M3 done (PR #8, CI green).** All nine `@Body()`/`@Query()` handlers confirmed backed by class-validator DTOs; added a reject-path e2e proving the global ValidationPipe 400s on unknown/wrong-typed/missing/bad-enum input (body + query). Remaining: LMS-M1, LMS-M5.
- _2026-06-08_ — **LMS-M2 done (PR #7, CI green).** `PrismaService` now `extends PrismaClient` (constructor returns the guardrail-extended client) instead of the hand-rolled getter wrapper — models + raw helpers inherited and typed, no `as any`, new models auto-available, guardrail + lifecycle intact. Retired the three stopgaps that pointed here (C2 `$transaction` bind, H3 health-pingCheck cast, H3 `tx` annotations). Remaining: LMS-M1/M3/M5.
- _2026-06-08_ — **LMS-M4 done (PR #6, CI green).** Audit events now record against the actor's **User** id (the FK target) instead of a Staff id, so cert-issued / attempt-completed / required-training / invite-revoke events actually persist instead of silently failing the FK and being swallowed. Added `userId` to `StaffContext`; resolved the userId at the processor/service sites. Test asserts the `certificate.issued` event lands with the right `actorId`. Remaining: LMS-M1/M2/M3/M5.
- _2026-06-08_ — **LMS-C2 done (PR #5, CI green).** Real-DB tests on the C1 harness for certificate idempotency, attempt scoring (single/multiple/true-false + the 67% pass boundary), required-training materialization (grace/expiry math), and signature-verified webhooks for all three providers (Stripe/Mux/Clerk — bad sig→400, valid→idempotent, real verification incl. Mux). Wired `vitest run --coverage` with a **60% service-layer floor** (thin SDK adapters excluded); landed at 60.81% stmts / 62.46% lines (thin margin). Fixed a latent `PrismaService.$transaction`/`$queryRaw`/`$executeRaw` unbound-`this` bug that broke transactions in prod (bound to the client; full fix is M2). Tests run serially (`fileParallelism:false`) against the shared DB. **Only LMS-M1–M5 remain** (M1 key rotation, M2 extend PrismaClient, M3 DTO reject-path, M4 audit trail, M5 materialization idempotency).
- _2026-06-08_ — **Logged two findings surfaced by LMS-C2 work:** **LMS-M4** (audit trail silently broken for staff-initiated actions — `actorId` passed a `Staff` id but the FK references `User.id`, so `AuditService` swallows the FK error and cert-issued/attempt/invite events never record) and **LMS-M5** (required-training materialization isn't idempotent — time-based `dueAt` defeats the unique constraint on re-runs). Both MEDIUM; M4 is a compliance gap.
- _2026-06-08_ — **LMS-C1 done (PR #4, CI green) — the #1 risk closed.** Real two-org cross-tenant isolation suite: seeds two full org graphs in a live Postgres and drives the real HTTP stack (tenant-scope middleware → Clerk guard → Prisma guardrail; only Clerk/S3/Mux stubbed) to prove an Org-A actor can't see or mutate Org-B PHI across every path, with a non-vacuous guardrail-is-load-bearing proof. This is the end-to-end proof of the LMS-H1 chain. Wiring it up **surfaced two latent DI bugs that meant the app could never have booted** (CI builds but never ran it — same class as LMS-H3): `QueueModule` is now `@Global` and `RosterModule` imports `StaffModule`. Added `@nestjs/testing`/`supertest` harness + `unplugin-swc` (so vitest emits the decorator metadata NestJS DI needs). Vitest is blocked in the dev sandbox, so the suite was validated via an equivalent ts-node harness (27/27) before CI ran it green. **LMS-C2 (idempotency/scoring/materialization/webhook tests + 60% coverage gate) is next.**
- _2026-06-08_ — **LMS-H1 done (PR #3, CI green); folds LMS-L2.** Replaced the broken "assert `orgId` is in the where clause" guardrail (a dev landmine + prod no-op) with request-scoped **orgId injection**: an `AsyncLocalStorage` tenant context seeded by middleware before guards and populated by the Clerk guard, and a Prisma extension that injects `where.orgId`/`data.orgId` for the 5 PHI models, overrides any caller value (kills the `orgId: undefined` bypass), and **fails closed (throws) in every env**. `runAsSystem()` is the explicit greppable cross-org escape (guard bootstrap, onboarding tenant-create, the one-org-per-user existence check, and all 5 BullMQ processors incl. the retention sweep → **closes LMS-L2**); `runWithOrgContext()` covers the Clerk-webhook invitation path. **Corrected the audit's root-cause #1:** "findUnique can't carry orgId" was pre-Prisma-4.5 — this repo is on Prisma 5 where extended-where-unique is GA (verified against the DB), so injection is uniform and no call sites were rewritten. Also caught a lazy-PrismaPromise + AsyncLocalStorage pitfall (a `runX(() => prisma.op())` callback activates outside the scope) and fixed the affected sites to await inside. Verified locally (typecheck/lint/build + a DB smoke test of all four behaviors); the **two-org seeded end-to-end isolation proof is LMS-C1, next**. The old fully-mocked tenant-isolation e2e-spec was replaced with a unit spec for the pure `scopeQueryArgs` core.
- _2026-06-08_ — **LMS-H2 done (PR #2, CI green).** Rewrote `lms-ci.yml`: `postgres:16-alpine` + `redis:7-alpine` health-checked services (creds matching `.env.example`), pipeline `prisma generate → validate → typecheck → lint → migrate deploy → drift gate → test → build api → build web`. Drift gate = `migrate diff --from-schema-datasource --to-schema-datamodel --exit-code` against the migrate-deploy'd DB (no shadow DB). Added baseline ESLint (api flat config + web `next/core-web-vitals`, noisy rules → `warn` for a CI-green baseline) and vitest coverage *plumbing* (the 60% floor stays deferred to **LMS-C2** — no service tests exist yet). Wiring the gate surfaced and fixed three pre-existing problems: (a) **real schema drift** — `orgId` (+FK/+index) was on `Assignment`/`Attempt`/`Certificate` in `schema.prisma` but in no migration; added a generated reconciling migration (additive, NOT NULL, empty-table only — no prod data); (b) the web build never built in a clean env (missing Clerk publishable key) — CI now supplies a non-secret build-time placeholder; (c) deprecated tsconfig `baseUrl` (would break the new typecheck gate under TS 6+) removed, and the `pnpm/action-setup` `version:` input dropped in favour of the `packageManager` pin. **LMS-H1 (guardrail rewrite) sequences next.**
- _2026-06-08_ — **Resume work started.** `git init` on the LMS repo (was entirely untracked); baseline tree committed to `main`. Logged **LMS-H3** (the api doesn't type-check/build — 17 pre-existing errors surfaced while wiring the H2 gate) and shipped its fix on branch `fix/lms-h3-api-typecheck-build`: deleted the dead `PhiController` base (**closes LMS-L1**), fixed the Mux instance-vs-static webhook bug (corrected the "already solid" claim), Stripe `apiVersion`, the health `pingCheck` cast, two `$transaction` `tx` annotations, and the Clerk return type. Verified `tsc --noEmit` + `nest build` green (api + web). H2 (CI services + drift gate + lint, already drafted) sequences next, on top of H3.
- _2026-06-08_ — Doc created. Full code-read of `apps/api`; reconciled ROADMAP Part A Phase 1 against reality (most of Phase 1 built but unverified); logged LMS-C1/C2 + LMS-H1/H2 + LMS-M1–M3 + LMS-L1/L2. No code changes — LMS remains paused; this is the resume punch list.
