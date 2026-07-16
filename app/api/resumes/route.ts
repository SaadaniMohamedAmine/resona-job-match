import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const analyses = await db.analysis.findMany({
    where: { userId: session.user.id },
    include: { resume: true, jobPost: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ analyses });
});
