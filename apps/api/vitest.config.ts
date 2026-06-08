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
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
    // Coverage plumbing (LMS-H2). The 60% floor on the service layer is gated
    // with LMS-C2, once real service tests exist — see LMS_PRE_LAUNCH_AUDIT.md.
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.service.ts"],
    },
  },
});
