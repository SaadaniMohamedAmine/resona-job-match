import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const updateSchema = z.object({
  status: z.enum(["APPLIED", "INTERVIEW", "OFFER", "REJECTED"]),
});

export const PATCH = withErrorHandling(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const application = await db.application.findUnique({ where: { id } });
  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.application.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ application: updated });
});

export const DELETE = withErrorHandling(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const application = await db.application.findUnique({ where: { id } });
  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.application.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
