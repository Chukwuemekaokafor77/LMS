import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
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
