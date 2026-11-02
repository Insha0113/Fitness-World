import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { apiUser } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: RouteContext<"/api/me/progress/[id]">) {
  const ctx = await apiUser();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;
  // Scoped to the owner: deleting someone else's id is a silent no-op.
  await prisma.progressEntry.deleteMany({ where: { id, userId: ctx.user.id } });
  return NextResponse.json({ ok: true });
}
