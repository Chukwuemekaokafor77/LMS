import { test, expect } from "@playwright/test";

/**
 * The learner critical path: dashboard → open the assigned module → read the
 * lesson and mark it complete → the quiz unlocks → answer correctly → pass and
 * see the review. Ends at the (synchronous) pass result; certificate issuance
 * is async (needs object storage) and is covered by the API authz e2e instead.
 *
 * Depends on the `seed:e2e` fixture (module "E2E Safety Basics", one readable
 * lesson, a one-question quiz whose correct choice is literally labelled).
 */
test("learner reads a lesson, passes the quiz, and sees the review", async ({
  page,
}) => {
  // Dashboard → the assigned module is listed.
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /my training/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: /E2E Safety Basics/i }).click();

  // Module page → "Start training" deep-links to the first incomplete lesson.
  await expect(
    page.getByRole("heading", { name: /E2E Safety Basics/i }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /start training|continue training/i })
    .click();

  // Lesson → read + mark complete.
  await expect(
    page.getByRole("heading", { name: /read this lesson/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /mark lesson complete/i }).click();
  await expect(page.getByText(/lesson completed/i)).toBeVisible();

  // Only lesson done → quiz unlocks. Return to the module and start it.
  await page.getByRole("link", { name: /back to module/i }).click();
  await page.getByRole("link", { name: /start quiz/i }).click();

  // Quiz: begin, choose the correct answer, attest, submit.
  await page.getByRole("button", { name: /start quiz/i }).click();
  await page.getByText("This is the correct answer").click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^submit$/i }).click();

  // Result: passed, 100%, and the review is revealed.
  await expect(page.getByText(/100\s*%/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /review/i })).toBeVisible();
});
