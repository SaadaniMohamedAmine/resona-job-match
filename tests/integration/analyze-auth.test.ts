import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));

const { POST } = await import("@/app/api/analyze/route");

describe("POST /api/analyze — unauthenticated", () => {
  it("returns 401 when no session exists", async () => {
    const req = new Request("http://localhost/api/analyze", { method: "POST", body: "{}" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
