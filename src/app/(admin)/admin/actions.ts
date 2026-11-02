"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { goalValues } from "@/lib/validation";

/**
 * Every server action is a public endpoint — re-check the admin role in each
 * one instead of trusting that the form was rendered on an admin page.
 */
async function assertAdmin() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Not signed in");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.isActive || user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}

export type ActionState = { ok?: string; error?: string } | null;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function fail(e: unknown): ActionState {
  if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input." };
  if (e instanceof Error && (e.message === "Forbidden" || e.message === "Not signed in")) return { error: "Not authorised." };
  console.error("[admin action]", e);
  return { error: "Couldn't save. Check the values and try again." };
}

/* ------------------------------------------------------------------ leads */

export async function updateLeadStatus(id: string, status: "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED") {
  await assertAdmin();
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
}

export async function addLeadNote(id: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin();
    const body = z.string().trim().min(1, "Write a note first.").max(2000).parse(fd.get("body"));
    await prisma.lead.update({
      where: { id },
      data: { notes: { create: { body, authorId: admin.id } } },
    });
    revalidatePath(`/admin/leads/${id}`);
    return { ok: "Note added." };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------------------------------------------------------- members */

export async function setUserActive(id: string, isActive: boolean) {
  const admin = await assertAdmin();
  if (admin.id === id) throw new Error("You can't disable your own account.");
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath(`/admin/members/${id}`);
}

/**
 * Admins can cancel or reinstate a membership record, with a reason. They
 * cannot create paid time from nothing: new time only comes from verified payments.
 */
export async function setMembershipStatus(membershipId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const status = z.enum(["ACTIVE", "CANCELLED"]).parse(fd.get("status"));
    const note = z.string().trim().min(3, "Add a reason for the audit trail.").max(300).parse(fd.get("note"));
    const m = await prisma.membership.findUniqueOrThrow({ where: { id: membershipId }, include: { payments: true } });
    if (status === "ACTIVE") {
      if (!m.payments.some((p) => p.status === "PAID")) return { error: "This membership has no verified payment, so it can't be activated." };
      if (m.endsAt <= new Date()) return { error: "This membership has already ended. The member needs to renew." };
    }
    await prisma.membership.update({ where: { id: membershipId }, data: { status, adminNote: note } });
    revalidatePath(`/admin/members/${m.userId}`);
    return { ok: status === "ACTIVE" ? "Membership reinstated." : "Membership cancelled." };
  } catch (e) {
    return fail(e);
  }
}

export async function assignTrainer(userId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const trainerId = str(fd, "trainerId") || null;
    await prisma.memberProfile.upsert({
      where: { userId },
      create: { userId, trainerId },
      update: { trainerId },
    });
    revalidatePath(`/admin/members/${userId}`);
    return { ok: "Trainer updated." };
  } catch (e) {
    return fail(e);
  }
}

/* ------------------------------------------------------------------ plans */

const planSchema = z.object({
  name: z.string().min(2, "Name is required.").max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and dashes only."),
  tagline: z.string().min(2, "Tagline is required.").max(140),
  features: z.array(z.string().max(120)).min(1, "Add at least one feature."),
  sortOrder: z.coerce.number().int().min(0).max(99),
});

const cycleDays = { MONTHLY: 30, QUARTERLY: 90, HALF_YEARLY: 180, ANNUAL: 365 } as const;

export async function savePlan(planId: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const data = planSchema.parse({
      name: str(fd, "name"),
      slug: str(fd, "slug"),
      tagline: str(fd, "tagline"),
      features: lines(str(fd, "features")),
      sortOrder: str(fd, "sortOrder") || "0",
    });
    const flags = {
      isActive: bool(fd, "isActive"),
      isFeatured: bool(fd, "isFeatured"),
      includesPersonalTraining: bool(fd, "includesPersonalTraining"),
    };

    const plan = planId
      ? await prisma.membershipPlan.update({ where: { id: planId }, data: { ...data, ...flags } })
      : await prisma.membershipPlan.create({ data: { ...data, ...flags } });

    for (const cycle of Object.keys(cycleDays) as (keyof typeof cycleDays)[]) {
      const raw = str(fd, `price_${cycle}`);
      if (raw === "") {
        await prisma.planPrice.updateMany({ where: { planId: plan.id, cycle }, data: { isActive: false } });
        continue;
      }
      const rupees = z.coerce.number().positive("Prices must be above zero.").max(1_000_000).parse(raw);
      const amountPaise = Math.round(rupees * 100);
      await prisma.planPrice.upsert({
        where: { planId_cycle: { planId: plan.id, cycle } },
        create: { planId: plan.id, cycle, amountPaise, durationDays: cycleDays[cycle] },
        update: { amountPaise, isActive: true },
      });
    }
    revalidatePath("/admin/plans");
    revalidatePath("/memberships");
    revalidatePath("/");
    return { ok: planId ? "Plan saved." : "Plan created." };
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") return { error: "That slug is already used by another plan." };
    return fail(e);
  }
}

/* --------------------------------------------------------------- content */

const optUrl = z.union([z.literal(""), z.string().url("Enter a full https:// URL.").max(500)]);

export async function saveTestimonial(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const data = z
      .object({
        clientName: z.string().min(2, "Client name is required.").max(80),
        quote: z.string().min(10, "Quote is too short.").max(600),
        story: z.string().max(2000),
        program: z.string().max(80),
        durationLabel: z.string().max(80),
        beforeImage: optUrl,
        afterImage: optUrl,
        sortOrder: z.coerce.number().int().min(0).max(999),
      })
      .parse({
        clientName: str(fd, "clientName"),
        quote: str(fd, "quote"),
        story: str(fd, "story"),
        program: str(fd, "program"),
        durationLabel: str(fd, "durationLabel"),
        beforeImage: str(fd, "beforeImage"),
        afterImage: str(fd, "afterImage"),
        sortOrder: str(fd, "sortOrder") || "0",
      });
    const consentGiven = bool(fd, "consentGiven");
    const isSample = bool(fd, "isSample");
    const isPublished = bool(fd, "isPublished");
    if (isPublished && !isSample && !consentGiven) {
      return { error: "Record the client's consent before publishing a real testimonial." };
    }
    const payload = {
      ...data,
      story: data.story || null,
      program: data.program || null,
      durationLabel: data.durationLabel || null,
      beforeImage: data.beforeImage || null,
      afterImage: data.afterImage || null,
      consentGiven,
      isSample,
      isPublished,
    };
    if (id) await prisma.testimonial.update({ where: { id }, data: payload });
    else await prisma.testimonial.create({ data: payload });
    revalidatePath("/admin/content/testimonials");
    revalidatePath("/transformations");
    revalidatePath("/");
    return { ok: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteRecord(kind: "testimonial" | "announcement" | "content" | "meal" | "trainer", id: string) {
  await assertAdmin();
  if (kind === "testimonial") await prisma.testimonial.delete({ where: { id } });
  if (kind === "announcement") await prisma.announcement.delete({ where: { id } });
  if (kind === "content") await prisma.contentItem.delete({ where: { id } });
  if (kind === "meal") await prisma.meal.delete({ where: { id } });
  if (kind === "trainer") await prisma.trainer.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/admin/content", "layout");
}

export async function saveAnnouncement(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const data = z
      .object({ title: z.string().min(2, "Title is required.").max(120), body: z.string().min(2, "Write the announcement.").max(2000) })
      .parse({ title: str(fd, "title"), body: str(fd, "body") });
    const payload = { ...data, isPinned: bool(fd, "isPinned"), isPublished: bool(fd, "isPublished") };
    if (id) await prisma.announcement.update({ where: { id }, data: payload });
    else await prisma.announcement.create({ data: payload });
    revalidatePath("/admin/content/announcements");
    revalidatePath("/inner-circle");
    return { ok: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function saveContentItem(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const data = z
      .object({
        kind: z.enum(["VIDEO", "TUTORIAL", "TIP", "CHALLENGE", "ARTICLE", "MOTIVATION"]),
        title: z.string().min(2, "Title is required.").max(120),
        summary: z.string().min(2, "Summary is required.").max(300),
        body: z.string().max(5000),
        videoUrl: optUrl,
        thumbnailUrl: z.string().url("Thumbnail must be a full https:// URL."),
        category: z.string().min(2, "Category is required.").max(40),
        durationMin: z.union([z.literal(""), z.coerce.number().int().min(1).max(600)]),
      })
      .parse({
        kind: str(fd, "kind"),
        title: str(fd, "title"),
        summary: str(fd, "summary"),
        body: str(fd, "body"),
        videoUrl: str(fd, "videoUrl"),
        thumbnailUrl: str(fd, "thumbnailUrl"),
        category: str(fd, "category"),
        durationMin: str(fd, "durationMin"),
      });
    const payload = {
      ...data,
      body: data.body || null,
      videoUrl: data.videoUrl || null,
      durationMin: data.durationMin === "" ? null : data.durationMin,
      isPreview: bool(fd, "isPreview"),
      isPublished: bool(fd, "isPublished"),
    };
    if (id) await prisma.contentItem.update({ where: { id }, data: payload });
    else await prisma.contentItem.create({ data: payload });
    revalidatePath("/admin/content/videos");
    revalidatePath("/inner-circle");
    return { ok: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function saveMeal(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const data = z
      .object({
        name: z.string().min(2, "Name is required.").max(80),
        slug: z.string().regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and dashes."),
        slot: z.enum(["BREAKFAST", "MID_MORNING", "LUNCH", "EVENING_SNACK", "DINNER"]),
        category: z.enum(["breakfast", "protein", "muscle", "weight-loss", "snacks"]),
        description: z.string().min(5, "Description is required.").max(300),
        imageUrl: z.string().url("Image must be a full https:// URL."),
        calories: z.coerce.number().int().min(0).max(3000),
        proteinG: z.coerce.number().int().min(0).max(300),
        ingredients: z.array(z.string().max(80)).min(1, "Add at least one ingredient."),
        goals: z.array(z.enum(goalValues)),
      })
      .parse({
        name: str(fd, "name"),
        slug: str(fd, "slug"),
        slot: str(fd, "slot"),
        category: str(fd, "category"),
        description: str(fd, "description"),
        imageUrl: str(fd, "imageUrl"),
        calories: str(fd, "calories"),
        proteinG: str(fd, "proteinG"),
        ingredients: lines(str(fd, "ingredients")),
        goals: fd.getAll("goals").map(String),
      });
    const payload = { ...data, isVerified: bool(fd, "isVerified"), isPublished: bool(fd, "isPublished") };
    if (id) await prisma.meal.update({ where: { id }, data: payload });
    else await prisma.meal.create({ data: payload });
    revalidatePath("/admin/content/meals");
    revalidatePath("/fuel-studio");
    return { ok: "Saved." };
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") return { error: "That slug is already used." };
    return fail(e);
  }
}

export async function saveTrainer(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const data = z
      .object({
        name: z.string().min(2, "Name is required.").max(80),
        specialty: z.string().min(2, "Specialty is required.").max(80),
        bio: z.string().max(500),
      })
      .parse({ name: str(fd, "name"), specialty: str(fd, "specialty"), bio: str(fd, "bio") });
    await prisma.trainer.create({ data: { ...data, bio: data.bio || null } });
    revalidatePath("/admin/content/trainers");
    return { ok: "Trainer added." };
  } catch (e) {
    return fail(e);
  }
}
