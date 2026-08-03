import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Monorepo: trace from the repo root so the standalone bundle is laid out as
  // .next/standalone/apps/web/server.js (what the Dockerfile CMD runs) and
  // includes the pnpm-workspace dependencies.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

// Sentry source-map upload is OPT-IN: only wrap the build when SENTRY_AUTH_TOKEN
// (+ org/project) is set. Without it — CI, local dev, and any deploy that hasn't
// configured Sentry — the build is completely unchanged. The @sentry/nextjs
// runtime SDK (instrumentation.ts + the client init) reads the release the
// plugin injects, so uploaded maps line up with events; the maps are deleted
// from the bundle after upload so they're never served publicly.
const config = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      widenClientFileUpload: true,
      telemetry: false,
      sourcemaps: { deleteSourcemapsAfterUpload: true },
    })
  : nextConfig;

export default config;
