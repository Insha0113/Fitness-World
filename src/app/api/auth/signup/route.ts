import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { signupSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Creates the account only. No membership exists until a payment is verified
 * server-side, so a new account has no access to member features.
 */
export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`signup:${ip}`, 5, 30 * 60_000).ok) {
    return NextResponse.json({ error: "Too many sign-up attempts. Please try again later." }, { status: 429 });
  }

  const parsed = signupSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  const d = parsed.data;

  const plan = await prisma.planPrice.findFirst({
    where: { cycle: d.cycle, isActive: true, plan: { slug: d.planSlug, isActive: true } },
  });
  if (!plan) return NextResponse.json({ error: "That plan is not available.", fields: { planSlug: "Choose an available plan." } }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: d.email } });
  if (exists) {
    return NextResponse.json(
      { error: "An account with this email already exists. Log in to continue.", fields: { email: "Already registered. Log in instead." } },
      { status: 409 }
    );
  }

  await prisma.user.create({
    data: {
      name: d.name,
      email: d.email,
      phone: d.phone,
      passwordHash: await bcrypt.hash(d.password, 12),
      profile: { create: { goal: d.goal || null, marketingOptIn: d.marketingOptIn ?? false } },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
