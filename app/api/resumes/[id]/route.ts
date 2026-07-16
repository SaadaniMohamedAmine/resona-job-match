import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

export const DELETE = withErrorHandling(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const resume = await db.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.resume.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
