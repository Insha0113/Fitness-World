import Image from "next/image";
import Link from "next/link";
import { programs, reasons, trainers } from "@/config/content";
import { img, media } from "@/config/media";
import { Container, SectionTitle } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

/* About preview: image-led, offset text block. */
export function AboutPreview() {
  return (
    <section aria-labelledby="about-title" className="bg-pitch py-24 lg:py-36">
      <Container className="grid items-center gap-12 lg:grid-cols-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md lg:col-span-6">
          <Image
            src={img(media.gym.squatMono, 1200)}
            alt="Athlete holding a loaded barbell across her back"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h2 id="about-title" className="display text-[clamp(2.8rem,6vw,5.4rem)] text-bone">
            More than a gym.
          </h2>
          <p className="mt-6 text-lg text-bone/80">
            Fitness World is built for people who are done starting over. We pair serious equipment with coaching that
            pays attention: a plan for your goal, someone checking your form, and a way to see your progress.
          </p>
          <p className="mt-4 text-ash">
            Whether it is your first week in a gym or your tenth year, you train with structure here.
          </p>
          <ButtonLink href="/our-story" variant="outline" className="mt-8">
            Read our story
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

/* Programs: an index list with a hover image, not a card grid. */
export function ProgramsPreview() {
  return (
    <section aria-labelledby="programs-title" className="bg-pitch pb-24 lg:pb-36">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle title={<span id="programs-title">Training programs</span>} lede="Pick a direction. A coach will help you set the pace." />
          <ButtonLink href="/training" variant="outline">
            All programs
          </ButtonLink>
        </div>
        <ul className="mt-12 border-t border-line">
          {programs.map((p) => (
            <li key={p.slug} className="group relative border-b border-line">
              <Link
                href={`/training#${p.slug}`}
                className="grid items-center gap-4 py-7 transition-colors sm:grid-cols-[1fr_1.2fr_auto] sm:gap-10"
              >
                <h3 className="font-display text-[clamp(1.9rem,3.4vw,3rem)] font-extrabold uppercase leading-none text-bone transition-colors group-hover:text-furnace">
                  {p.name}
                </h3>
                <p className="text-ash">{p.short}</p>
                <span className="hidden h-20 w-32 overflow-hidden rounded sm:block">
                  <Image
                    src={img(p.image, 400)}
                    alt=""
                    width={256}
                    height={160}
                    className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-110 group-hover:grayscale-0"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function WhyUs() {
  return (
    <section aria-labelledby="why-title" className="relative isolate overflow-hidden bg-coal py-24 lg:py-36">
      <Image
        src={img(media.gym.floor, 1800)}
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-20 grayscale"
      />
      <Container>
        <SectionTitle title={<span id="why-title">Why train with us</span>} />
        <dl className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {reasons.map((r) => (
            <div key={r.title} className="border-l-2 border-furnace pl-6">
              <dt className="font-display text-[1.9rem] font-bold uppercase leading-tight text-bone">{r.title}</dt>
              <dd className="mt-3 max-w-[48ch] text-ash">{r.body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

export function TrainerShowcase() {
  return (
    <section aria-labelledby="trainers-title" className="bg-pitch py-24 lg:py-36">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            title={<span id="trainers-title">Your coaches</span>}
            lede="Coaches who plan your training and stay with you through it."
          />
          <ButtonLink href="/consultation?intent=PERSONAL_TRAINING&program=personal-training">
            Explore personal training
          </ButtonLink>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {trainers.map((t) => (
            <li key={t.name} className="group relative aspect-[3/4] overflow-hidden rounded-md bg-coal">
              <Image
                src={t.image.startsWith("http") ? img(t.image, 900) : t.image}
                alt={`${t.name}, ${t.role}`}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-[2rem] font-extrabold uppercase leading-none text-bone">{t.name}</p>
                <p className="mt-1 text-ember">{t.role}</p>
                {t.placeholder && <p className="mt-2 text-xs text-ash">Full profile coming soon</p>}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* A taste of the Fuel Studio: deliberately switches to the cream palette. */
export function NutritionPreview() {
  return (
    <section aria-labelledby="fuel-title" className="theme-fuel overflow-hidden py-24 lg:py-32">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 id="fuel-title" className="font-serif text-[clamp(2.8rem,5.5vw,4.8rem)] font-medium leading-[1.02] tracking-tight text-earth [font-variation-settings:'SOFT'_100,'opsz'_144]">
            Training is half of it. Eat for the rest.
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg text-earth/75">
            The Fuel Studio is our nutrition space: meal ideas for every goal, protein-forward recipes and simple habits
            that make training count.
          </p>
          <ButtonLink href="/fuel-studio" variant="fuel" size="lg" className="mt-8">
            Visit the Fuel Studio
          </ButtonLink>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[media.food.salmonBowl, media.food.eggToast, media.food.veggiePlate, media.food.fruitBowl].map((src, i) => (
            <div key={src} className={`relative aspect-square overflow-hidden rounded-[28px] ${i % 2 ? "translate-y-8" : ""}`}>
              <Image src={img(src, 700)} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="grain relative isolate overflow-hidden bg-pitch py-28 lg:py-44">
      <Image src={img(media.gym.grip, 1800)} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-35" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(255,90,26,.35),transparent_70%)]" />
      <Container className="text-center">
        <h2 id="final-title" className="display mx-auto max-w-[12ch] text-[clamp(3.4rem,10vw,9rem)] text-bone">
          Day one starts today.
        </h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-lg text-bone/75">
          Choose a membership or talk to a coach first. Either way, you will leave with a plan.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/memberships" size="lg">
            Join Fitness World
          </ButtonLink>
          <ButtonLink href="/consultation?intent=CALLBACK" size="lg" variant="outline">
            Request a callback
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
