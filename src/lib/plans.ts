import "server-only";
import prisma from "./db";

export async function getActivePlans() {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { prices: { where: { isActive: true }, orderBy: { durationDays: "asc" } } },
  });
  return plans.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    features: p.features,
    isFeatured: p.isFeatured,
    includesPersonalTraining: p.includesPersonalTraining,
    prices: p.prices.map((x) => ({ id: x.id, cycle: x.cycle, amountPaise: x.amountPaise, durationDays: x.durationDays })),
  }));
}

export type PublicPlan = Awaited<ReturnType<typeof getActivePlans>>[number];

export async function getPlanPrice(planPriceId: string) {
  return prisma.planPrice.findFirst({
    where: { id: planPriceId, isActive: true, plan: { isActive: true } },
    include: { plan: true },
  });
}
