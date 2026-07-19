# ElderCare as OIDC Provider — Implementation Plan (Seam 1)

**Written:** 2026-07-19, from a read-only recon of the `psw` repo. This is the
gating prerequisite for LMS-M6 steps 4–5 (Clerk removal) and Phase D
(entitlement flow-in + certificate flow-back). No psw code has been touched.

## TL;DR — how big is it?

**Roughly 2.5–3.5 weeks of focused single-engineer work end-to-end**, of which
the ElderCare provider itself is **~6–9 days**; the rest is the LMS-side swap
(4–6 days) and cutover/rotation (~1 day). Two security-review passes are
non-negotiable (one per repo) and add calendar latency on top.

Two recon findings shrink the risk from what the completion plan feared:

1. **ElderCare already ships a browser UI.** The Expo app exports a web build
   deployed to Vercel (`vercel.json`, `WebSidebarLayout`, HSTS headers) with a
   working login + MFA flow. The OIDC redirect flow needs a browser-reachable
   login at the provider — that was the potential hidden monster, and it
   already exists.
2. **The scope is a single first-party client.** We are not building a
   general-purpose IdP. One registered client (the LMS), authorization-code +
   PKCE only, no dynamic registration, no consent screen (first-party), no
   third-party apps. That cuts the protocol surface to something small enough
   to review line-by-line.

The genuinely new things ElderCare must grow: an **asymmetric signing path**
(today's tokens are HS256 with shared secrets — externally unverifiable by
design), a **JWKS + discovery endpoint**, an **authorization-code state
machine**, and **identity/org/role/entitlement claims**.

---

## 1. Current state (recon facts, `psw` repo)

| Area | Fact | Consequence |
|---|---|---|
| Tokens | `backend/auth.py`: python-jose, **HS256**, `SECRET_KEY` + `REFRESH_SECRET_KEY`, hard prod-key validation | Internal tokens stay as-is. OIDC needs a **new RS256 keypair** — never expose the HS256 secrets. |
| MFA / lockout | `mfa.py`, `account_lockout.py`, org-level `mfa_policy` | The authorize flow simply *requires an authenticated (and MFA-satisfied) ElderCare session token* — MFA is inherited, not rebuilt. |
| Sessions | Pure bearer tokens held by the SPA — **no server-side cookie session** | The authorize step is a **frontend route** in the web build that calls the backend with its bearer token (standard SPA-provider pattern), not a cookie-based server flow. |
| Web UI | Expo web export on Vercel, login screens exist | No new login UI. One new "authorize" screen. |
| SSO | `models/enterprise.py: SSOConfiguration` — *consumer* side | Naming collision only; unrelated. |
| Infra | ca-central-1 posture, Redis available (`redis_pool.py`), rate limiting (`limiter.py`), audit models | Code store → Redis; reuse limiter + audit conventions. |

## 2. Scope decision (recommended)

**Build a minimal, single-client OIDC provider by hand on python-jose — not a
framework.** Rationale: authlib's provider framework assumes server-rendered
forms/sessions and fights the SPA pattern; the code-flow-with-PKCE state
machine for one pre-registered client is a few hundred lines, and *every* line
is security-reviewable. We hand-roll protocol plumbing, **not crypto** (jose
does all JWS).

**In scope (v1):** discovery doc, JWKS, authorize (code + PKCE S256 required),
token endpoint (code exchange only), userinfo, ID token + access token (RS256),
claims below, audit events, rate limits, tests.
**Out of scope (v1):** refresh tokens (see TTL decision), dynamic client
registration, consent UI, other response types/grants, logout federation
(`end_session`), pairwise subjects.

### Decisions to lock before starting

1. **Access-token TTL: 8h, no refresh tokens in v1.** Caregiver shifts fit in
   8h; the LMS web session simply re-runs the (silent, already-authenticated)
   redirect when it expires. Refresh-token rotation is a well-understood v1.1
   if 8h annoys anyone. This deletes the single most bug-prone part of a
   provider.
2. **Key handling:** one RS256 keypair, PEM via env/secret store in
   ca-central-1, `kid` in the JWKS; rotation = publish new key alongside old in
   JWKS, switch signing, retire old after max-TTL. Documented as a runbook
   step, not automated in v1.
3. **Client auth:** the LMS is a *confidential* client (Next.js server can hold
   a secret) — `client_secret_basic` at the token endpoint **plus** PKCE.
   Belt and suspenders, both cheap.
4. **Entitlement in claims v1** (`entitlement: { status, seats }` from the
   agency's ElderCare subscription state). The Phase D webhook can supersede
   this later for lapse-in-real-time; claims-at-login is enough for a pilot.

## 3. Flow (what gets built)

```
LMS web (Next.js)                ElderCare web (Expo)         ElderCare API (FastAPI)
    │  GET /sign-in                       │                            │
    │──302──> /oidc/authorize?client_id&redirect_uri&state&nonce&code_challenge
    │                                     │  (route in web app)        │
    │                                     │  not logged in? → existing login+MFA, return
    │                                     │──POST /oauth/authorize────>│ bearer = ElderCare token
    │                                     │   {params}                 │ validate client, redirect_uri,
    │                                     │                            │ PKCE challenge; mint code
    │                                     │<──{ redirect: uri?code&state }
    │<——————— browser navigates to LMS ———┘                            │
    │  /api/auth/callback?code&state                                   │
    │────POST /oauth/token  (code + verifier + client secret)─────────>│
    │<——— { id_token, access_token }   (RS256, kid, claims)            │
    │  verify via JWKS → create LMS session → JIT-provision Staff      │
```

### Claims (ID token + userinfo)

| Claim | Source | LMS use |
|---|---|---|
| `sub` | ElderCare user id | `User.externalAuthId` |
| `email`, `name`, `locale` | user record | User upsert |
| `org` | `{ id, name, province }` of the agency | JIT `Organization` (jurisdiction from province) |
| `facility` | `{ id, name }` or null | JIT `Site` (branch/service-area) |
| `role` | ElderCare role string (`psw`, `nurse`, …) | Seam 2a mapping → LMS `Role.code` |
| `entitlement` | `{ status, seats }` | access gate + seat reporting |
| `amr`, `auth_time` | login/MFA facts | audit posture |

## 4. Work breakdown

### Part 1 — ElderCare provider (`psw` repo) · ~6–9 days

| # | Work | Size | Notes / files |
|---|---|---|---|
| O0 | **Design + threat model** written against this plan (redirect hijack, code replay/theft, PKCE downgrade, mix-up, token substitution, JWKS poisoning, secret handling) | 1d | doc in psw; review input |
| O1 | **Keys + JWKS + discovery**: RS256 keypair loading, `/.well-known/openid-configuration`, `/.well-known/jwks.json` | 0.5–1d | static, lowest-risk, ship first |
| O2 | **Client registry**: table or config for the one LMS client (id, hashed secret, exact redirect URIs) | 0.5d | alembic migration |
| O3 | **Authorize**: backend `POST /oauth/authorize` (bearer-authenticated; validates client/redirect/PKCE/nonce; mints single-use code in Redis, 60s TTL, bound to user+client+challenge+nonce) + the **web "authorize" route** in the Expo app (reuses login; auto-approves first-party with a brief "continuing to Maple Care training" interstitial) | 1.5–2d | the SPA-pattern piece; rate-limited |
| O4 | **Token + userinfo**: code exchange (client secret + PKCE verifier; single-use enforcement; nonce echo), ID/access token minting with claims incl. org/role/entitlement; `GET /oauth/userinfo` | 1–1.5d | claims sourcing touches org/subscription models |
| O5 | **Tests + abuse cases**: happy path; wrong verifier; replayed code; wrong redirect; expired code; tampered `kid`; HS256-signed token rejected («alg confusion»); entitlement lapsed; MFA-pending token rejected | 1–1.5d | pytest, matching psw conventions |
| O6 | **Security review + fixes** (the audited-auth-core rule) | 1–2d + latency | second pair of eyes on O3/O4 especially |

### Part 2 — LMS swap (this repo) · ~4–6 days — *is LMS-M6 steps 4–5, pre-staged*

| # | Work | Size | Notes |
|---|---|---|---|
| L1 | `EldercareIdentityProvider implements IdentityProvider` (JWKS verify via `jose`/`jwks-rsa`, iss/aud/alg pinned) — **one binding swap** in `auth.module.ts` thanks to the seam | 0.5–1d | keep `ClerkIdentityProvider` behind an env flag until cutover completes |
| L2 | **JIT provisioning** from claims: upsert Organization (province→jurisdiction), Site, Staff; **Seam 2a role-mapping table** (ElderCare role × province → LMS `Role.code`) + seed for NB/NS/PE/NL home-care roles | 1–1.5d | the real work; unmapped role = explicit onboarding error, not a default |
| L3 | **Web session layer**: replace ClerkProvider/middleware with **Auth.js** (custom OIDC provider entry → handles code flow, session cookie, token exposure to `apiFetch`); replace the 7 `useAuth()` call sites; sign-in page → redirect | 1.5–2d | Auth.js chosen over hand-rolled cookies; invitation accept flow keeps working (token binds by email) |
| L4 | **Entitlement gate**: guard checks `entitlement.status` at login; lapsed → friendly block page | 0.5d | claims-based v1 |
| L5 | **Tests**: harness stubs the new provider (bearer = sub, same trick); C1/C2 must stay green untouched in substance; new spec for JIT provisioning + role mapping + entitlement gate | 1d | the audit's step-6 requirement |
| L6 | **Delete Clerk**: webhook controller, ClerkService, deps, env; docs | 0.5d | after cutover verified |

### Part 3 — Cutover · ~1 day + review latency

1. Deploy provider; register the LMS client with prod redirect URIs.
2. LMS staging flips `IDENTITY_PROVIDER` binding to ElderCare; drive the full
   loop (login → JIT → lesson → quiz → cert) on staging.
3. Flip prod; monitor; **then** delete Clerk code/keys.
4. **LMS-M1 finally executes**: the coordinated secrets rotation (now
   Mux/AWS/Resend + the new OIDC client secret — Clerk keys die instead of
   rotating).
5. Residency claim becomes true end-to-end: identity data never leaves
   ca-central-1. Update audit + completion plan.

**Rollback:** the seam keeps `ClerkIdentityProvider` compilable until step 3’s
verification passes; rollback = flip the binding back (Clerk dev instance still
live until M1).

## 5. What could still blow up the estimate

- **Expo-web routing friction** for the authorize screen (deep-link config,
  `linking.ts`) — budgeted inside O3, but Expo web has sharp edges.
- **Role taxonomy disagreements** (Seam 2a) — if ElderCare's role strings are
  messier than expected, L2 grows. Data problem, not architecture.
- **Review findings** in O6 — by design this can add a loop.
- **Entitlement source ambiguity** — if ElderCare's subscription state isn't
  cleanly queryable per-agency, O4 grows; worth a 30-minute check before O0.

## 6. Sequencing note

Parts 1 and 2 parallelize well after O1 (the LMS side can develop against a
static JWKS fixture + hand-minted tokens long before the authorize flow
exists). If done serially: O0→O6, then L1→L6, then cutover.
