import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { Container, PlaceholderNote } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { img, media } from "@/config/media";

export const metadata: Metadata = {
  title: "Our story",
  description: "More than a gym. A movement. The philosophy, mission and approach behind Fitness World.",
};

/*
 * Copy on this page describes the brand's philosophy. Founding history,
 * dates and people are left as clearly marked placeholders until the owners
 * supply the real story.
 */

const pillars = [
  { title: "Our mission", body: "To give everyone who walks in a clear plan, honest coaching and the support to follow through." },
  { title: "Our vision", body: "A community where discipline is normal, progress is visible and nobody trains alone." },
  { title: "Our approach", body: "Assess, plan, coach, measure, adjust. Training is a process, not a guess, and we treat it that way." },
  { title: "Our commitment", body: "Clean, safe equipment. Coaches who know your name. Straight answers about pricing and progress." },
];

const facilities = [
  { title: "Strength floor", body: "Racks, platforms, barbells and plates for serious lifting.", image: media.gym.barbellFloor },
  { title: "Dumbbells & machines", body: "A full range of free weights and selectorised machines.", image: media.gym.dumbbells },
  { title: "Conditioning zone", body: "Ropes, sleds and open space for circuits and intervals.", image: media.gym.ropes },
];

export default function OurStoryPage() {
  return (
    <>
      <PageHero
        title="More than a gym. A movement."
        lede="Fitness World exists for people who want to change, and are ready to put in the work."
        image={media.gym.darkLift}
      />

      <section className="bg-pitch py-24 lg:py-36">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display text-[clamp(2.6rem,5.5vw,4.6rem)] text-bone">Why we started</h2>
            <div className="mt-4">
              <PlaceholderNote>Founding story to be added by the owners</PlaceholderNote>
            </div>
          </div>
          <div className="space-y-5 text-lg text-bone/80 lg:col-span-6 lg:col-start-7">
            <p>
              Too many people join a gym, wander between machines for a few weeks and quietly stop coming. Not because
              they lack willpower, but because nobody showed them what to do, or why.
            </p>
            <p>
              Fitness World was built to fix that. Every member starts with a conversation and a plan. Coaches are on the
              floor, not behind a desk. Progress is measured, so you can see the work paying off.
            </p>
            <p className="text-ash">
              [Placeholder: when and where Fitness World opened, who founded it, and the moment that started it. Replace
              this paragraph with the real story.]
            </p>
          </div>
        </Container>
      </section>

      <section className="relative isolate overflow-hidden bg-coal py-24 lg:py-36">
        <Container>
          <h2 className="display max-w-[18ch] text-[clamp(2.6rem,5.5vw,4.6rem)] text-bone">
            Discipline is a skill. We teach it.
          </h2>
          <dl className="mt-14 grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2">
            {pillars.map((p) => (
              <div key={p.title} className="bg-coal p-8 lg:p-10">
                <dt className="font-display text-[1.9rem] font-bold uppercase text-bone">{p.title}</dt>
                <dd className="mt-3 max-w-[46ch] text-ash">{p.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-pitch py-24 lg:py-36">
        <Container>
          <h2 className="display text-[clamp(2.6rem,5.5vw,4.6rem)] text-bone">The floor</h2>
          <p className="mt-4 max-w-[52ch] text-lg text-ash">
            Built for training, not for show. [Placeholder: confirm the facility list and replace stock photos with photos
            of the actual gym.]
          </p>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {facilities.map((f) => (
              <li key={f.title}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                  <Image src={img(f.image, 900)} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold uppercase text-bone">{f.title}</h3>
                <p className="mt-1 text-ash">{f.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-line bg-pitch py-24">
        <Container className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <h2 className="display max-w-[14ch] text-[clamp(2.6rem,6vw,5rem)] text-bone">See it for yourself.</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/consultation?intent=CONSULTATION" size="lg">
              Book a free consultation
            </ButtonLink>
            <ButtonLink href="/memberships" size="lg" variant="outline">
              View memberships
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
