import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { PlanTable } from "@/components/plans/PlanTable";
import { LeadForm } from "@/components/forms/LeadForm";
import { getActivePlans } from "@/lib/plans";
import { media } from "@/config/media";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Memberships",
  description: "Regular Fitness, Personal Training and Premium Transformation memberships at Fitness World.",
};

export const revalidate = 300;

const faqs = [
  {
    q: "How do I pay?",
    a: "Online through Razorpay: UPI, cards, net banking and wallets. Your membership activates as soon as the payment is verified.",
  },
  {
    q: "What happens when my membership ends?",
    a: "You keep your account and history. Member-only areas pause until you renew from your My Fitness dashboard. Renewal adds time from your current end date, so you never lose days.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes. Talk to the front desk or request a callback and we'll help you move to the plan that fits.",
  },
  {
    q: "Is there a joining fee?",
    a: "The price shown is the price you pay at checkout. [Placeholder: confirm joining-fee and refund policy with the gym.]",
  },
];

export default async function MembershipsPage() {
  const plans = await getActivePlans();
  return (
    <>
      <PageHero
        title="Choose how you train"
        lede="Three memberships. Pick a billing period that suits you. Every plan includes a starting assessment."
        image={media.gym.grip}
      />
      <section className="bg-pitch py-20 lg:py-28">
        <Container>
          <PlanTable plans={plans} placeholderPricing={site.pricing.isPlaceholder} />
        </Container>
      </section>

      <section aria-labelledby="faq-title" className="bg-pitch pb-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="faq-title" className="display text-[clamp(2.4rem,5vw,4rem)] text-bone">
              Questions, answered
            </h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-bone">
                    {f.q}
                    <span aria-hidden className="text-2xl leading-none text-furnace transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-ash">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="relative rounded-lg border border-line bg-coal p-6 sm:p-10">
              <h2 className="display text-[2.6rem] text-bone">Not sure which plan?</h2>
              <p className="mb-8 mt-2 text-ash">Tell us your goal and we&apos;ll recommend one.</p>
              <LeadForm
                intent="PLAN_ENQUIRY"
                planOptions={plans.map((p) => ({ slug: p.slug, name: p.name }))}
                submitLabel="Help me choose"
                showMessage={false}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
