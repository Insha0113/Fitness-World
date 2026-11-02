/**
 * FITNESS WORLD — central business configuration.
 *
 * Everything marked PLACEHOLDER must be replaced with real business details
 * before launch. Nothing here is real data: do not publish placeholder
 * statistics, addresses or phone numbers as if they were true.
 *
 * Membership plans and prices live in the database (managed from /admin/plans),
 * not here, so the admin can change them without a deploy.
 */

export const site = {
  name: "Fitness World",
  tagline: "Built by discipline.",
  description:
    "Fitness World is a premium strength and transformation gym. Personal training, structured programs and nutrition guidance under one roof.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  contact: {
    // PLACEHOLDER — replace with the real address.
    addressLines: ["Your street address", "Area, City", "State, PIN code"],
    // PLACEHOLDER — replace with the real Google Maps embed query or place name.
    mapQuery: "Fitness World gym",
    // PLACEHOLDER — real numbers come from env so they are not hardcoded.
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  },

  whatsapp: {
    // Digits only, with country code, e.g. 919800000000. Set in env.
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    defaultMessage:
      "Hi Fitness World! I'm interested in joining your gym. Could you share the membership details?",
  },

  // PLACEHOLDER — replace with real opening hours.
  hours: [
    { days: "Monday – Saturday", time: "Set your hours" },
    { days: "Sunday", time: "Set your hours" },
  ],

  /** Prices are edited in /admin/plans. While true, plan cards show a "sample pricing" note. */
  pricing: { isPlaceholder: true },

  social: {
    instagram: "",
    youtube: "",
    facebook: "",
  },

  /**
   * PLACEHOLDER statistics. `isPlaceholder: true` renders a visible
   * "sample figure" note next to the strip. Set real values and flip the
   * flag to false once the business confirms them.
   */
  stats: {
    isPlaceholder: true,
    items: [
      { value: 500, suffix: "+", label: "Members trained" },
      { value: 12, suffix: "", label: "Certified coaches" },
      { value: 5, suffix: "", label: "Training programs" },
      { value: 8000, suffix: " sq ft", label: "Training floor" },
    ],
  },
} as const;

export type FitnessGoal =
  | "WEIGHT_LOSS"
  | "MUSCLE_BUILDING"
  | "STRENGTH"
  | "GENERAL_FITNESS"
  | "ENDURANCE"
  | "TRANSFORMATION";

export const fitnessGoals: { value: FitnessGoal; label: string }[] = [
  { value: "WEIGHT_LOSS", label: "Weight loss" },
  { value: "MUSCLE_BUILDING", label: "Muscle building" },
  { value: "STRENGTH", label: "Strength training" },
  { value: "GENERAL_FITNESS", label: "General fitness" },
  { value: "ENDURANCE", label: "Endurance" },
  { value: "TRANSFORMATION", label: "Body transformation" },
];

export const contactTimes = [
  { value: "MORNING", label: "Morning (8am – 12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm – 4pm)" },
  { value: "EVENING", label: "Evening (4pm – 8pm)" },
  { value: "ANYTIME", label: "Any time" },
] as const;

export function whatsappLink(message: string = site.whatsapp.defaultMessage) {
  if (!site.whatsapp.number) return null;
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
