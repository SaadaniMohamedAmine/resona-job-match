import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCoverLetter } from "@/lib/ai/cover-letter";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({ analysisId: z.string() });

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const analysis = await db.analysis.findUnique({
    where: { id: parsed.data.analysisId },
    include: { resume: true, jobPost: true },
  });
  if (!analysis || analysis.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const coverLetter = await generateCoverLetter(
    analysis.resume.extractedText,
    analysis.jobPost.description,
    analysis.jobPost.company ?? undefined
  );

  await db.analysis.update({ where: { id: analysis.id }, data: { coverLetter } });

  return NextResponse.json({ coverLetter });
});
