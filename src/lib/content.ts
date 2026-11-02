import "server-only";
import prisma from "./db";

/** Published stories: real ones require recorded consent; samples are labelled in the UI. */
export function getPublishedStories(take?: number) {
  return prisma.testimonial.findMany({
    where: { isPublished: true, OR: [{ isSample: true }, { consentGiven: true }] },
    orderBy: [{ isSample: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      clientName: true,
      quote: true,
      story: true,
      program: true,
      durationLabel: true,
      beforeImage: true,
      afterImage: true,
      isSample: true,
    },
  });
}

export function getPublishedMeals() {
  return prisma.meal.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
}
