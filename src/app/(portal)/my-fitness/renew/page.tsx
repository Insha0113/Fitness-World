import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getMembershipState } from "@/lib/membership";
import { getActivePlans } from "@/lib/plans";
import { JoinFlow } from "@/components/checkout/JoinFlow";
import { PortalTitle } from "@/components/portal/ui";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Renew membership" };

export default async function RenewPage({ searchParams }: PageProps<"/my-fitness/renew">) {
  const sp = await searchParams;
  const { user } = await requireUser("/my-fitness/renew");
  const [plans, ms] = await Promise.all([getActivePlans(), getMembershipState(user.id)]);
  const current =
    ms.state === "ACTIVE" && ms.membership
      ? { planSlug: ms.membership.plan.slug, planName: ms.membership.plan.name, endsAt: ms.membership.endsAt.toISOString() }
      : null;

  return (
    <div>
      <PortalTitle
        title="Renew membership"
        lede={
          sp.reason === "inactive"
            ? "That area is for active members. Renew below to get straight back in."
            : "Pick a plan and billing period. Renewing the same plan adds time to your current end date."
        }
      />
      <JoinFlow
        mode="renew"
        plans={plans}
        initialPlan={typeof sp.plan === "string" ? sp.plan : (ms.membership?.plan.slug ?? undefined)}
        initialCycle={typeof sp.cycle === "string" ? sp.cycle : undefined}
        loggedIn
        current={current}
        placeholderPricing={site.pricing.isPlaceholder}
      />
    </div>
  );
}
