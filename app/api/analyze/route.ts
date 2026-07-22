import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeResume } from "@/lib/ai/analyze";
import {
  generateEmbedding,
  saveResumeEmbedding,
  saveJobPostEmbedding,
  cosineSimilarity,
} from "@/lib/ai/embeddings";
import { checkAnalyzeLimit } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string(),
  jobTitle: z.string().min(1),
  company: z.string().optional(),
  jobDescription: z.string().min(50, "Job description is too short"),
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkAnalyzeLimit(session.user.id);
  if (!success) {
    return NextResponse.json(
      { error: "You've reached your analysis limit for today." },
      { status: 429 }
    );
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { fileUrl, fileName, jobTitle, company, jobDescription } = parsed.data;

  const pdfBuffer = Buffer.from(await (await fetch(fileUrl)).arrayBuffer());
  const extractedText = await extractTextFromPdf(pdfBuffer);

  const resume = await db.resume.create({
    data: { userId: session.user.id, fileUrl, fileName, extractedText },
  });

  const jobPost = await db.jobPost.create({
    data: { title: jobTitle, company, description: jobDescription },
  });

  const [resumeEmbedding, jobEmbedding] = await Promise.all([
    generateEmbedding(extractedText),
    generateEmbedding(jobDescription),
  ]);
  await Promise.all([
    saveResumeEmbedding(resume.id, resumeEmbedding),
    saveJobPostEmbedding(jobPost.id, jobEmbedding),
  ]);

  const [result, semanticSimilarity] = await Promise.all([
    analyzeResume(extractedText, jobDescription),
    cosineSimilarity(resume.id, jobPost.id),
  ]);

  const analysis = await db.analysis.create({
    data: {
      userId: session.user.id,
      resumeId: resume.id,
      jobPostId: jobPost.id,
      matchScore: result.matchScore,
      semanticSimilarity,
      matchingSkills: result.matchingSkills,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
    },
  });

  return NextResponse.json({ analysisId: analysis.id, ...result });
});
