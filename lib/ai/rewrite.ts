import { getGroq } from "./client";
import { z } from "zod";

const rewriteSchema = z.object({ rewritten: z.string() });

export async function rewriteSection(
  originalText: string,
  section: "summary" | "experience" | "skills",
  jobDescription: string
): Promise<string> {
  const completion = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert resume writer. Rewrite the given "${section}" section of a resume so it better matches the target job description, while staying factually accurate to the original content — never invent experience, titles, or skills that are not implied by the original text. Return strict JSON: { "rewritten": string }.`,
      },
      {
        role: "user",
        content: `ORIGINAL ${section.toUpperCase()}:\n${originalText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = rewriteSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("AI rewrite response malformed");
  return parsed.data.rewritten;
}
