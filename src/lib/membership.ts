import "server-only";
import prisma from "./db";

export type MembershipState = "ACTIVE" | "EXPIRED" | "PENDING" | "NONE";

/**
 * Source of truth for "is this person a paying member right now?".
 * A membership counts only if its status is ACTIVE and its end date is in the future.
 * Memberships are only ever created by verified payments (see lib/payments.ts).
 */
export async function getMembershipState(userId: string) {
  const now = new Date();
  const current = await prisma.membership.findFirst({
    where: { userId, status: "ACTIVE", startsAt: { lte: now }, endsAt: { gt: now } },
    orderBy: { endsAt: "desc" },
    include: { plan: true },
  });
  if (current) return { state: "ACTIVE" as const, membership: current };

  const last = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { endsAt: "desc" },
    include: { plan: true },
  });
  if (last) return { state: "EXPIRED" as const, membership: last };

  const pending = await prisma.payment.findFirst({ where: { userId, status: "CREATED" } });
  return { state: pending ? ("PENDING" as const) : ("NONE" as const), membership: null };
}

/** Mark ACTIVE rows whose end date has passed as EXPIRED. Cheap; run on dashboard loads. */
export async function sweepExpired(userId?: string) {
  await prisma.membership.updateMany({
    where: { status: "ACTIVE", endsAt: { lte: new Date() }, ...(userId ? { userId } : {}) },
    data: { status: "EXPIRED" },
  });
}
