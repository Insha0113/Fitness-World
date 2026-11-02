import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { JoinFlow } from "@/components/checkout/JoinFlow";
import { getActivePlans } from "@/lib/plans";
import { getSession } from "@/lib/auth";
import { getMembershipState } from "@/lib/membership";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Join Fitness World",
  description: "Choose a membership, create your account and pay securely online.",
};

export default async function JoinPage({ searchParams }: PageProps<"/join">) {
  const sp = await searchParams;
  const [plans, session] = await Promise.all([getActivePlans(), getSession()]);
  const ms = session ? await getMembershipState(session.user.id) : null;
  const current =
    ms?.state === "ACTIVE" && ms.membership
      ? { planSlug: ms.membership.plan.slug, planName: ms.membership.plan.name, endsAt: ms.membership.endsAt.toISOString() }
      : null;

  return (
    <div className="bg-pitch pb-24 pt-[72px]">
      <Container className="pt-12 lg:pt-16">
        <h1 className="display text-[clamp(3rem,8vw,6rem)] text-bone">Join Fitness World</h1>
        <p className="mb-12 mt-3 max-w-[50ch] text-lg text-ash">
          Three quick steps. Your membership activates the moment your payment is confirmed.
        </p>
        <JoinFlow
          plans={plans}
          initialPlan={typeof sp.plan === "string" ? sp.plan : undefined}
          initialCycle={typeof sp.cycle === "string" ? sp.cycle : undefined}
          loggedIn={!!session}
          current={current}
          placeholderPricing={site.pricing.isPlaceholder}
        />
      </Container>
    </div>
  );
}
