import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    exclude: ["**/e2e/**", "**/node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["lib/ai/analyze.ts", "lib/rate-limit.ts"],
      thresholds: { lines: 20, functions: 0 },
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
