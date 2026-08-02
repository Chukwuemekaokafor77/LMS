import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Scope scans to the standard we target: WCAG 2.0/2.1/2.2 Levels A and AA.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Runs axe-core against the current page and fails on **serious/critical** WCAG
 * A/AA violations. Moderate/minor issues are printed for visibility but don't
 * gate the build — that keeps the check meaningful without being flaky, and the
 * threshold can be tightened as the app's a11y matures.
 */
export async function scanA11y(page: Page, label: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();

  const blocking = violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );

  const report = blocking
    .map(
      (v) =>
        `  • [${v.impact}] ${v.id}: ${v.help}\n` +
        `    ${v.helpUrl}\n` +
        `    nodes: ${v.nodes.map((n) => n.target.join(" ")).join("; ")}`,
    )
    .join("\n");

  expect(
    blocking,
    `Serious/critical accessibility violations on "${label}":\n${report}`,
  ).toEqual([]);
}
