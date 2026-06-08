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
  },
});
