import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";
import path from "path";

export default defineConfig({
  // SWC emits the decorator metadata (design:paramtypes) that NestJS DI needs —
  // vitest's default esbuild transform does not, so the e2e harness that boots
  // the Nest app (test/*.e2e-spec.ts) would otherwise fail to resolve providers.
  plugins: [
    swc.vite({
      module: { type: "es6" },
      jsc: {
        target: "es2021",
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.spec.ts", "test/**/*.e2e-spec.ts"],
    // The integration/e2e suites share one Postgres and wipe+seed it, so they
    // must not run concurrently or they clobber each other's fixtures. Run files
    // serially (tests within a file already run sequentially).
    fileParallelism: false,
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
    // Service-layer coverage floor (LMS-C2). Thin SDK adapters are stubbed in
    // the e2e harness (no real network in CI), so they carry no coverable
    // business logic and are excluded — the floor targets the services that
    // actually hold logic worth testing.
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.service.ts"],
      exclude: [
        "src/auth/clerk.service.ts",
        "src/storage/s3.service.ts",
        "src/video/mux.service.ts",
      ],
      thresholds: { lines: 60, functions: 60, statements: 60 },
    },
  },
});
