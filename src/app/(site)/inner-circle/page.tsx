import type { Metadata } from "next";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ContentGrid, type ContentView } from "@/components/inner/ContentGrid";
import { media } from "@/config/media";

export const metadata: Metadata = {
  title: "The Inner Circle",
  description: "Exclusive workouts, tutorials, challenges and coaching for Fitness World members.",
};

export const dynamic = "force-dynamic";

export default async function InnerCirclePage() {
  const session = await getSession();
  const isMember = session?.user.membershipStatus === "ACTIVE";

  const items = await prisma.contentItem.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  const announcements = isMember
    ? await prisma.announcement.findMany({ where: { isPublished: true }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }], take: 5 })
    : [];

  // Member-only fields (video URL, full text) never leave the server for non-members.
  const view: ContentView[] = items.map((c) => {
    const unlocked = isMember || c.isPreview;
    return {
      id: c.id,
      kind: c.kind,
      title: c.title,
      summary: c.summary,
      category: c.category,
      durationMin: c.durationMin,
      thumbnailUrl: c.thumbnailUrl,
      body: unlocked ? c.body : null,
      videoUrl: unlocked ? c.videoUrl : null,
      locked: !unlocked,
    };
  });

  return (
    <>
      <PageHero
        title="The Inner Circle"
        lede={
          isMember
            ? `Welcome in, ${session!.user.name?.split(" ")[0]}. New workouts, challenges and coaching land here first.`
            : "Exclusive workouts, tutorials and challenges for Fitness World members. Here's a preview."
        }
        image={media.gym.darkLift}
      >
        {!isMember && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/join" size="lg">
              Join Fitness World
            </ButtonLink>
            <ButtonLink href={session ? "/my-fitness/renew" : "/login?callbackUrl=/inner-circle"} size="lg" variant="outline">
              {session ? "Renew membership" : "Member login"}
            </ButtonLink>
          </div>
        )}
      </PageHero>

      <section className="bg-pitch py-16 lg:py-24">
        <Container>
          {announcements.length > 0 && (
            <div className="mb-12 rounded-md border border-line bg-coal p-6">
              <h2 className="font-display text-xl font-bold uppercase text-bone">Member announcements</h2>
              <ul className="mt-4 space-y-4">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <p className="font-semibold text-bone">{a.title}</p>
                    <p className="text-sm text-ash">{a.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {view.length ? <ContentGrid items={view} /> : <p className="text-ash">New content is on its way.</p>}
        </Container>
      </section>
    </>
  );
}
