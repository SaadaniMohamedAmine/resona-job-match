import { HfInference } from "@huggingface/inference";
import { db } from "@/lib/db";

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

const MODEL = "sentence-transformers/all-MiniLM-L6-v2";

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: MODEL,
    inputs: text.slice(0, 8000),
  });
  return result as number[];
}

export async function saveResumeEmbedding(resumeId: string, embedding: number[]) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await db.$executeRawUnsafe(
    `UPDATE "Resume" SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    resumeId
  );
}

export async function saveJobPostEmbedding(jobPostId: string, embedding: number[]) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await db.$executeRawUnsafe(
    `UPDATE "JobPost" SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    jobPostId
  );
}

export async function cosineSimilarity(resumeId: string, jobPostId: string): Promise<number> {
  const result = await db.$queryRawUnsafe<{ similarity: number }[]>(
    `SELECT 1 - (r.embedding <=> j.embedding) AS similarity
     FROM "Resume" r, "JobPost" j
     WHERE r.id = $1 AND j.id = $2`,
    resumeId,
    jobPostId
  );
  return result[0]?.similarity ?? 0;
}
