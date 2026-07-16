import { getGroq } from "./client";
import { z } from "zod";

export const analysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(
    z.object({
      section: z.enum(["summary", "experience", "skills"]),
      issue: z.string(),
      recommendation: z.string(),
    })
  ),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

const SYSTEM_PROMPT = `You are an expert technical recruiter and ATS specialist. Compare the given resume against the given job description. Return strict JSON matching this shape:
{
  "matchScore": number (0-100, how well the resume matches the job description),
  "matchingSkills": string[] (skills/keywords present in both),
  "missingSkills": string[] (important skills/keywords from the job description absent from the resume),
  "suggestions": [{ "section": "summary"|"experience"|"skills", "issue": string, "recommendation": string }]
}
Be precise and factual. Do not invent skills that are not in the job description.`;

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  const completion = await getGroq().chat.completions.create({
    model: "mixtral-8x7b-32768",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = analysisResultSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    throw new Error("AI response did not match expected schema: " + parsed.error.message);
  }

  return parsed.data;
}
