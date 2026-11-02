import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const body = z.object({ email: z.string().trim().toLowerCase().email() });

/** Always responds the same way, so it can't be used to discover which emails have accounts. */
export async function POST(req: Request) {
  const ip = await clientIp();
  const generic = NextResponse.json({ ok: true });
  if (!rateLimit(`forgot:${ip}`, 5, 30 * 60_000).ok) return generic;

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive) return generic;

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60 * 60_000),
    },
  });

  const link = `${process.env.NEXTAUTH_URL ?? ""}/reset-password?token=${token}`;
  await sendEmail(
    user.email,
    "Reset your Fitness World password",
    `<div style="font-family:system-ui,sans-serif"><p>Hi ${user.name.split(" ")[0]},</p>
     <p>Use the link below to set a new password. It expires in 1 hour and can be used once.</p>
     <p><a href="${link}">Reset my password</a></p>
     <p>If you didn't ask for this, you can ignore this email.</p></div>`
  );
  return generic;
}
