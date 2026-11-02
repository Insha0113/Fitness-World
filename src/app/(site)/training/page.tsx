import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { programs } from "@/config/content";
import { fitnessGoals } from "@/config/site";
import { img, media } from "@/config/media";

export const metadata: Metadata = {
  title: "Training programs",
  description: "Strength, muscle building, fat loss, functional fitness and personal training at Fitness World.",
};

const goalLabel = (g: string) => fitnessGoals.find((x) => x.value === g)?.label ?? g;

export default function TrainingPage() {
  return (
    <>
      <PageHero
        title="Find your training style"
        lede="Five programs, one standard: coached, planned and measured."
        image={media.gym.ropes}
      />

      <nav aria-label="Programs" className="sticky top-[72px] z-30 border-b border-line bg-pitch/90 backdrop-blur">
        <Container>
          <ul className="flex gap-6 overflow-x-auto py-4 text-sm [scrollbar-width:none]">
            {programs.map((p) => (
              <li key={p.slug} className="shrink-0">
                <a href={`#${p.slug}`} className="text-ash hover:text-bone">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <div className="bg-pitch">
        {programs.map((p, i) => (
          <section key={p.slug} id={p.slug} aria-labelledby={`${p.slug}-title`} className="scroll-mt-36 border-b border-line py-20 lg:py-28">
            <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={`relative aspect-[5/4] overflow-hidden rounded-md ${i % 2 ? "lg:order-2" : ""}`}>
                <Image src={img(p.image, 1200)} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
              <div>
                <h2 id={`${p.slug}-title`} className="display text-[clamp(2.6rem,5vw,4.4rem)] text-bone">
                  {p.name}
                </h2>
                <p className="mt-5 max-w-[50ch] text-lg text-bone/80">{p.detail}</p>
                <p className="mt-6 text-sm text-ash">
                  Best for: <span className="text-bone">{p.goals.map(goalLabel).join(", ")}</span>
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink
                    href={`/consultation?intent=${p.slug === "personal-training" ? "PERSONAL_TRAINING" : "CONSULTATION"}&program=${p.slug}`}
                  >
                    {p.slug === "personal-training" ? "Explore personal training" : "Try this program"}
                  </ButtonLink>
                  <ButtonLink href="/memberships" variant="outline">
                    See memberships
                  </ButtonLink>
                </div>
              </div>
            </Container>
          </section>
        ))}
      </div>
    </>
  );
}
