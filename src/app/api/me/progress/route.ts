import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fieldErrors } from "@/lib/validation";

const num = (min: number, max: number, msg: string) =>
  z
    .union([z.literal(""), z.coerce.number().min(min, msg).max(max, msg)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v));

const schema = z
  .object({
    date: z.coerce.date({ message: "Pick a date." }).refine((d) => d <= new Date(), "Date can't be in the future."),
    weightKg: num(20, 400, "Enter a weight between 20 and 400 kg."),
    waistCm: num(30, 300, "Enter a waist between 30 and 300 cm."),
    sessions: num(0, 60, "Enter 0–60 sessions."),
    note: z.string().trim().max(200).optional(),
  })
  .refine((d) => d.weightKg !== null || d.waistCm !== null || d.sessions !== null || d.note, {
    message: "Fill in at least one measurement.",
    path: ["weightKg"],
  });

export async function POST(req: Request) {
  const ctx = await apiUser();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (ctx.session.user.membershipStatus !== "ACTIVE") return NextResponse.json({ error: "An active membership is required." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;
  await prisma.progressEntry.create({
    data: {
      userId: ctx.user.id,
      date: d.date,
      weightKg: d.weightKg,
      waistCm: d.waistCm,
      sessions: d.sessions === null ? null : Math.round(d.sessions),
      note: d.note || null,
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
