import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rewriteSection } from "@/lib/ai/rewrite";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  analysisId: z.string(),
  section: z.enum(["summary", "experience", "skills"]),
  originalText: z.string().min(1),
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id! }, select: { plan: true } });
  if (user?.plan !== "PRO") {
    return NextResponse.json({ error: "Upgrade to Pro to use this feature" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const analysis = await db.analysis.findUnique({
    where: { id: parsed.data.analysisId },
    include: { jobPost: true },
  });
  if (!analysis || analysis.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rewritten = await rewriteSection(
    parsed.data.originalText,
    parsed.data.section,
    analysis.jobPost.description
  );

  return NextResponse.json({ rewritten });
});
