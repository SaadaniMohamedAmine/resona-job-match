import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/ai/**", "lib/rate-limit.ts"],
      thresholds: { lines: 70, functions: 70 },
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
