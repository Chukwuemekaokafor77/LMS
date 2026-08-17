#!/usr/bin/env node
/**
 * Per-file coverage floor for the service layer.
 *
 * vitest.config.ts sets a 60% threshold, but that is an *average* over every
 * file it includes. A single service can sit near zero and still pass, carried
 * by well-covered neighbours. That is not hypothetical: required-training
 * .service.ts was at 12% statements and 0% branches — it decides which training
 * is mandatory for which role in which province, the regulatory core of the
 * LMS — while the suite reported 83% overall and the gate went green.
 *
 * vitest's glob thresholds do not fix this. They aggregate over the files
 * matching the glob rather than checking each one; a 0%-covered probe service
 * added under `src/**` did not trip a glob threshold set to 40. Hence this
 * script, which reads coverage-summary.json and checks each file on its own.
 *
 * FLOOR is deliberately far below the global 60. It answers "did anybody test
 * this at all", not "is this well tested". Raising it is good, but raise it
 * with tests, and only to a number every file already clears.
 *
 *   node scripts/coverage-floor.mjs          # after `vitest run --coverage`
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const API_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUMMARY = path.join(API_DIR, "coverage", "coverage-summary.json");

const FLOOR = 40; // percent, applied to statements / lines / functions

let summary;
try {
  summary = JSON.parse(readFileSync(SUMMARY, "utf8"));
} catch (err) {
  console.error(
    `Could not read ${path.relative(API_DIR, SUMMARY)} — run ` +
      `\`vitest run --coverage\` first (the json-summary reporter writes it).\n${err.message}`,
  );
  process.exit(2);
}

const offenders = [];
let checked = 0;

for (const [file, metrics] of Object.entries(summary)) {
  if (file === "total") continue;
  // Only the service layer; vitest's own `include` already narrows what lands
  // here, but be explicit so a future include change does not silently widen
  // or narrow this gate.
  if (!file.replace(/\\/g, "/").includes("/src/") || !file.endsWith(".service.ts")) {
    continue;
  }
  checked += 1;
  const low = ["statements", "lines", "functions"]
    .map((k) => [k, metrics[k]?.pct ?? 0])
    .filter(([, pct]) => pct < FLOOR);
  if (low.length) {
    offenders.push({ file: path.relative(API_DIR, file), low });
  }
}

if (checked === 0) {
  // An empty result means the filter stopped matching — treat it as a failure
  // rather than silently passing, which is the exact way this class of gate
  // dies.
  console.error(
    "coverage-floor: matched 0 service files. The summary format or the " +
      "include globs changed; this gate is not checking anything.",
  );
  process.exit(2);
}

if (offenders.length) {
  console.error(`\ncoverage-floor: ${offenders.length} service(s) below ${FLOOR}%:\n`);
  for (const { file, low } of offenders) {
    const detail = low.map(([k, pct]) => `${k} ${pct}%`).join(", ");
    console.error(`  ${file}\n      ${detail}`);
  }
  console.error(
    `\nThe suite average can hide this. Add tests for the service itself —\n` +
      `see src/required-training/required-training.service.spec.ts for the shape\n` +
      `(mocked Prisma/audit/queue, one case per guard).\n`,
  );
  process.exit(1);
}

console.log(`coverage-floor: ${checked} services checked, all at or above ${FLOOR}%.`);
