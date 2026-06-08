// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Baseline ESLint config for the API (LMS-H2, LMS_PRE_LAUNCH_AUDIT.md).
 *
 * This tree had never been linted, so the gate is deliberately "CI-green":
 * real correctness rules (undefined vars, etc.) error and fail CI, while the
 * noisy stylistic rules that a never-linted NestJS codebase trips on are
 * downgraded to warnings. Tightening these to errors is a later cleanup pass —
 * the point of this PR is to make the gate exist and run, not to rewrite code.
 *
 * Uses the non-type-checked recommended set (no `parserOptions.project`) to keep
 * lint fast and decoupled from a successful typecheck.
 */
export default tseslint.config(
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
);
