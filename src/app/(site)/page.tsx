import { Hero } from "@/components/home/Hero";
import { ExperienceDoors } from "@/components/home/ExperienceDoors";
import { Stats } from "@/components/home/Stats";
import {
  AboutPreview,
  ProgramsPreview,
  WhyUs,
  TrainerShowcase,
  NutritionPreview,
  FinalCta,
} from "@/components/home/Sections";
import { Container, SectionTitle } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { PlanTable } from "@/components/plans/PlanTable";
import { StoryCard } from "@/components/stories/StoryCard";
import { getActivePlans } from "@/lib/plans";
import { getPublishedStories } from "@/lib/content";
import { site } from "@/config/site";

export const revalidate = 300;

export default async function HomePage() {
  const [plans, stories] = await Promise.all([getActivePlans(), getPublishedStories(3)]);

  return (
    <>
      <Hero />
      <ExperienceDoors />
      <Stats />
      <AboutPreview />
      <ProgramsPreview />

      <section aria-labelledby="plans-title" className="bg-pitch pb-24 lg:pb-36">
        <Container>
          <SectionTitle
            title={<span id="plans-title">Memberships</span>}
            lede="Three ways to train with us. Every plan starts with an assessment."
          />
          <div className="mt-12">
            <PlanTable plans={plans} placeholderPricing={site.pricing.isPlaceholder} />
          </div>
        </Container>
      </section>

      <WhyUs />

      <section aria-labelledby="stories-title" className="bg-pitch py-24 lg:py-36">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              title={<span id="stories-title">Real people. Real work.</span>}
              lede="Transformation stories from our members, shared with their permission."
            />
            <ButtonLink href="/transformations" variant="outline">
              See all stories
            </ButtonLink>
          </div>
          {stories.length ? (
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {stories.map((s) => (
                <li key={s.id}>
                  <StoryCard s={s} withPhotos={false} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-12 text-ash">Member stories are on their way.</p>
          )}
        </Container>
      </section>

      <TrainerShowcase />
      <NutritionPreview />
      <FinalCta />
    </>
  );
}
