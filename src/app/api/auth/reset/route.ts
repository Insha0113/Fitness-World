import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/db";
import { password } from "@/lib/validation";

const body = z.object({ token: z.string().min(20).max(200), password });

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const rec = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } }),
    prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true });
}
