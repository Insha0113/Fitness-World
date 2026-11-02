import { z } from "zod";

export const goalValues = ["WEIGHT_LOSS", "MUSCLE_BUILDING", "STRENGTH", "GENERAL_FITNESS", "ENDURANCE", "TRANSFORMATION"] as const;
export const contactTimeValues = ["MORNING", "AFTERNOON", "EVENING", "ANYTIME"] as const;
export const intentValues = [
  "CONSULTATION",
  "JOIN",
  "PLAN_ENQUIRY",
  "CALLBACK",
  "PERSONAL_TRAINING",
  "TRANSFORMATION",
  "CONTACT",
  "CHATBOT",
] as const;

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^\+?\d{10,15}$/.test(v), "Enter a valid mobile number (10 digits, with country code if outside India).");

const name = z.string().trim().min(2, "Enter your full name.").max(80, "Name is too long.");
const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(120);

export const leadSchema = z.object({
  name,
  phone,
  email: z.union([email, z.literal("")]).optional(),
  intent: z.enum(intentValues).default("CONSULTATION"),
  program: z.string().trim().max(60).optional().or(z.literal("")),
  planSlug: z.string().trim().max(60).optional().or(z.literal("")),
  goal: z.enum(goalValues).optional().or(z.literal("")),
  contactTime: z.enum(contactTimeValues).optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Keep your message under 1000 characters.").optional().or(z.literal("")),
  sourcePath: z.string().max(200).optional(),
  consent: z.literal(true, { message: "Please agree to be contacted so we can reply." }),
  /** Honeypot: real people never fill this. */
  company: z.string().max(0).optional().or(z.literal("")),
});
export type LeadInput = z.input<typeof leadSchema>;

export const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Use at least one letter and one number.");

export const signupSchema = z.object({
  name,
  email,
  phone,
  password,
  planSlug: z.string().min(1, "Choose a membership plan."),
  cycle: z.enum(["MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUAL"]),
  goal: z.enum(goalValues).optional().or(z.literal("")),
  acceptTerms: z.literal(true, { message: "Please accept the membership terms and privacy policy." }),
  marketingOptIn: z.boolean().optional(),
});

export const profileSchema = z.object({
  name,
  phone,
  goal: z.enum(goalValues).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  emergencyContact: z.string().trim().max(80).optional().or(z.literal("")),
  marketingOptIn: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: password,
});

/** Turn a ZodError into { field: message } for forms. */
export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
