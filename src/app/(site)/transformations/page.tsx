import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { StoryCard } from "@/components/stories/StoryCard";
import { getPublishedStories } from "@/lib/content";
import { media } from "@/config/media";

export const metadata: Metadata = {
  title: "Transformations",
  description: "Real people. Real transformations. Member stories from Fitness World, shared with consent.",
};

export const revalidate = 300;

export default async function TransformationsPage() {
  const stories = await getPublishedStories();
  const hasSamples = stories.some((s) => s.isSample);

  return (
    <>
      <PageHero
        title="Real people. Real transformations."
        lede="Every story here is shared with the member's written permission. No stock bodies, no invented results."
        image={media.gym.torso}
      />
      <section className="bg-pitch py-20 lg:py-28">
        <Container>
          {hasSamples && (
            <p className="mb-10 max-w-3xl rounded-md border border-dashed border-ember/40 p-4 text-sm text-ember/90">
              The cards below are layout samples. Verified member stories will replace them as members share their
              journeys.
            </p>
          )}
          {stories.length ? (
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {stories.map((s) => (
                <li key={s.id}>
                  <StoryCard s={s} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-line p-10 text-center">
              <p className="text-lg text-bone">Member stories are on their way.</p>
              <p className="mt-2 text-ash">Your story could be the first one here.</p>
            </div>
          )}
        </Container>
      </section>
      <section className="border-t border-line bg-pitch py-24">
        <Container className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <h2 className="display max-w-[14ch] text-[clamp(2.6rem,6vw,5rem)] text-bone">Your story starts here.</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/consultation?intent=TRANSFORMATION" size="lg">
              Start your transformation
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
