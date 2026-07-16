import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  analysisId: z.string().optional(),
});

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await db.application.findMany({
    where: { userId: session.user.id! },
    include: { analysis: true },
    orderBy: { appliedAt: "desc" },
  });
  return NextResponse.json({ applications });
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const application = await db.application.create({
    data: { userId: session.user.id!, ...parsed.data },
  });
  return NextResponse.json({ application });
});
