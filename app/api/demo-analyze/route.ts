import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeResume } from "@/lib/ai/analyze";
import { generateEmbedding, cosineSimilarityVectors } from "@/lib/ai/embeddings";
import { checkDemoLimit } from "@/lib/rate-limit";
import { DEMO_SAMPLES } from "@/lib/ai/demo-samples";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  sampleId: z.enum(DEMO_SAMPLES.map((s) => s.id) as [string, ...string[]]),
});

export const POST = withErrorHandling(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await checkDemoLimit(ip);
  if (!success) {
    return NextResponse.json({ error: "demo_limit_reached" }, { status: 429 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sample = DEMO_SAMPLES.find((s) => s.id === parsed.data.sampleId);
  if (!sample) return NextResponse.json({ error: "unknown_sample" }, { status: 400 });

  const [result, resumeEmbedding, jobEmbedding] = await Promise.all([
    analyzeResume(sample.resumeText, sample.jobDescription),
    generateEmbedding(sample.resumeText),
    generateEmbedding(sample.jobDescription),
  ]);

  const semanticSimilarity = cosineSimilarityVectors(resumeEmbedding, jobEmbedding);

  return NextResponse.json({
    ...result,
    semanticSimilarity,
    sample: { jobTitle: sample.jobTitle, company: sample.company },
  });
});
