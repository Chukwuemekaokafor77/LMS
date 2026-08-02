import { defineConfig, devices } from "@playwright/test";

/**
 * Browser end-to-end tests for the ElderCare Academy learner flow.
 *
 * Prerequisites (the harness drives the real app, so the stack must be up):
 *   - Postgres + Redis (docker compose up -d postgres redis)
 *   - API on :4000 and web on :3000, sharing ACADEMY_SESSION_SECRET
 *   - `pnpm --filter @maple-care/api run seed:e2e` (the learner + module)
 * See e2e/README.md for the full run recipe.
 *
 * Auth: the `setup` project mints the Academy session cookie for the seeded
 * learner (no live ElderCare needed) and saves it as storage state; the browser
 * project reuses it. See e2e/auth.setup.ts.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  // Generous timeouts: Next dev lazily compiles each route on first visit, so an
  // initial navigation can take several seconds. A production build (CI) is
  // precompiled and fast; these ceilings just avoid dev first-hit flakiness.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/learner.json",
      },
      dependencies: ["setup"],
    },
  ],
});
