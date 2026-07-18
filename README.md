# Maple Care

Compliance training for Atlantic-Canada **home-care agencies**, delivered as a
feature of ElderCare Companion (separate `psw` repo).
Launch jurisdiction: **New Brunswick** (statutory bilingual delivery + PHIPAA).

> **Direction (2026-07-18):** home-care only — the original LTC track is
> dropped. Access is an **ElderCare entitlement**: agencies get training as
> part of their ElderCare relationship and are never billed twice (the LMS has
> no billing of its own; Stripe was removed). The training engine itself stays
> setting-agnostic. See `LMS_COMPLETION_PLAN.md` for the integration plan.

## What it is

A multi-tenant training engine for the agencies ElderCare serves. It solves two
recurring pains for an agency's Director of Care:

1. **Onboarding new caregivers fast.** Roster CSV → assignments → completions.
2. **Surviving an audit.** Per-branch, per-topic, per-date-range PDF/CSV
   exports, plus completions flowing back into ElderCare as tracked, expiring
   staff credentials.

The home-care module catalog (reframed IPAC/falls/privacy/abuse-reporting plus
net-new lone-worker, travel-between-clients, and in-home-boundaries modules) is
authored under Phase B of the completion plan — the actually-mandated NB
home-support training list must be confirmed against the regulations first.
Agencies may also upload their own existing PowerPoints, PDFs, and videos.

## Stack

| Layer    | Choice                                          | Why                                                  |
| -------- | ----------------------------------------------- | ---------------------------------------------------- |
| Web      | Next.js 15 (App Router) + TypeScript + Tailwind | RSC, SEO for the operator landing pages              |
| API      | NestJS 10                                       | DI + module structure scales past one founder        |
| ORM / DB | Prisma + PostgreSQL 16                          | Multi-tenant schema, PR-reviewable migrations        |
| Cache    | Redis 7                                         | BullMQ jobs, rate limiting                           |
| Auth     | Clerk (interim — ElderCare OIDC after LMS-M6)   | LMS-native invitations; federation swap is gated     |
| Payments | — none                                          | ElderCare-entitled; ElderCare bills, nobody pays twice |
| Video    | Mux (signed playback)                           | Adaptive streaming, no infra                         |
| Jobs     | BullMQ on Redis                                 | Webhook retries, emails, transcoding callbacks      |
| Email    | Resend (mocked in dev)                          | Bilingual EN/FR transactional email                  |
| Storage  | S3 (`ca-central-1`)                             | Data residency for PHIPAA / NB OLA compliance        |

## Atlantic-specific design notes

- **Multi-jurisdiction from day 1.** `Organization.jurisdiction` (NB / NS / PE / NL / ON) drives the required-training catalog and inspector-export template. Role taxonomy is namespaced per jurisdiction (`NB_RA`, `NS_CCA`, ...) — not a hardcoded enum.
- **Bilingual EN/FR is statutory in NB.** `Module.titleEn / titleFr / descriptionEn / descriptionFr`, bilingual quiz prompts, fr-CA email templates. AODA WCAG 2.1 AA tracked for ON expansion.
- **PHIPAA per-record access logging.** Every read of a Staff / Assignment / Certificate writes a `RecordAccessLog` row. Append-only `AuditEvent` ledger covers state changes (assignment.completed, certificate.issued, staff.invited, etc.).
- **Data residency.** All persistence (RDS, S3) deploys to `ca-central-1`. Operators sign a DPA at onboarding (`Organization.dataResidencyAttestedAt`).

## Quick start

```bash
# 1. Install
pnpm install

# 2. Env
cp .env.example .env

# 3. Boot Postgres + Redis (+ MinIO as a local S3, so certificate PDFs and
#    roster uploads work without an AWS account — see the AWS section of
#    .env.example for the env values to uncomment)
pnpm db:up

# 4. Migrate + seed (NB demo org "Foyer Acadien de Moncton" + 8 modules)
pnpm db:migrate
pnpm --filter @maple-care/api run seed

# 5. Run web + api together
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000
- Health: http://localhost:4000/health

### Webhooks (local)

```bash
# Mux + Clerk: tunnel via cloudflared / ngrok and configure in their dashboards
```

## Project layout

```
apps/
  web/    Next.js 15 — operator landing, staff dashboard, training UI
  api/    NestJS — multi-tenant API, Prisma, business logic
docker-compose.yml   Postgres + Redis for local dev
```

## What's done

- **Multi-tenant schema.** `Organization → Site → Staff` with `OrgPermission` (STAFF / SITE_ADMIN / ORG_ADMIN), per-jurisdiction `Role` lookup, bilingual `Module / Lesson / Quiz / Question`, `RequiredTraining` (per role × site × jurisdiction), `Assignment / Attempt / Certificate`, `Invitation`, `LessonProgress`, `RosterImport`, `AuditEvent`, `RecordAccessLog`.
- **Auth.** Clerk on web (`/sign-in`, `/sign-up`, `/dashboard` protected), global Clerk JWT guard on the API, `CurrentStaff()` decorator resolves tenant context.
- **Modules API.** `GET /modules` and `GET /modules/:slug` org-scoped + jurisdiction-filtered.
- **Mux.** Signed playback gated by `Assignment` (not Enrollment). Org-admin-only direct upload for org-private modules. Webhook signature-verified.
- **Email.** Bilingual EN/FR templates for assignment.assigned, assignment.due-soon, certificate.issued. Resend in prod, dev-mock in local.
- **Audit + access log.** `AuditService.record()` for state changes. `RecordAccessLog` model ready to be written from the access middleware (next batch).

## What's next

Everything above is built and verified end-to-end (see `docs/UX_VERIFIED.md`).
The roadmap lives in `LMS_COMPLETION_PLAN.md`: Phase B (author the home-care
catalog — regulatory confirmation first), the gated Clerk→ElderCare-OIDC swap
(LMS-M6 steps 4–5), the ElderCare certificate flow-back + entitlement (Phase D),
and go-live hardening (Phase E). `LMS_PRE_LAUNCH_AUDIT.md` tracks safety state.

## Why this stack vs. the original list

Dropped GraphQL (one client), Elasticsearch (Postgres FTS later), Kubernetes (Fly.io / Render for the first year), FastAPI sidecar (no AI features yet), and the consumer-marketplace surface (public catalog, per-course checkout). Billing was dropped entirely in 2026-07 — Maple Care is an ElderCare-entitled feature, so ElderCare's subscription is the only bill an agency sees.
