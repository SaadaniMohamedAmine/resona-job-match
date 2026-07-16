import { groq } from "./client";

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName?: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [
      {
        role: "system",
        content: `You are an expert career coach writing cover letters. Tone: reassuring expert — precise, confident, factual, never generic or exclamatory. Write a complete, ready-to-send cover letter (3-4 paragraphs) based on the resume and job description provided. Do not use placeholders like "[Company Name]" if the company name is given.`,
      },
      {
        role: "user",
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nCOMPANY:\n${companyName ?? "Not specified"}`,
      },
    ],
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content ?? "";
}
