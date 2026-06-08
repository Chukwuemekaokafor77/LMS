# Maple Care

Compliance training for Atlantic-Canada long-term-care operators.
Launch jurisdiction: **New Brunswick** (statutory bilingual delivery + PHIPAA).

## What it is

A multi-tenant LMS sold per-seat to LTC operators. The product solves two
recurring pains for a Director of Care:

1. **Onboarding new staff fast.** Roster CSV → assignments → completions.
2. **Surviving an inspection.** Per-site, per-topic, per-date-range PDF/CSV
   exports formatted for NB Department of Social Development inspections.

Eight mandatory modules are authored by Maple Care (IPAC, Fire Safety,
WHMIS 2015, Resident Rights, Abuse & Reporting, PHIPAA Privacy, Falls
Prevention, Responsive Behaviours / Dementia). Operators may also upload
their own existing PowerPoints, PDFs, and videos.

## Stack

| Layer    | Choice                                          | Why                                                  |
| -------- | ----------------------------------------------- | ---------------------------------------------------- |
| Web      | Next.js 15 (App Router) + TypeScript + Tailwind | RSC, SEO for the operator landing pages              |
| API      | NestJS 10                                       | DI + module structure scales past one founder        |
| ORM / DB | Prisma + PostgreSQL 16                          | Multi-tenant schema, PR-reviewable migrations        |
| Cache    | Redis 7                                         | BullMQ jobs, rate limiting                           |
| Auth     | Clerk                                           | Org-invited staff via magic link; org admin via SSO  |
| Payments | Stripe Subscriptions + Stripe Tax               | Per-seat billing, GST/HST handled                    |
| Video    | Mux (signed playback)                           | Adaptive streaming, no infra                         |
| Jobs     | BullMQ on Redis                                 | Webhook retries, emails, transcoding callbacks      |
| Email    | Resend (mocked in dev)                          | Bilingual EN/FR transactional email                  |
| Storage  | S3 (`ca-central-1`)                             | Data residency for PHIPAA / NB OLA compliance        |

## Atlantic-specific design notes

- **Multi-jurisdiction from day 1.** `Organization.jurisdiction` (NB / NS / PE / NL / ON) drives the required-training catalog and inspector-export template. Role taxonomy is namespaced per jurisdiction (`NB_RA`, `NS_CCA`, ...) — not a hardcoded enum.
- **Bilingual EN/FR is statutory in NB.** `Module.titleEn / titleFr / descriptionEn / descriptionFr`, bilingual quiz prompts, fr-CA email templates. AODA WCAG 2.1 AA tracked for ON expansion.
- **PHIPAA per-record access logging.** Every read of a Staff / Assignment / Certificate writes a `RecordAccessLog` row. Append-only `AuditEvent` ledger covers state changes (assignment.completed, certificate.issued, subscription.upserted, etc.).
- **Data residency.** All persistence (RDS, S3) deploys to `ca-central-1`. Operators sign a DPA at onboarding (`Organization.dataResidencyAttestedAt`).

## Quick start

```bash
# 1. Install
pnpm install

# 2. Env
cp .env.example .env

# 3. Boot Postgres + Redis
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
stripe listen --forward-to localhost:4000/webhooks/stripe
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

- **Multi-tenant schema.** `Organization → Site → Staff` with `OrgPermission` (STAFF / SITE_ADMIN / ORG_ADMIN), per-jurisdiction `Role` lookup, bilingual `Module / Lesson / Quiz / Question`, `RequiredTraining` (per role × site × jurisdiction), `Assignment / Attempt / Certificate`, `Subscription`, `RosterImport`, `AuditEvent`, `RecordAccessLog`.
- **Auth.** Clerk on web (`/sign-in`, `/sign-up`, `/dashboard` protected), global Clerk JWT guard on the API, `CurrentStaff()` decorator resolves tenant context.
- **Modules API.** `GET /modules` and `GET /modules/:slug` org-scoped + jurisdiction-filtered.
- **Mux.** Signed playback gated by `Assignment` (not Enrollment). Org-admin-only direct upload for org-private modules. Webhook signature-verified.
- **Stripe.** Per-seat subscription checkout for org admins (`POST /billing/checkout`) + signature-verified webhook handler that upserts `Subscription` rows.
- **Email.** Bilingual EN/FR templates for assignment.assigned, assignment.due-soon, certificate.issued. Resend in prod, dev-mock in local.
- **Audit + access log.** `AuditService.record()` for state changes. `RecordAccessLog` model ready to be written from the access middleware (next batch).

## What's next (Phase 2 continuation)

1. **Operator onboarding.** Org create flow, magic-link staff invites, Clerk Organizations integration.
2. **Roster CSV import.** Staff bulk-create with validation, error report.
3. **RequiredTraining → Assignment generator.** Job that materializes assignments from policy.
4. **Quiz attempt + attestation flow.** Submit, score, sign, hash, persist.
5. **Certificate PDF generation.** Signed, S3-stored, sha256-tracked.
6. **Inspector exports.** Per-site / per-topic / per-date-range PDF + CSV.
7. **PHIPAA hardening.** `RecordAccessLog` middleware on all PHI-touching endpoints, retention scheduler, role-scoped access checks.
8. **Authoring the 8 modules.** Scripts, slides, EN/FR captions, quiz banks.

## Why this stack vs. the original list

Dropped GraphQL (one client), Elasticsearch (Postgres FTS later), Kubernetes (Fly.io / Render for the first year), FastAPI sidecar (no AI features yet). Removed the consumer-marketplace surface (creator Stripe Connect, public catalog, per-course checkout) — Maple Care sells subscriptions to operators, not courses to individuals.
