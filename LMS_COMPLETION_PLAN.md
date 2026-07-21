# Maple Care LMS — Completion & ElderCare Integration Plan

**Purpose.** A fresh-session-ready plan to (1) finish the LMS and (2) integrate it
with ElderCare so the two form one platform. Complements
[LMS_PRE_LAUNCH_AUDIT.md](LMS_PRE_LAUNCH_AUDIT.md) (the hardening punch list) — that
doc says what's *unsafe/unverified*; this doc says what's *unbuilt* and how the two
products join.

**Written:** 2026-07-17, from a code-read of both repos (`C:\Users\emekamichael\LMS`
and the `psw` ElderCare repo). Paths are relative to each repo's root.

> **⚠️ Direction amendments — 2026-07-18 (owner decisions, supersede anything
> below that conflicts):**
> 1. **Home-care only. The LTC parallel track is dropped.** Maple Care is a
>    home-care training tool distributed through ElderCare — the §1 value
>    proposition ("training shows up inside the ElderCare tool you already run
>    your agency in") *is* the direction, not one of two tracks. The engine
>    stays setting-agnostic (that costs nothing), but no LTC catalog, LTC
>    role-set, or LTC inspector-export work is planned. Re-opening LTC later is
>    a catalog/config decision, not a rebuild.
> 2. **Stripe is decommissioned; the LMS is an ElderCare-entitled product.**
>    An agency's access to training comes from its ElderCare relationship —
>    training is an ElderCare *feature*, priced inside ElderCare's own billing.
>    Nobody pays twice. The LMS billing module / `Subscription` model / Stripe
>    keys are removed pre-launch (no customers exist); the replacement is an
>    ElderCare-fed **entitlement** (OIDC claims or webhook → seats/status),
>    which lands with Phases C–D. Phase E loses the whole Stripe/Tax workload,
>    and LMS-M1's rotation scope shrinks by one provider.
> 3. **(2026-07-19) The LMS is renamed ElderCare Academy**, hosted at
>    `academy.<eldercare-domain>`, entered exclusively via a seamless
>    one-time-token handoff from inside ElderCare (no Academy login screen).
>    This supersedes the full-OIDC-provider shape of Seam 1 — see
>    [docs/ELDERCARE_ACADEMY_SSO_PLAN.md](docs/ELDERCARE_ACADEMY_SSO_PLAN.md).
>    "Maple Care" branding is retired when A6 (rename) lands.

---

## 0. Verified current state (don't re-derive)

**Two separate products, two stacks, adjacent care settings:**

| | ElderCare Companion (`psw`) | Maple Care LMS (this repo) |
|---|---|---|
| Domain | **Home-care agency** management (PSWs visiting clients) | **Long-term-care** compliance **training** (facility staff) |
| Stack | FastAPI + SQLAlchemy + Postgres; React Native (Expo) app | NestJS 10 + Prisma + Postgres; Next.js 15 web |
| Auth | Homegrown, Canadian-resident JWT + MFA (audited, RLS-hardened) | **Clerk (US IdP)** — must be removed (LMS-M6) |
| Tenancy | per-org + Postgres RLS backstop (live in prod) | per-org app-layer injection (proven by LMS-C1) |
| Status | Live, pre-first-customer, actively developed | **Paused**, backend safety done, UX/content/integration unbuilt |

**LMS API (`apps/api`) — SOLID, do not rebuild** (per the audit, all CRITICAL+HIGH closed):
- Feature modules exist and are tenant-scoped: `assignments`, `staff`, `roster`,
  `certificates`, `reports`, `billing` (Stripe), `video` (Mux), `onboarding`,
  `required-training`, `retention`, `me`, `modules`.
- Tenant isolation is **request-scoped orgId injection**, fail-closed, proven across
  two seeded orgs (LMS-C1). Webhooks (Stripe/Mux/Clerk) signature-verified + tested
  (LMS-C2). PHI access logging default-on. CI stands up Postgres+Redis with a
  schema-drift gate + 60% service-coverage floor.
- Data model ([apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma)) is
  complete and well-shaped: `Organization → Site → Staff`, `Module → Lesson →
  Quiz → Question`, `RequiredTraining` (role×site×jurisdiction×cadence),
  `Assignment → Attempt → Certificate`, `Subscription`, `RosterImport`,
  append-only `AuditEvent` + `RecordAccessLog`.

**LMS web (`apps/web`) — SCAFFOLDED, needs finish + verify:**
- Pages: landing, `dashboard`, `admin/{staff,roster,required-trainings,reports,billing}`,
  `onboarding` + `accept-invite`, `training/[slug]` + `training/[slug]/quiz`,
  Clerk `sign-in`/`sign-up`.
- Components: `quiz-runner`, `roster-uploader`, `certificate-download`,
  `invite-staff-form`, `create-required-training-form`, `billing-actions`,
  `report-filters`, `onboarding-form`.
- ~~**Gap:** the video **lesson player** is not evident (no video/player component found);
  the learning flow (watch lessons → unlock quiz → pass → cert) is only partly wired.
  Web was only reviewed structure-level in the audit — **treat every page as
  build-but-unverified until driven end-to-end.**~~ **Closed 2026-07-17 (Phase A
  pass):** lesson player + `LessonProgress` + server-side quiz gate built (PR #12)
  and every page driven end-to-end — see [docs/UX_VERIFIED.md](docs/UX_VERIFIED.md).

**Content — NOT authored.** The 8 mandatory modules (IPAC, Fire Safety, WHMIS 2015,
Resident Rights, Abuse & Reporting, PHIPAA Privacy, Falls, Responsive Behaviours) have
a schema home but no real lessons/videos/quizzes. This is product+SME work, not just code.

**The one standing blocker for any PHI pilot:** **LMS-M6 — Clerk (US IdP) breaks the
ca-central-1 residency claim.** Decision on record = remove Clerk, federate identity
from ElderCare. Deferred once for ElderCare MVP focus. The audit already carries a
**code-verified Clerk-decommission plan** — reuse it verbatim; do not re-derive.

---

## 1. Integration architecture — "one platform, two services"

**Recommendation: do NOT merge the codebases.** Different stacks, different care
settings, different regulatory frames. Integrate at the **identity** and **data**
seams so they present as one platform:

- **ElderCare = system of record for people, orgs, and identity.** It already holds
  agencies, staff, roles, and — critically — **staff certifications with expiry
  alerting** (`StaffCertification` + `CredentialType` catalog + the daily
  credential-expiry scan).
- **Maple Care LMS = system of record for training delivery + compliance evidence.**
  Video lessons, quizzes, per-jurisdiction required-training policy, inspector exports.
  *(Amended 2026-07-18: billing is not an LMS concern — access is an ElderCare
  entitlement; per-seat Stripe billing was removed.)*

The value proposition of integrating (why this is worth doing): **"Your caregivers'
mandatory training is assigned, delivered, and tracked — and shows up as
tracked, expiring credentials inside the ElderCare tool you already run your agency
in."** ElderCare gets a training engine without building one; the LMS gets
distribution + a Canadian identity backbone.

### The three integration seams

**Seam 1 — Identity (auth): ElderCare becomes an OIDC provider; LMS federates from it.**
This is LMS-M6 + a new ElderCare capability. ElderCare has **no OIDC-provider surface
today** (its `SSOConfiguration` is the *consumer* side — enterprise orgs logging *into*
ElderCare via their own IdP; the opposite direction). So this seam has a hard
prerequisite in the `psw` repo: make ElderCare mint verifiable OIDC/JWKS tokens.
**Detailed implementation plan + sizing (2026-07-19, v2 — owner-revised):**
[docs/ELDERCARE_ACADEMY_SSO_PLAN.md](docs/ELDERCARE_ACADEMY_SSO_PLAN.md) —
the full-OIDC design was superseded the same day: the LMS becomes **ElderCare
Academy** on `academy.<eldercare-domain>` with a **one-time-token handoff SSO**
(seamless "Training" button from inside ElderCare; no Academy login screen).
~1.5–2 weeks end-to-end (ElderCare ~2–3d, Academy ~3–4d, rename ~1d, cutover
~1d). OIDC remains on the shelf for any future third-party clients.
- **Security-sensitive:** this modifies the just-audited, RLS-hardened ElderCare auth
  core → own review required.
- **De-risking:** build the LMS side against a provider-agnostic `IdentityProvider`
  interface (the audit's M6 plan defines it), so the cutover is a verifier swap.

**Seam 2 — Org & staff provisioning: JIT from OIDC claims.**
When an ElderCare caregiver logs into the LMS, provision their LMS `Organization`
(from ElderCare agency), `Site` (from ElderCare `Facility`), `Staff` + `Role` from
the OIDC claims. The LMS `upsertFromClerk` already upserts on lookup-miss — the same
shape works against OIDC `userinfo`. **Role mapping is the real work** (Seam 2a).

**Seam 2a — Role taxonomy mapping.** ElderCare uses generic care roles
(`psw`, `nurse`, `care_coordinator`, …); the LMS uses jurisdiction-namespaced
regulatory roles (`NB_RA`, `NB_PCW`, `NB_RN`, …). A mapping table (ElderCare role ×
jurisdiction → LMS `Role.code`) drives which `RequiredTraining` applies. **Scoping
decision:** the LMS was built for LTC facilities; serving ElderCare's *home-care*
agencies means adding a home-care role set + home-care `RequiredTraining` catalog
(the engine is already per-jurisdiction and role-namespaced, so this is data, not
rearchitecture). Decide early whether the first integrated pilot is LTC or home-care.

**Seam 3 — Certificate flow-back (the killer feature).**
LMS `Certificate` (id, assignment, `sha256`, issuedAt) → ElderCare `StaffCertification`.
The ElderCare model maps almost 1:1:

| LMS `Certificate` / `Assignment` | ElderCare `StaffCertification` |
|---|---|
| module title | `certification_name` / `certification_type` |
| "Maple Care LMS" | `issuing_authority` |
| certificate id | `certificate_number` |
| issuedAt | `issued_date` |
| issuedAt + `RequiredTraining.cadence` | `expiry_date` (drives ElderCare expiry alerts!) |
| `sha256` | `attachment_sha256` (tamper-evidence already modeled) |
| signed cert PDF (S3) | `attachment_url` |
| — | `is_verified = true` (LMS-issued = authoritative) |

Mechanism: on `certificate.issued`, the LMS calls an ElderCare inbound webhook
(HMAC-signed, ca-central-1 → ca-central-1) that upserts the `StaffCertification`.
Idempotent on certificate id. This closes the loop: LMS delivers training →
ElderCare shows it as a tracked, expiring credential and fires the existing
renewal reminders.

### Data-model mapping (identity + tenancy)

| Concept | ElderCare | LMS | Join key |
|---|---|---|---|
| Tenant | `Organization` (agency) | `Organization` (operator) | OIDC `org` claim ↔ external org id |
| Person | `User` (email) | `User` (email) → `Staff` | **email** (both `@unique`) + OIDC `sub` → `externalAuthId` |
| Location | `Facility` | `Site` | facility id in OIDC claim |
| Role | `role` string | `Role.code` | mapping table (Seam 2a) |
| Credential | `StaffCertification` ← | `Certificate` | certificate id (flow-back) |

**Residency:** both services deploy to `ca-central-1`. Once Clerk is gone, identity
data (names/emails/auth events) stays in Canada end-to-end — which is the entire point
of Seam 1 and the compliance story for NB/NS/PE/NL.

### 1.5 Care-setting fit — does Maple Care suit home-care agencies?

ElderCare serves **home-care agencies** (PSWs visiting clients in their homes); Maple
Care was built for **LTC facilities** (residents in a licensed building). These are
adjacent but distinct settings, so the honest answer is: **yes — with a home-care
content track, not as-is and not a rebuild.** The platform is setting-agnostic; the
*content and compliance catalog* are LTC-authored and need a home-care variant.

**Why the platform itself fits either setting** (already true in the schema, do not
rebuild): `Role` is a per-jurisdiction lookup **table** (not an enum); `RequiredTraining`
is configurable policy ("role Y completes module Z on cadence C"), not a fixed LTC list;
`Module.jurisdiction` + `Module.orgId` are both nullable (global vs. per-org); operators
can upload their own content. Certificate issuance, bilingual EN/FR, per-seat billing,
and inspector exports are all setting-neutral mechanics.

**What is genuinely LTC-specific — the real work — is content + config, not
architecture.**

Module-by-module transfer of the 8 mandatory modules to home care:

| Module | Home-care fit |
|---|---|
| WHMIS 2015 | Transfers ~unchanged |
| Privacy (PHIPAA / PIPEDA) | Transfers ~unchanged |
| Abuse & Reporting / adult protection | Transfers — statutory duty applies both settings |
| IPAC (infection control) | Mostly — reframe: no facility IPAC team, in-home context |
| Falls Prevention | Mostly — reframe to the client's home environment |
| Responsive Behaviours / Dementia | Transfers — arguably *more* relevant to home care |
| Resident Rights | Reframe — "resident/facility" → "client/in the home"; different basis |
| Fire Safety | Weak fit — facility evacuation/drills don't map to a caregiver in a home |

Plus **net-new home-care modules LTC doesn't cover** (these are what a home-care
Director of Care will actually judge the product on): lone/solo-worker safety, safe
travel/driving between clients, working in a client's private home (boundaries, family,
pets), and emergency response when alone with a client (no code team).

Three model/config mismatches — all **data-level, not architectural**:
1. **`Site` assumes a licensed facility** (`regulatorLicenseNumber`). Home care has
   distributed private residences — repurpose `Site` as a **branch / service-area**, or
   make it optional.
2. **Inspector-export templates** are formatted for NB Dept. of Social Development
   *nursing-home* inspections — home-care agency audits are a different format.
3. **Role taxonomy** — add the home-support / PSW roles ElderCare uses (Seam 2a).

**Strategic upside — the fork is cheap right now.** Because the modules are *not yet
authored* (Phase B), choosing home-care-first is not a detour — it is just picking
*which catalog to write first*. Taken now it costs almost nothing; taken later it means
not breaking existing LTC content + customers. If ElderCare's agencies are the first
real distribution, **author the home-care track first.**

**The one non-code piece of homework (do before authoring/marketing as "compliance"):**
the home-care mandatory-training list rests on a **different regulatory basis than the
Nursing Homes Act** — home support / home care in NB (and NS/PE/NL) is regulated
separately. The 8-module list is LTC-derived; what is *actually legally mandated* for a
home-support worker must be confirmed against the real regulations before it is authored
and sold as compliance. This is regulatory research, not engineering.

**Net recommendation:** ~~run Maple Care as a **two-track compliance platform under one
engine** — LTC and home-care catalogs side by side.~~ **Superseded 2026-07-18: home-care
only — the LTC track is dropped (owner decision; see the amendments block at top).**
For the ElderCare integration, author the home-care catalog, repurpose `Site` as
branch/service-area, reframe the transferable modules, and add the net-new home-care
ones. The engine remains setting-agnostic, so an LTC catalog stays *possible* later,
but it is not planned.

---

## 2. The completion plan (phased)

> **📌 Status snapshot — session close 2026-07-20.** The product is functionally
> complete and integrated end-to-end. **Phases A, C, D are DONE; Phase B is
> partial (tooling + starter content done, SME review + more content remain);
> Phase E (go-live hardening) is the only wholly-remaining phase.**
>
> | Phase | State | Evidence |
> |---|---|---|
> | A — learning experience | ✅ done | [docs/UX_VERIFIED.md](docs/UX_VERIFIED.md) |
> | B — content catalog | 🟡 partial | authoring UI + library-promote built; **11-module** bilingual **starter library** seeded (`seed:homecare`, 43 lessons / 41 quiz Qs). **Remaining:** SME review before "compliance" use; more modules; per-province role rows / policy sets |
> | C — remove Clerk / federate | ✅ done | LMS-M6 complete: ElderCare Academy handoff SSO, Clerk deleted end-to-end (API + web), identity in ca-central-1 |
> | D — certificate flow-back (+ entitlement) | ✅ done | Seam 3 both repos: completions upsert a verified, expiring `StaffCertification` in ElderCare; entitlement gate enforced at SSO (claims-based) **and mid-session** (2026-07-21 entitlement-lapse webhook, both repos — bullet 5 below) |
> | E — go-live hardening | ⬜ remaining | see the Phase E checklist below — deployment/ops, needs owner decisions |
>
> **What remains to launch (the close-out list):**
> 1. **LMS-M1 secrets rotation** (only open audit finding) — Mux/AWS/Resend + the
>    two Academy secrets (`ACADEMY_EXCHANGE_SECRET`, `ACADEMY_SESSION_SECRET`).
>    Clerk keys are gone, not rotated.
> 2. **Deploy** `academy.<eldercare-domain>` (both apps → ca-central-1) and wire
>    the live `ELDERCARE_API_URL` + shared HMAC secret + session secret + the
>    real `NEXT_PUBLIC_ELDERCARE_APP_URL` between the deployed apps.
> 3. **DB backups + restore drill** (mirror ElderCare's posture).
> 4. **Real-provider verification** the local stack can't do: Mux upload→webhook
>    →playback with real keys; Resend prod email; and the SSO + flow-back driven
>    against the *real* ElderCare deployment (not the local mocks used so far).
> 5. ~~**Entitlement lapse webhook (optional, Phase D follow-up):** claims-at-SSO
>    covers login; an ElderCare→Academy webhook would close the mid-session
>    window. Not required for a pilot.~~ **✅ DONE 2026-07-21 (both repos).**
>    Academy: an `Entitlement` row (SSO writes the baseline) + `POST
>    /webhooks/eldercare/entitlement` (HMAC service auth, idempotent on
>    `event_id`, ordered by `event_at`) + a mid-session 403 in the auth guard
>    when the row is non-active (absent row = no block; SSO already gated).
>    ElderCare (`psw`): `academy_notify.push_entitlement` fires on every Stripe
>    billing transition + cancel (best-effort; the Academy is idempotent and
>    still gates at next SSO). Mirrors the Phase-D HMAC pattern in reverse.
>    Merged LMS PR #35 / psw PR #219.
> 6. **Content (Phase B):** SME review of the starter library; author remaining
>    modules; bilingual fr-CA QA; AODA/WCAG 2.1 AA pass (ON expansion).

Phases A–B are **LMS-internal** and can proceed **now**, with no dependency on the
ElderCare OIDC work. Phases C–D are the integration core and gate on the ElderCare
prerequisite. Phase E is go-live. This ordering lets real progress happen before the
risky cross-repo auth change.

### Phase A — Finish & verify the learning experience (LMS-internal)
**Status: ✅ done 2026-07-17.** Every flow below driven end-to-end with real Clerk
auth; the missing lesson player + quiz gate built (PR #12); build-but-broken finds
fixed (answer-key leak PR #13, Stripe error passthrough PR #14; local-S3 DX in
`chore/local-dev-s3-env-hygiene`). Evidence + the one open product question
(attempt limits) in [docs/UX_VERIFIED.md](docs/UX_VERIFIED.md).

**Goal:** a caregiver can log in, watch a module's lessons, pass the quiz, and get a
certificate — driven end-to-end, not just typechecking.
- Build/verify the **video lesson player** (Mux signed playback) in
  `app/training/[slug]` — gate the quiz on lesson completion.
- Verify `quiz-runner` → `POST attempt` scoring (single/multi/true-false, pass at
  `passMark`), attempt limits, and the pass → `Assignment.completed` →
  `certificate.processor` chain (already unit-covered; verify through the UI).
- Verify `certificate-download` (owner/same-org-admin gate).
- Verify the admin surfaces: `staff`, `roster` (CSV upload → invitations →
  materialize), `required-trainings` (create → materialize assignments), `reports`
  (per-site/topic/date-range CSV+PDF inspector export), `billing`.
- **Run the app** (`pnpm dev`) against the seed org and click every flow. The audit
  proved the API; this phase proves the UX.
- **Deliverable:** a green end-to-end manual pass + a short `docs/UX_VERIFIED.md`
  checklist. Fix whatever's build-but-broken (expect some, per the audit's H3 class).

### Phase B — Author the training catalog (product + SME)
**Goal:** a real modular competency library (see B0 findings below), bilingual
EN/FR (NB's official-languages reality + fr-CA agencies; not a claim of
provincial mandate).

**Authoring tooling: ✅ built 2026-07-19.** Org admins author modules/lessons/
quizzes and upload videos in **Admin → Modules** (PRs #24/#25). The **shared
library** is authored the same way in Maple Care's own HQ org, then promoted:
`pnpm --filter @maple-care/api run library:promote -- <slug> [--jurisdiction X]`
flips it to `orgId = null` (demote back with `--demote-to <orgId>` to edit).
Module ids survive the round-trip, so assignments keep working.

**Content model (owner decision 2026-07-20): BYO-first.** Agencies add their
own content/materials via the authoring UI; a licensed catalog can be added
post-revenue. A **home-care STARTER LIBRARY** ships as global modules (seed:
`pnpm --filter @maple-care/api run seed:homecare`) — **11** bilingual
best-practice modules (Home Support Fundamentals, Lone-Worker Safety, IPAC in
the Home, Falls Prevention in the Home, Privacy & Confidentiality, Safe Travel
Between Clients, Safe Lifting & Client Handling, Dementia & Responsive
Behaviours, Medication Support in the Home, Recognizing & Reporting Abuse and
Neglect, Working in the Client's Home: Boundaries/Family/Pets), **43 lessons +
41 EN/FR quiz questions** (expanded from 6/23/21 on 2026-07-21). **Starter/example
only — SME review required before use as compliance; not marketed as provincially
mandated** (see §B0). Lesson videos remain BYO. Remaining Phase B work: SME review
of the starter content, more modules, per-province role rows / policy sets.
- For each module: lesson videos (Mux), bilingual titles/descriptions, a quiz with
  bilingual prompts/choices/explanations, regulatory citations JSON, `passMark`.
- This is content/SME work with an admin-authoring UI assist. Decide build-vs-license
  for the actual training material. **Not a code blocker** for A/C/D but blocks a real
  pilot.

**B0 — regulatory basis: ✅ DONE 2026-07-18 (owner research). Findings below
supersede the earlier assumptions and reshape Phase B.**

**Finding 1 — NB, PE, and NL have NO single provincially mandated home-support
training list.** Home support is not presented as a regulated occupation in
those provinces; the practical standard is **employer- and program-driven**
(public occupation summaries cite: some secondary education, college/home-support
courses, first aid certification, and training in elderly / disability /
convalescent care — *as employer requirements, not statute*).
- **Positioning guardrail:** never market the catalog as "provincially mandated"
  in NB/PE/NL. The honest claim — and the better product story — is:
  *"your agency defines its training policy; Maple Care delivers, tracks, and
  proves it."* That is literally what `RequiredTraining` is (per-org, per-role,
  per-site policy), so the engine fits the real market *better* than a fixed
  statutory list would have.

**Finding 2 — NS is the credentialed outlier.** Continuing Care Assistant (CCA)
is a real certification path: a CCA program through a **licensed education
provider** + the provincial CCA Certification Exam, with recognized prior
learning (RPL) routes, tied to licensed facilities and publicly funded home-care
agencies.
- **Positioning guardrail:** Maple Care can deliver CCA **prep, exam prep, and
  annual continuing education**, and can capture RPL evidence — it must never
  present an LMS certificate as CCA certification (we are not a licensed CCA
  education provider).

**Finding 3 — several "required" items are externally issued credentials, not
deliverable training:** First Aid, CPR, vulnerable-sector/background checks.
These are *tracked with expiry*, not taught by video. **Decision: that tracking
belongs to ElderCare's existing `StaffCertification` + credential-expiry
alerting (Seam 3), not to a duplicate LMS build.** The LMS delivers courses and
flows its own certificates back; externally issued credentials are recorded on
the ElderCare side. (Pre-integration interim, if ever needed: a thin
evidence-upload feature — not planned.)

**Catalog architecture (decided): a modular competency library, not one
"mandatory track."** Three layers, all expressible in the existing schema:
1. **Core modules (all provinces — `Module.jurisdiction = null`):** home-support
   fundamentals; elder-care & disability-care basics; convalescent-care basics;
   IPAC (in-home); safe lifting / client handling; falls & home safety; dementia
   / responsive behaviours; person-centred care; client communication;
   documentation, care notes & incident reporting; privacy/confidentiality
   (PHIPAA/PIPEDA); medication support (where applicable); lone-worker safety;
   safe travel between clients; working in a private home (boundaries, family,
   pets); solo emergency response.
2. **Province-specific modules (`Module.jurisdiction = NB|NS|PE|NL`):** NS CCA
   prep / exam prep / CE; per-province privacy statutes where they diverge;
   employer-orientation templates per province.
3. **Role pathways (`Role` rows × `RequiredTraining` policy):** home support
   worker, NS CCA, supervisor/coordinator, agency admin — each province gets its
   role rows (Seam 2a mapping from ElderCare roles) and a default policy set
   agencies can adopt then edit.

Already-supported mechanics (no build needed): expiry/refresher scheduling
(`TrainingCadence` + due-soon emails), proof-of-completion (`Certificate` +
sha256), quiz/attempt records with attestation, onboarding checklists
(materialization on staff creation = the dashboard's outstanding list).
Remaining config work from §1.5 stands: repurpose `Site` as branch/service-area,
agency-audit export template (drop the "NB nursing-home inspection" framing).

- ~~The LTC catalog remains a parallel track under the same engine — author it when an
  LTC operator is the customer.~~ **Dropped 2026-07-18: home-care only.**

### Phase C — Remove Clerk, federate from ElderCare (integration core)
**Status: ✅ done 2026-07-20 — LMS-M6 complete.** Delivered as the **ElderCare
Academy handoff SSO** (not the full-OIDC shape originally sketched below — see
[docs/ELDERCARE_ACADEMY_SSO_PLAN.md](docs/ELDERCARE_ACADEMY_SSO_PLAN.md)):
ElderCare mints a one-time token → the Academy exchanges it (HMAC) → JIT-provisions
org/site/user/staff via the Seam-2a role map → issues its own 8h session. Clerk was
**hard-deleted** across API + web (owner's call — no real users yet), so there was
no dual-stack window. Identity data is ca-central-1 end-to-end. The step list below
is the original plan, kept for history; steps 1–3 landed as pre-gate refactors, 4–7
as the cutover.

**Original decommission sequence (historical):**
1. Introduce an `IdentityProvider` interface behind the current Clerk callers (guard +
   current-user) with Clerk still the impl — pure refactor, CI green. *(LMS-internal;
   can land before the gate.)*
2. Rename `User.clerkUserId → externalAuthId` (additive migration; update guard,
   current-user, webhook, seeds, harness stub). *(LMS-internal.)*
3. Replace Clerk invitations with an **LMS-native `Invitation` table** (token, email,
   orgId, siteId, roleCode, expiry) — self-contained, drops the magic-link +
   webhook-metadata mechanism. *(LMS-internal; recommended over ElderCare-owns-invites.)*
4. **Swap the impl** to the ElderCare OIDC verifier (verify against ElderCare JWKS);
   delete `clerk.service.ts`, `clerk-webhook.controller.ts`, Clerk deps + env. *(Gated.)*
5. **Web:** replace `ClerkProvider`/`clerkMiddleware`/sign-in-up with the OIDC redirect
   to ElderCare; replace `auth().getToken()` in `lib/api.ts`; update the 7 hook-using
   components. *(Gated.)*
6. **Tests:** rename the stubbed provider in `harness.ts`; C1/C2 isolation must stay
   green (org-context resolution unchanged — only its source moved).
7. **Security re-review** (touches the audited auth core) + verify: no Clerk in the
   auth path, identity data in Canada.

### Phase D — Certificate flow-back to ElderCare (Seam 3) + entitlement flow-in
**Status: ✅ done 2026-07-20.** On `certificate.issued` the Academy pushes the
completion to ElderCare's `POST /academy/certificate` (HMAC service auth, BullMQ
retry+backoff, idempotent on certificate id), which upserts a **verified, expiring
`StaffCertification`** — feeding ElderCare's existing credential-expiry reminders
(no new tracking feature; the models already matched the Seam-3 table). Entitlement
is enforced **at SSO from the exchange claims** (active/trialing → in; lapsed →
403) **and mid-session** — the entitlement-lapse webhook shipped 2026-07-21 (both
repos): ElderCare's `academy_notify.push_entitlement` fires on every billing
transition → the Academy's `POST /webhooks/eldercare/entitlement` upserts an
`Entitlement` row → the auth guard blocks the org's live sessions on lapse and
restores them on reactivation. Original design notes retained below.

**Gate:** an authenticated service channel between the two apps (falls out of Phase C).
- **Entitlement flow-in (added 2026-07-18, replaces LMS billing):** the same
  channel carries the agency's entitlement (active/lapsed + seat count) from
  ElderCare into the LMS — via OIDC claims at JIT-provision time and/or an
  ElderCare→LMS webhook upserting an `Entitlement` row. A small guard check
  blocks org access when the ElderCare subscription lapses. Pricing/seat policy
  is ElderCare (`psw`) product work, out of LMS scope.
- **ElderCare side (`psw`):** inbound HMAC-signed webhook `POST /integrations/lms/certificate`
  → upsert `StaffCertification` (idempotent on certificate id; map per the Seam-3 table;
  `expiry_date` from cadence → feeds the existing credential-expiry scan). New router;
  gate behind the permission model; audit it.
- **LMS side:** on `certificate.issued`, enqueue a BullMQ job that calls the ElderCare
  webhook; retry with backoff; record delivery in `AuditEvent`.
- **Role/cred mapping:** LMS module ↔ ElderCare `CredentialType.code` (extend the
  ElderCare catalog with the 8 training creds).
- **Verify:** complete a training in the LMS → the caregiver's ElderCare credential
  list shows it with the right expiry → the renewal reminder fires on schedule.

### Phase E — Go-live hardening  ⬜ **the only remaining phase (deployment/ops)**

> **Go-live kit prepared 2026-07-21 — see [docs/PHASE_E_GO_LIVE.md](docs/PHASE_E_GO_LIVE.md).**
> The codeable half of items 1–4 is done (runbooks, DO App Platform specs,
> backup/restore scripts, verification checklist + a signed exchange probe); the
> owner-supplied half (real keys, cloud/DNS, live runs) is checklisted there.
> **Two findings:** (a) **residency resolved → DigitalOcean App Platform TOR1**
> (ElderCare's actual host — off Render, not AWS); (b) the **"exchange 504" is
> not a bug** — it's a Cloudflare-masked origin **503 "Academy is not configured"**
> because `ACADEMY_EXCHANGE_SECRET` is unset on ElderCare prod; setting it (item 2
> wiring) fixes it.

- **LMS-M1 secrets rotation** (the only open audit finding): Mux, AWS, Resend +
  the two Academy secrets (`ACADEMY_EXCHANGE_SECRET` shared with ElderCare,
  `ACADEMY_SESSION_SECRET`). Clerk keys are deleted, not rotated.
- **Deploy** `academy.<eldercare-domain>` — `apps/api` + `apps/web` to
  ca-central-1; set the live `ELDERCARE_API_URL`, the shared HMAC secret, the
  session secret, and `NEXT_PUBLIC_ELDERCARE_APP_URL` between the deployed apps.
- Mux prod; Resend prod; S3 ca-central-1 bucket + lifecycle/retention (the
  `scripts/setup-s3.sh` runbook exists).
- **DB backups + restore drill** (mirror the ElderCare posture).
- **Real-provider verification** the local stack could not do: Mux
  upload→webhook→playback with real keys; Resend prod email; and the SSO +
  certificate flow-back driven against the **real** ElderCare deployment
  (both were verified locally against mocks only).
- Bilingual QA (fr-CA), AODA/WCAG 2.1 AA pass (ON expansion).
- Load-check the reports/export path (inspector PDFs).

---

## 3. Running this in a fresh session

**First, read (in order):** this file → [LMS_PRE_LAUNCH_AUDIT.md](LMS_PRE_LAUNCH_AUDIT.md)
(esp. the "What is already solid" list and the LMS-M6 decommission plan) → the
`psw` repo memory (`auth-residency-constraint`, `lms-as-built-reconciliation`).

**The one dependency that reorders everything:** Seam 1 (ElderCare OIDC provider) is a
multi-week, security-reviewed change to ElderCare's auth core, and the owner has already
deferred it once for MVP focus. So:
- **Start with Phases A + B and Phase C steps 1–3** — all LMS-internal, real progress,
  zero dependency on ElderCare. This also shrinks the eventual cutover to a verifier swap.
- **Do NOT begin Phase C steps 4–5 or Phase D** until ElderCare issues verifiable OIDC
  tokens. Treat "ElderCare OIDC provider exists" as the explicit resume gate.

**Suggested first-session scope (no cross-repo risk):** Phase A end-to-end
verification + fix the build-but-broken UX + Phase C step 1 (the `IdentityProvider`
refactor) + step 2 (`externalAuthId` rename). That leaves the LMS provider-swap-ready
and the learning experience proven, without touching ElderCare's auth.

**Key risks / decisions to surface to the owner up front:**
1. **LTC vs home-care — DECIDED (updated 2026-07-18): home-care ONLY.** The LTC
   track is dropped, not deferred (see the amendments block at top). Maple Care is a
   home-care training product distributed through ElderCare, and access is an
   ElderCare entitlement (Stripe removed). ~~Gating non-code item unchanged: confirm
   the real home-care mandatory-training list (different regulatory basis than the
   Nursing Homes Act) before authoring.~~ **Done 2026-07-18 — see the B0 findings
   in Phase B:** NB/PE/NL are employer-driven (no provincial mandate → position as
   policy-driven competency library, never "provincially mandated"); NS has the
   CCA certification path (prep/CE only — we are not a licensed CCA provider);
   First Aid/CPR/background checks are externally issued credentials tracked on
   the ElderCare side (Seam 3), not LMS courseware.
2. **The OIDC prerequisite is the real cost.** Everything downstream of identity gates
   on a security-sensitive ElderCare change. Budget it explicitly or keep the LMS on
   Clerk with a signed DPA as an *interim* (the audit's stated minimum) — but that
   forfeits the residency claim, so it's pilot-only.
3. **Don't regress the audited safety infra.** The tenant-isolation chain (LMS-H1/C1)
   and PHI logging are load-bearing; the Clerk swap must keep the C1/C2 suites green.
4. **Content is a non-code critical path.** Phase B (real bilingual modules) can't be
   coded away and blocks a real pilot regardless of engineering progress.
