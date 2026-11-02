import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { profileSchema, fieldErrors } from "@/lib/validation";

/** Members may change these fields only. Email, role and membership are not editable here. */
export async function PATCH(req: Request) {
  const ctx = await apiUser();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;

  await prisma.user.update({
    where: { id: ctx.user.id },
    data: {
      name: d.name,
      phone: d.phone,
      profile: {
        upsert: {
          create: { goal: d.goal || null, city: d.city || null, emergencyContact: d.emergencyContact || null, marketingOptIn: !!d.marketingOptIn },
          update: { goal: d.goal || null, city: d.city || null, emergencyContact: d.emergencyContact || null, marketingOptIn: !!d.marketingOptIn },
        },
      },
    },
  });
  return NextResponse.json({ ok: true });
}
