import "server-only";
import prisma from "./db";
import { getMembershipState } from "./membership";
import { daysUntil } from "./format";

/** Everything the dashboard needs about fees: what's due, when, and for which plan price. */
export async function getFeeStatus(userId: string) {
  const ms = await getMembershipState(userId);
  const lastPaid = await prisma.payment.findFirst({
    where: { userId, status: "PAID" },
    orderBy: { paidAt: "desc" },
    include: { planPrice: { include: { plan: true } } },
  });

  // The fee is the price of the member's current plan for the cycle they last paid.
  const planPrice =
    lastPaid?.planPrice && lastPaid.planPrice.isActive && lastPaid.planPrice.plan.isActive ? lastPaid.planPrice : null;

  const endsAt = ms.membership?.endsAt ?? null;
  const days = endsAt ? daysUntil(endsAt) : null;
  const active = ms.state === "ACTIVE";
  const dueSoon = active && days !== null && days <= 7;

  return {
    state: ms.state,
    membership: ms.membership,
    lastPaid,
    planPrice,
    nextDueDate: endsAt,
    daysLeft: days,
    outstandingPaise: !active || dueSoon ? (planPrice?.amountPaise ?? 0) : 0,
    dueSoon,
  };
}
