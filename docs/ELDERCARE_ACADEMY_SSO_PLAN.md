# ElderCare Academy — same-domain hosting & seamless SSO plan (Seam 1, v2)

**Written:** 2026-07-19. **Supersedes** the same-day OIDC-provider plan (in git
history) after owner review: for a single first-party app on the same domain,
the OIDC protocol surface (authorize/token endpoints, PKCE, client registry,
discovery/JWKS, Auth.js) is unnecessary machinery. If a third-party app ever
needs "login with ElderCare", that plan comes back off the shelf — everything
below (claims, role mapping, JIT provisioning) carries over unchanged.

**Owner decisions locked (2026-07-19):**
1. **The LMS is renamed ElderCare Academy** — it is a section of ElderCare, not
   a partner product.
2. **Hosting: subdomain** — `academy.<eldercare-domain>` (two deployments, one
   domain family; a `/academy` path rewrite can be layered later without
   changing anything below).
3. **Login: one-time-token handoff SSO** — seamless from inside ElderCare;
   the Academy has no login screen of its own.

## TL;DR sizing

**~1.5–2 weeks single-engineer end-to-end** (vs 2.5–3.5 for the OIDC design):
ElderCare side ~2–3 days (two small endpoints + a Training button), Academy
side ~3–4 days (SSO entry + native sessions + JIT/role mapping + Clerk
removal), rename ~1 day, cutover ~1 day — plus two security reviews, now over
a much smaller footprint. ElderCare's existing token format, login, and MFA are
untouched.

---

## 1. The user experience (what "seamless" means concretely)

- A caregiver or director is in ElderCare (web or mobile app), already logged
  in — MFA, lockout, all existing policy unchanged.
- They tap **"Training"** (new button/tab). The browser opens
  `academy.<domain>/sso?t=<one-time-token>` and lands — already signed in — on
  their training dashboard. No login page, no consent screen, no visible
  redirect chain.
- Visiting `academy.<domain>` without a session redirects to the ElderCare app.
  That is the entitlement decision expressed at the front door: Academy access
  *is* ElderCare access.
- When the Academy session (8h) expires, the web app bounces through
  ElderCare's handoff endpoint; if the user is still logged into ElderCare it
  auto-reissues and returns invisibly, otherwise they land on ElderCare login.

## 2. Flow

```
ElderCare app (web / RN)     ElderCare API (FastAPI)         Academy web+API (this repo)
   │ "Training" click             │                                │
   │──POST /academy/handoff──────>│  authenticated (bearer, MFA-   │
   │<─{ url: academy…/sso?t=OTT }─│  satisfied); mint OTT:         │
   │                              │  random 256-bit, single-use,   │
   │  open browser at url         │  60s TTL, Redis, bound to user │
   │─────────────────────────────────────────────────────────────> │ GET /sso?t=OTT
   │                              │<──POST /academy/exchange───────│ server-to-server,
   │                              │   {ott}, HMAC service auth     │ HMAC(shared secret)
   │                              │──{ sub, email, name, locale,──>│ claims
   │                              │    org{id,name,province},      │ • JIT-provision Org/Site/
   │                              │    facility, role,             │   Staff (role mapping)
   │                              │    entitlement{status,seats},  │ • mint Academy session JWT
   │                              │    amr, auth_time }            │ • set httpOnly cookie
   │                                                               │ → redirect /dashboard
```

**Trust model:** identical to the Phase-D certificate webhook — a shared
service secret between the two backends (HMAC-signed request + response,
ca-central-1 to ca-central-1). No public-key infrastructure, no JWKS, and
ElderCare's HS256 secrets never leave it.

## 3. Claims returned by the exchange (unchanged from v1 plan)

| Claim | Source | Academy use |
|---|---|---|
| `sub` | ElderCare user id | `User.externalAuthId` |
| `email`, `name`, `locale` | user record | User upsert |
| `org {id,name,province}` | agency | JIT `Organization` (province → jurisdiction) |
| `facility {id,name}?` | facility/branch | JIT `Site` (branch/service-area) |
| `role` | ElderCare role string | **Seam 2a mapping table** → LMS `Role.code`; unmapped role = explicit error, never a default |
| `entitlement {status,seats}` | agency subscription state | access gate at handoff + session renewal (Phase D webhook adds real-time lapse later) |
| `amr`, `auth_time` | login/MFA facts | audit posture |

## 4. Academy sessions (what replaces Clerk)

- On successful exchange the Academy mints its **own session JWT** (HS256 with
  an Academy-only secret; `sub` = externalAuthId; 8h TTL) and sets it as an
  **httpOnly, Secure, SameSite=Lax cookie** on `academy.<domain>`.
- Server components forward it as the bearer in `apiFetch`. Client components
  (quiz-runner, lesson-player, authoring forms) replace `useAuth().getToken()`
  with a small `useSession()` hook backed by a Next route handler that reads
  the cookie server-side and returns the bearer — the API keeps its existing
  Authorization-header guard untouched.
- The API guard's `IdentityProvider` binding (the seam built in LMS-M6 step 1)
  swaps to an `AcademySessionProvider` that verifies Academy-issued JWTs.
  Clerk's provider stays compilable behind an env flag until cutover verifies,
  then is deleted (webhook controller, ClerkService, deps, env).
- No refresh tokens: expiry re-runs the handoff (invisible while the ElderCare
  login is alive).

## 5. Threat model (review checklist)

- **OTT interception/replay:** 256-bit random, single-use (deleted on first
  exchange), 60s TTL, HTTPS-only, bound to the issuing user; exchange is
  server-to-server so the token never meets JS.
- **Exchange endpoint abuse:** HMAC service auth + rate limiting
  (`limiter.py` conventions); optional IP allowlist at deploy time.
- **Session cookie:** httpOnly/Secure/SameSite=Lax; the API itself is
  bearer-authenticated (no cookie-authenticated mutations) so CSRF exposure is
  confined to the token-echo route handler, which is same-site protected and
  returns nothing but the caller's own token.
- **Open redirect:** `/sso` accepts no return-URL parameter; it always lands on
  the dashboard.
- **Entitlement lapse:** checked at every handoff/renewal; Phase D webhook
  later closes the mid-session window.
- **Logout:** ElderCare logout does not remotely kill Academy sessions in v1
  (8h cap bounds the exposure); document as accepted risk or add a
  session-revocation ping in v1.1.
- **Audit:** both sides record handoff mint/exchange (ElderCare audit models,
  Academy `AuditEvent` `sso.handoff`).

## 6. Work breakdown

### ElderCare (`psw`) · ~2–3 days
| # | Work | Notes |
|---|---|---|
| E1 | `POST /academy/handoff` (authenticated; MFA-satisfied check; mint OTT in Redis; return URL) + `POST /academy/exchange` (HMAC service auth; single-use consume; return claims incl. org/role/entitlement) | the entire new auth surface; the entitlement sourcing pre-check from the v1 plan still applies (30 min: confirm agency subscription state is cleanly queryable) |
| E2 | **Training button/tab** in web + RN app (opens the handoff URL in browser) | UI strings EN/FR |
| E3 | Tests (mint requires auth+MFA; OTT single-use/TTL; bad HMAC 401; claims shape) + **security review** | small, line-by-line reviewable |

### Academy (this repo) · ~3–4 days
| # | Work | Notes |
|---|---|---|
| A1 | `/sso` route + exchange client + Academy session mint/cookie | server-side only |
| A2 | JIT provisioning from claims + **Seam 2a role-mapping table** + NB/NS/PE/NL home-care `Role` seed rows | invariant from v1 plan; the real data work |
| A3 | `AcademySessionProvider` behind the `IDENTITY_PROVIDER` binding; `useSession()` hook + token route; replace Clerk components/middleware; unauthenticated → redirect to ElderCare | seam pays off; invitations flow becomes redundant for ElderCare-provisioned staff (keep for now, revisit) |
| A4 | Entitlement gate (lapsed → friendly block page) | claims-based v1 |
| A5 | Tests: harness stubs the provider as today (bearer = sub); C1/C2 green; new spec for /sso exchange, JIT + role mapping, entitlement gate | audit step-6 requirement |
| A6 | **Rename → ElderCare Academy:** web strings/branding, email templates, certificate PDF issuer ("Issued by ElderCare Academy"), README/docs, Seam-3 `issuing_authority` value | ~1 day, own branch |

### Cutover · ~1 day
1. Deploy Academy at `academy.<domain>`; exchange secrets provisioned both sides.
2. Staging: full loop (ElderCare login → Training → JIT → lesson → quiz →
   certificate) driven end-to-end.
3. Flip prod binding; verify; delete Clerk; run **LMS-M1** (coordinated
   rotation — Mux/AWS/Resend + the new service secret; Clerk keys die).
4. Residency claim true end-to-end; update audit + completion plan.

**Rollback:** flip the `IDENTITY_PROVIDER` binding back to Clerk (kept alive
until step 3 verifies).

## 7. Risks that could grow the estimate

- ElderCare role strings messier than expected → A2 grows (data, not
  architecture).
- RN app → browser handoff friction (in-app browser vs system browser cookie
  jars) — E2 budget; system browser is the safe default.
- Entitlement sourcing in ElderCare unclear → E1 grows; do the 30-minute check
  first.
- Review findings — by design this can loop once.
