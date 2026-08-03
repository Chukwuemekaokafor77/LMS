import { test, expect, type Page } from "@playwright/test";

/**
 * Field staff use the Academy mainly on phones, so the core screens must not
 * overflow horizontally at a small-phone width (iPhone SE, 375px). Navigates by
 * URL (not the dashboard cards) so it's independent of the learner's completion
 * state left by the journey spec. Runs authenticated via the setup storageState.
 */
test.use({ viewport: { width: 375, height: 667 } });

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `"${label}" overflows horizontally at 375px (scrollWidth ${scrollWidth} > clientWidth ${clientWidth})`,
  ).toBeLessThanOrEqual(clientWidth + 1); // 1px for sub-pixel rounding
}

test("core learner screens fit a phone width without horizontal scroll", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /my training/i }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page, "dashboard");

  await page.goto("/training/e2e-safety-basics");
  await expect(
    page.getByRole("heading", { name: /E2E Safety Basics/i }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page, "module page");

  // The lesson reader's two-pane layout must collapse to one column on a phone.
  await page.getByRole("link", { name: /read this lesson/i }).click();
  await expect(
    page.getByRole("heading", { name: /read this lesson/i }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page, "lesson page");
});
