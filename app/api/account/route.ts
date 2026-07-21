import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  bio: z.string().trim().max(500).optional(),
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, bio: parsed.data.bio ?? null },
  });

  return NextResponse.json({ name: user.name, bio: user.bio });
});
