import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { apiUser } from "@/lib/auth";

const body = z.object({ mealId: z.string().min(1).max(40) });

async function guard(req: Request) {
  const ctx = await apiUser();
  if (!ctx) return { error: NextResponse.json({ error: "Log in to save meals." }, { status: 401 }) };
  if (ctx.session.user.membershipStatus !== "ACTIVE")
    return { error: NextResponse.json({ error: "An active membership is required." }, { status: 403 }) };
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return { error: NextResponse.json({ error: "Invalid meal." }, { status: 400 }) };
  return { userId: ctx.user.id, mealId: parsed.data.mealId };
}

export async function POST(req: Request) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  const meal = await prisma.meal.findFirst({ where: { id: g.mealId, isPublished: true } });
  if (!meal) return NextResponse.json({ error: "Meal not found." }, { status: 404 });
  await prisma.savedMeal.upsert({
    where: { userId_mealId: { userId: g.userId, mealId: meal.id } },
    update: {},
    create: { userId: g.userId, mealId: meal.id, slot: meal.slot },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard(req);
  if ("error" in g) return g.error;
  await prisma.savedMeal.deleteMany({ where: { userId: g.userId, mealId: g.mealId } });
  return NextResponse.json({ ok: true });
}
