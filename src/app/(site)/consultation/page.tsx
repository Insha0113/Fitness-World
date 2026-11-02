import type { Metadata } from "next";
import Image from "next/image";
import { LeadForm } from "@/components/forms/LeadForm";
import { Container } from "@/components/ui/primitives";
import { img, media } from "@/config/media";
import { getActivePlans } from "@/lib/plans";
import { intentValues } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Book a free consultation",
  description: "Tell us your goal. A Fitness World coach will call you to plan your first steps.",
};

const copy: Record<string, { title: string; lede: string; cta: string }> = {
  CONSULTATION: {
    title: "Book a free consultation",
    lede: "Tell us where you are and where you want to be. A coach will call to plan your first steps. No cost, no obligation.",
    cta: "Book my free consultation",
  },
  TRANSFORMATION: {
    title: "Start your transformation",
    lede: "Every transformation starts with an honest conversation. Tell us your goal and we'll map the route.",
    cta: "Start my transformation",
  },
  CALLBACK: {
    title: "Request a callback",
    lede: "Leave your number and the best time to reach you. We'll call you back.",
    cta: "Request a callback",
  },
  PLAN_ENQUIRY: {
    title: "Ask about a plan",
    lede: "Want to know what's included, how billing works or which plan suits you? We'll walk you through it.",
    cta: "Send my enquiry",
  },
  PERSONAL_TRAINING: {
    title: "Explore personal training",
    lede: "One coach, a plan written for you, and every session tracked. Tell us about your goal.",
    cta: "Talk to a personal trainer",
  },
  JOIN: {
    title: "Join Fitness World",
    lede: "Prefer to talk before you sign up? Leave your details and our team will help you choose.",
    cta: "Help me join",
  },
};

const steps = [
  { title: "We call you", body: "At the time you choose, usually within one working day." },
  { title: "You visit", body: "Tour the floor and meet a coach. Bring your questions." },
  { title: "You get a plan", body: "A starting assessment and a recommended program for your goal." },
];

export default async function ConsultationPage({ searchParams }: PageProps<"/consultation">) {
  const sp = await searchParams;
  const raw = typeof sp.intent === "string" ? sp.intent : "CONSULTATION";
  const intent = (intentValues as readonly string[]).includes(raw) && copy[raw] ? raw : "CONSULTATION";
  const program = typeof sp.program === "string" ? sp.program : "";
  const plan = typeof sp.plan === "string" ? sp.plan : "";
  const c = copy[intent];
  const plans = await getActivePlans();

  return (
    <div className="bg-pitch pb-24 pt-[72px]">
      <Container className="grid gap-12 pt-12 lg:grid-cols-12 lg:gap-16 lg:pt-20">
        <div className="lg:col-span-5">
          <h1 className="display text-[clamp(3rem,7vw,5.6rem)] text-bone">{c.title}</h1>
          <p className="mt-5 max-w-[46ch] text-lg text-bone/75">{c.lede}</p>

          <ol className="mt-10 space-y-6">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-5">
                <span className="font-display text-3xl font-extrabold leading-none text-furnace">{i + 1}</span>
                <div>
                  <p className="font-semibold text-bone">{s.title}</p>
                  <p className="text-ash">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-md lg:block">
            <Image src={img(media.gym.coaching, 1000)} alt="A coach guiding a member through a push-up" fill sizes="40vw" className="object-cover" />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative rounded-lg border border-line bg-coal p-6 sm:p-10">
            <LeadForm
              intent={intent}
              program={program}
              planSlug={plan}
              planOptions={plans.map((p) => ({ slug: p.slug, name: p.name }))}
              submitLabel={c.cta}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
