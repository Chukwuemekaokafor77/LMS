# Secrets Rotation Runbook (LMS-M1, Phase E item 1)

The one open audit finding. Rotate all provider secrets once, in a coordinated
pass, before any operator PHI / production cutover. Clerk is gone (LMS-M6) — no
Clerk keys to rotate. Scope: **Mux, AWS/Spaces, Resend, and the two Academy
secrets.**

## Env handling — verified clean (2026-07-21)

The codebase side of LMS-M1 is already satisfied; the remaining work is you
rotating the actual live keys.

- `.env` is **gitignored and untracked** — only `.env.example` is committed.
- `.env.example` carries **placeholders only** (empty values), no key material.

Re-verify any time:
```bash
git ls-files | grep -E '(^|/)\.env'            # → only ".env.example"
grep -nE '=(sk_|re_|AKIA|[A-Za-z0-9]{24,})' .env.example apps/web/.env.example   # → no matches
git check-ignore .env                          # → ".env"
```

Rule: real values live only in the deployment platform's encrypted env store (DO
App Platform → Settings → env vars, `type: SECRET`) and your password manager.
Never in the repo, a shared zip, or a chat.

## What to rotate

| Secret | Where it's set | What it does | Effect of rotation |
|---|---|---|---|
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | Mux dashboard → API Access Tokens; `academy-api` env | API auth to Mux (create uploads, read assets) | Update env → redeploy. In-flight uploads unaffected. Revoke old token after. |
| `MUX_SIGNING_KEY_ID` (+ signing private key) | Mux → Signing Keys; `academy-api` env | Signs playback JWTs (signed playback URLs) | **Rotate-deploy-then-revoke.** Add a new signing key, deploy, verify playback, *then* delete the old key — deleting first breaks already-issued playback URLs. |
| `MUX_WEBHOOK_SECRET` | Mux → Webhooks; `academy-api` env | Verifies inbound Mux webhooks (`video.asset.ready`) | Update both sides. Briefly, webhooks signed with the old secret 400 until env updates; Mux retries, so no event is lost. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS IAM or DO Spaces keys; `academy-api` env | Cert-PDF + roster object storage (S3 / Spaces) | **Rotate-deploy-then-revoke** (same order as ElderCare's Spaces rotation): generate new key → update env → redeploy → verify a cert download → **then** revoke the old key. Revoking first leaves the app with no valid storage access. |
| `RESEND_API_KEY` | Resend dashboard; `academy-api` env | Outbound email (invites, due-soon) | Create new key → update env → redeploy → send a test email → revoke old key. |
| `ACADEMY_SESSION_SECRET` | `academy-api` env only | Signs the Academy's own 8h session cookies | Rotating **invalidates every active Academy session** (cookies fail verification → 401). Users are re-handed-off through ElderCare invisibly if still logged into ElderCare; otherwise they land on ElderCare login. Low-disruption, no coordination needed. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ACADEMY_EXCHANGE_SECRET` | `academy-api` env **and** ElderCare (psw) env | Shared HMAC for the SSO exchange, certificate flow-back, and the entitlement webhook | **Must be byte-identical on both sides.** There is no dual-secret support, so a mismatch breaks all three channels (401). **Coordinate:** set the new value on both apps close together (a brief maintenance window). See the sequence below. |

## Coordinated rotation of the shared secret (`ACADEMY_EXCHANGE_SECRET`)

1. Generate one value: `python -c "import secrets; print(secrets.token_hex(32))"`.
2. Announce a short maintenance window (a few minutes — new training sign-ins,
   cert flow-back, and entitlement pushes are affected while the two sides
   disagree).
3. Set it on the **ElderCare** app (`ACADEMY_EXCHANGE_SECRET`) and redeploy.
4. Set the same value on **`academy-api`** and redeploy.
5. Verify with [GO_LIVE_VERIFICATION.md](GO_LIVE_VERIFICATION.md): a signed
   `/academy/exchange` probe returns claims (not 401), and a completed training
   flows a certificate back.
6. Save the new value to the password manager on both entries.

## Suggested order for the full pass

Do the independent ones first (no coordination), the shared secret last:

1. `RESEND_API_KEY` → deploy → test email → revoke old.
2. `AWS`/Spaces keys → deploy → test cert download → revoke old.
3. `MUX_*` (signing key with the rotate-deploy-then-revoke order) → deploy →
   test upload→playback → revoke old.
4. `ACADEMY_SESSION_SECRET` → deploy (sessions re-handoff).
5. `ACADEMY_EXCHANGE_SECRET` → the coordinated two-sided window above.

After the pass, update the audit: flip **LMS-M1** to done in
[LMS_PRE_LAUNCH_AUDIT.md](../LMS_PRE_LAUNCH_AUDIT.md).
