import { describe, it, expect } from "vitest";

function resolveLimiterTier(plan: "FREE" | "PRO"): { limit: number; windowDays: number } {
  return plan === "PRO" ? { limit: 200, windowDays: 30 } : { limit: 3, windowDays: 30 };
}

describe("plan quota resolution", () => {
  it("gives Free users 3 analyses per 30 days", () => {
    expect(resolveLimiterTier("FREE")).toEqual({ limit: 3, windowDays: 30 });
  });

  it("gives Pro users 200 analyses per 30 days", () => {
    expect(resolveLimiterTier("PRO")).toEqual({ limit: 200, windowDays: 30 });
  });
});
