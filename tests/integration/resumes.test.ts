import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "test-user-id" } }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    analysis: {
      findMany: vi.fn().mockResolvedValue([
        { id: "a1", matchScore: 87, userId: "test-user-id", resume: {}, jobPost: {} },
      ]),
    },
  },
}));

const { GET } = await import("@/app/api/resumes/route");

describe("GET /api/resumes", () => {
  it("returns the current user's analyses", async () => {
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.analyses).toHaveLength(1);
    expect(data.analyses[0].matchScore).toBe(87);
  });
});
