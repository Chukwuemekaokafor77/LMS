# Phase E — Go-Live Hardening (index)

The final phase before the Academy serves real operator PHI. Each item below is
split into what's **codeable now** (done here) and what **only the owner can
supply** (real keys, cloud/DNS, live runs). Nothing here touches the audited
product code (LMS-C1/C2, PHI logging) — it's deploy/ops artifacts.

| # | Item | Codeable part (done) | Owner-supplied |
|---|---|---|---|
| 1 | **LMS-M1 secrets rotation** | [SECRETS_ROTATION_RUNBOOK.md](SECRETS_ROTATION_RUNBOOK.md) — the runbook + env-hygiene **verified clean** (only `.env.example` tracked, placeholders only, `.env` gitignored) | Rotate the real Mux/AWS/Resend + the two Academy keys per the runbook |
| 2 | **Deploy `academy.<domain>`** | Residency decision **resolved → DO App Platform TOR1**; App Specs [.do/academy-api.app.yaml](../.do/academy-api.app.yaml) + [.do/academy-web.app.yaml](../.do/academy-web.app.yaml); [DEPLOY_ACADEMY.md](DEPLOY_ACADEMY.md) | Cloud account, managed PG/Redis/Spaces, DNS, secret values |
| 3 | **DB backups + restore drill** | [scripts/db-backup.sh](../scripts/db-backup.sh) + [scripts/db-restore-drill.sh](../scripts/db-restore-drill.sh) + [DB_BACKUP_RUNBOOK.md](DB_BACKUP_RUNBOOK.md) — **flow verified** against the dev DB | Schedule the backup job; run the quarterly drill on prod backups |
| 4 | **Real-provider verification** | [GO_LIVE_VERIFICATION.md](GO_LIVE_VERIFICATION.md) checklist + [scripts/verify-eldercare-exchange.sh](../scripts/verify-eldercare-exchange.sh) | Run against live once creds + ElderCare-side config are set |

## Two decisions/findings that came out of this pass

1. **Hosting/residency (item 2) — RESOLVED.** ElderCare runs on **DigitalOcean
   App Platform, TOR1 (Toronto)**, not Render (they migrated off Render) and not
   AWS. Host the Academy on **DO App Platform TOR1** too: Canadian residency, ops
   consistency, and the SSR web app (which renders PHI server-side) stays in
   Canada. See [DEPLOY_ACADEMY.md §1](DEPLOY_ACADEMY.md).

2. **The "exchange 504" (item 4) — DIAGNOSED, not a bug.** A signed probe against
   live ElderCare returns an edge 504 that masks an **origin 503** (`x-do-orig-
   status: 503`): the exchange handler returns 503 *"Academy is not configured"*
   because **`ACADEMY_EXCHANGE_SECRET` is unset on ElderCare prod** (expected —
   the Academy isn't deployed yet). Setting it (item 2 wiring) resolves it; the
   probe re-confirms. No code change needed.

## Suggested order

Item **1** (rotate secrets) and item **2** (deploy + wire, which sets
`ACADEMY_EXCHANGE_SECRET` on both sides — fixing the "504") go together. Then
item **4** verification against the live deployment. Item **3** (backups) can be
scheduled any time; run the first restore drill once the prod DB exists.

When items 1–4 are done and the go-live checklist passes, flip Phase E to done
and LMS-M1 to closed in [LMS_COMPLETION_PLAN.md](../LMS_COMPLETION_PLAN.md) /
[LMS_PRE_LAUNCH_AUDIT.md](../LMS_PRE_LAUNCH_AUDIT.md).
