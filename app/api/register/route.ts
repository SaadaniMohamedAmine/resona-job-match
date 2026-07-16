import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const POST = withErrorHandling(async (req: Request) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const user = await db.user.create({ data: { email: parsed.data.email, password: hashed } });

  return NextResponse.json({ id: user.id });
});
