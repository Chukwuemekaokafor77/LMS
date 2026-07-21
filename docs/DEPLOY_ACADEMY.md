# Deploying ElderCare Academy (Phase E, item 2)

How to stand up `academy.eldercare-companion.com` (web) + its API, wired to the
live ElderCare deployment. Specs live in [.do/](../.do/). This is the code-side
runbook; **you supply the cloud account, the managed clusters, DNS, and the real
secret values.**

---

## 1. Hosting & residency decision — RESOLVED: DigitalOcean App Platform, TOR1

The original plan named **AWS ca-central-1**; an earlier note worried ElderCare
was on **Render** (no Canadian region). Both are moot. **ElderCare already runs
on DigitalOcean App Platform, region TOR1 (Toronto)** — Managed Postgres,
Managed Valkey, and Spaces all in TOR1 for Canadian residency (see the psw
`docs/PRODUCTION_RUNBOOK.md`; its "Decommission Render" section confirms they
migrated *off* Render *to* DO).

**Decision: host the Academy on DigitalOcean App Platform, TOR1**, alongside
ElderCare. Rationale:
- **Residency** — TOR1 keeps identity + training PHI in Canada end-to-end, which
  is the whole point of removing Clerk. Equivalent to the ca-central-1 goal.
- **Ops consistency** — one cloud, one dashboard, one runbook style, DO-native
  managed PG + Redis + Spaces (the API already speaks S3; Spaces is S3-compatible).
- **The web app is SSR** and renders PHI server-side, so it can't sit on a
  US-only serverless edge — DO TOR1 is the residency-safe home for it too.

> If you ever prefer AWS ca-central-1 instead, the Dockerfiles are cloud-neutral;
> only the managed-service wiring in the `.do/` specs changes. The decision above
> is a recommendation, not a lock-in.

## 2. Topology

Two DO apps (the API's routes live at root — `/me`, `/auth/sso`, `/webhooks/…` —
so it gets its own hostname rather than a path prefix under the web app):

| App | Spec | Domain | Notes |
|---|---|---|---|
| `academy-web` | [.do/academy-web.app.yaml](../.do/academy-web.app.yaml) | `academy.eldercare-companion.com` | Next.js standalone; SSR forwards the session cookie as bearer |
| `academy-api` | [.do/academy-api.app.yaml](../.do/academy-api.app.yaml) | `api.academy.eldercare-companion.com` | NestJS + in-process BullMQ workers; owns PG + Redis + a PRE_DEPLOY migration job |

## 3. One-time provisioning (you)

1. **Managed clusters** (DO → Databases, region **TOR1**):
   - Postgres 16 → `academy-pg-prod`
   - Valkey/Redis → `academy-redis-prod`
   - Add both apps to each cluster's **Trusted Sources**.
2. **Object storage** — DO Spaces bucket `academy-uploads-prod` (TOR1) + a
   bucket-scoped access key; or an AWS S3 ca-central-1 bucket (`scripts/setup-s3.sh`
   documents the bucket/CORS setup). Set `AWS_ENDPOINT_URL_S3` for Spaces.
3. **DNS** (Namecheap, matching ElderCare's pattern): CNAME
   `academy` and `api.academy` → the two DO apps' `*.ondigitalocean.app` targets
   (DO shows the target after the app is created).
4. **Secrets** — generate/collect the real values (see
   [SECRETS_ROTATION_RUNBOOK.md](SECRETS_ROTATION_RUNBOOK.md)) and set them on the
   `academy-api` app as encrypted env vars. `ACADEMY_EXCHANGE_SECRET` **must be
   byte-identical** to ElderCare's `ACADEMY_EXCHANGE_SECRET`.

## 4. Deploy

```bash
doctl auth init
doctl apps create --spec .do/academy-api.app.yaml   # set SECRET envs after, or via dashboard
doctl apps create --spec .do/academy-web.app.yaml
```

Both watch `main` with autodeploy ON (matching ElderCare) — merging to `main`
redeploys. The API's `migrate` PRE_DEPLOY job runs `prisma migrate deploy` before
new code goes live.

> **Migrations connection:** DO Managed PG can hand out a pooled (transaction-mode)
> URL that chokes on DDL. If `migrate deploy` errors, point the job's
> `DATABASE_URL` at the **direct** connection (port 25060), as ElderCare's runbook
> does for Alembic.

## 5. Wire ElderCare → Academy (psw side)

On the ElderCare app (psw), set:
- `ACADEMY_BASE_URL=https://academy.eldercare-companion.com` (the "Training" button target)
- `ACADEMY_API_URL=https://api.academy.eldercare-companion.com` (the entitlement webhook target)
- `ACADEMY_EXCHANGE_SECRET=<the same shared secret>`

## 6. Verify (do not declare done on a green deploy alone)

Run the [GO_LIVE_VERIFICATION.md](GO_LIVE_VERIFICATION.md) checklist against the
live deployment — the SSO handoff, the exchange (investigate the 504), the
certificate flow-back, the entitlement webhook, Mux upload→playback, and a real
Resend email. A deploy that builds is not a deploy that works.

## 7. Rollback

DO retains every deploy: App → **Activity** → *Roll Back to this Deployment*.
If a bad deploy included a migration, roll the app back first, then
`prisma migrate resolve` / a down-migration (most Academy migrations are additive).
