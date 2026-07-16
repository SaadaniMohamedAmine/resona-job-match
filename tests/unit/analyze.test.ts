import { describe, it, expect } from "vitest";
import { analysisResultSchema } from "@/lib/ai/analyze";

describe("analysisResultSchema", () => {
  it("accepts a well-formed AI response", () => {
    const valid = {
      matchScore: 87,
      matchingSkills: ["React", "TypeScript"],
      missingSkills: ["GraphQL"],
      suggestions: [
        { section: "summary", issue: "Too generic", recommendation: "Mention years of experience" },
      ],
    };
    expect(analysisResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a match score outside 0-100", () => {
    const invalid = { matchScore: 150, matchingSkills: [], missingSkills: [], suggestions: [] };
    expect(analysisResultSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects an unknown section in suggestions", () => {
    const invalid = {
      matchScore: 50,
      matchingSkills: [],
      missingSkills: [],
      suggestions: [{ section: "hobbies", issue: "x", recommendation: "y" }],
    };
    expect(analysisResultSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects when matchScore is missing", () => {
    const invalid = { matchingSkills: [], missingSkills: [], suggestions: [] };
    expect(analysisResultSchema.safeParse(invalid).success).toBe(false);
  });
});
