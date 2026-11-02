import { media } from "./media";

/** Training programs offered. Edit freely — these drive /training, the lead form and FITBOT. */
export const programs = [
  {
    slug: "strength",
    name: "Strength & Powerlifting",
    short: "Squat, bench and deadlift with coached technique and planned progression.",
    detail:
      "Structured blocks built around the big lifts. You learn to brace, move well and add load week after week without guessing.",
    image: media.gym.deadlift,
    goals: ["STRENGTH", "MUSCLE_BUILDING"],
  },
  {
    slug: "hypertrophy",
    name: "Muscle Building",
    short: "Volume-driven training splits for size, shape and symmetry.",
    detail:
      "Split routines, tempo work and progressive overload, reviewed by a coach so every set moves you forward.",
    image: media.gym.curl,
    goals: ["MUSCLE_BUILDING", "TRANSFORMATION"],
  },
  {
    slug: "fat-loss",
    name: "Fat Loss & Conditioning",
    short: "Metabolic circuits and conditioning that burn without burning you out.",
    detail:
      "Intervals, sled work, ropes and circuits paired with simple nutrition habits you can keep.",
    image: media.gym.ropes,
    goals: ["WEIGHT_LOSS", "ENDURANCE"],
  },
  {
    slug: "personal-training",
    name: "Personal Training",
    short: "One coach. Your plan. Every session accounted for.",
    detail:
      "A dedicated trainer writes your program, coaches your sessions and tracks your progress so nothing is left to chance.",
    image: media.gym.coaching,
    goals: ["TRANSFORMATION", "GENERAL_FITNESS", "STRENGTH"],
  },
  {
    slug: "functional",
    name: "Functional Fitness",
    short: "Move better, feel better. Mobility, core and everyday strength.",
    detail:
      "Kettlebells, bodyweight and mobility work for people who want to feel capable outside the gym.",
    image: media.gym.rackWoman,
    goals: ["GENERAL_FITNESS", "ENDURANCE"],
  },
] as const;

export type ProgramSlug = (typeof programs)[number]["slug"];

/** The five "doors" on the homepage. Every one leads somewhere real. */
export const experiences = [
  {
    title: "Discover your potential",
    body: "Book a free consultation. A coach assesses where you are and maps where you could be.",
    cta: "Book a free consultation",
    href: "/consultation?intent=CONSULTATION",
    image: media.gym.athlete,
  },
  {
    title: "Find your training style",
    body: "Strength, size, conditioning or one-to-one coaching. See which program fits you.",
    cta: "Compare programs",
    href: "/training",
    image: media.gym.ropes,
    video: media.pushupVideo,
  },
  {
    title: "Explore our trainers",
    body: "Meet the coaches behind the programs and ask about personal training.",
    cta: "Ask about personal training",
    href: "/consultation?intent=PERSONAL_TRAINING&program=personal-training",
    image: media.gym.coaching,
  },
  {
    title: "Plan your nutrition",
    body: "Step into the Fuel Studio. Meals and habits that support your training.",
    cta: "Enter the Fuel Studio",
    href: "/fuel-studio",
    image: media.food.salmonBowl,
  },
  {
    title: "Start your transformation",
    body: "Pick a membership and get started today.",
    cta: "See memberships",
    href: "/memberships",
    image: media.gym.torso,
  },
] as const;

export const reasons = [
  {
    title: "Coaching, not just equipment",
    body: "Every member gets a starting assessment and a plan. Floor coaches correct form instead of watching from the desk.",
  },
  {
    title: "Programs with a progression",
    body: "Training is planned in blocks with clear targets, so you always know what this week is for.",
  },
  {
    title: "Nutrition that fits real life",
    body: "Meal ideas and guidance built around food you already eat, reviewed by qualified professionals.",
  },
  {
    title: "Progress you can see",
    body: "Your member dashboard tracks measurements, sessions and payments in one place.",
  },
] as const;

/**
 * PLACEHOLDER trainer profiles. Replace names, roles and photos with the real
 * coaching team. Shown with a "profile coming soon" note until replaced.
 */
export const trainers = [
  {
    name: "Head coach",
    role: "Strength & powerlifting",
    image: "/trainer_1.png",
    placeholder: true,
  },
  {
    name: "Conditioning coach",
    role: "Fat loss & conditioning",
    image: "/trainer_2.png",
    placeholder: true,
  },
  {
    name: "Personal trainer",
    role: "One-to-one transformation",
    image: media.gym.coaching,
    placeholder: true,
  },
] as const;
