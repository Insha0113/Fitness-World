import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { changePasswordSchema, fieldErrors } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ctx = await apiUser();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!rateLimit(`pw:${ctx.user.id}`, 5, 15 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  const parsed = changePasswordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, ctx.user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect.", fields: { currentPassword: "Incorrect password." } }, { status: 400 });

  await prisma.user.update({ where: { id: ctx.user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
  return NextResponse.json({ ok: true });
}
