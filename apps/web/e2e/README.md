# Browser end-to-end tests (Playwright)

Drives the **real** Academy learner flow in a browser: dashboard → open the
assigned module → read the lesson → mark complete → pass the quiz → see the
review. Complements the API e2e suite (business logic) by covering the web UI
wiring and the actual user journey.

These run against a **live stack** (web + API + Postgres + Redis), so they are
not part of the API `vitest` suite. Run them locally or in a dedicated CI job.

## One-time

```bash
pnpm --filter @maple-care/web run e2e:install   # installs the Chromium browser
```

## Run

Use one shared secret so the minted session cookie is accepted by the API:

```bash
export ACADEMY_SESSION_SECRET=test-academy-session-secret

# 1. Dependencies
docker compose up -d postgres redis

# 2. Schema + fixture (learner + module "E2E Safety Basics")
pnpm --filter @maple-care/api exec prisma migrate deploy
pnpm --filter @maple-care/api run seed:e2e

# 3. API on :4000 (dummy provider env so it boots; S3/Mux aren't exercised here)
#    Reuse the local dev env you already use to run the API, plus the secret above.
pnpm --filter @maple-care/api run start   # or `dev` — must share ACADEMY_SESSION_SECRET

# 4. Web on :3000, pointed at the API
NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter @maple-care/web run start

# 5. The tests (in another shell, with ACADEMY_SESSION_SECRET set)
pnpm --filter @maple-care/web run e2e
```

## How auth works

There's no login screen — the Academy trusts an `academy_session` cookie (an
HS256 JWT, `sub` = the user's external id, signed with `ACADEMY_SESSION_SECRET`;
see `api/src/auth/academy/academy-session.service.ts`). `e2e/auth.setup.ts`
mints that cookie for the seeded learner and saves it as Playwright storage
state, so no live ElderCare handoff is needed. The web middleware only checks
the cookie's presence; the API verifies its signature — hence the shared secret.

## Env knobs

| Var | Default | Meaning |
|-----|---------|---------|
| `ACADEMY_SESSION_SECRET` | `test-academy-session-secret` | Must match the running API |
| `E2E_BASE_URL` | `http://localhost:3000` | Where the web app is served |
| `E2E_LEARNER_EXTERNAL_ID` | `e2e_learner` | Must match `seed:e2e` |

## CI

Not yet wired into `.github/workflows/lms-ci.yml`. To add: a job that stands up
Postgres/Redis, `migrate deploy` + `seed:e2e`, starts the API and web in the
background, then `e2e:install` + `e2e`. Recommended as a **separate,
non-blocking** job until it's proven green, so it can't gate merges while
stabilising.
