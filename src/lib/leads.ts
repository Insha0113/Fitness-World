import "server-only";
import { after } from "next/server";
import type { z } from "zod";
import prisma from "./db";
import { notifyAdmin } from "./email";
import { leadSchema } from "./validation";

const intentLabel: Record<string, string> = {
  CONSULTATION: "Free consultation",
  JOIN: "Join Fitness World",
  PLAN_ENQUIRY: "Plan enquiry",
  CALLBACK: "Callback request",
  PERSONAL_TRAINING: "Personal training",
  TRANSFORMATION: "Start transformation",
  CONTACT: "Contact form",
  CHATBOT: "FITBOT callback",
};

export async function createLead(data: z.output<typeof leadSchema>) {
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      intent: data.intent,
      program: data.program || null,
      planSlug: data.planSlug || null,
      goal: data.goal || null,
      contactTime: data.contactTime || null,
      message: data.message || null,
      sourcePath: data.sourcePath || null,
      consentAt: new Date(),
    },
  });

  // Notify after the response is sent so the visitor never waits on email.
  after(() =>
    notifyAdmin(
      `New lead: ${intentLabel[lead.intent]} — ${lead.name}`,
      {
        Name: lead.name,
        Phone: lead.phone,
        Email: lead.email,
        Program: lead.program,
        Plan: lead.planSlug,
        Goal: lead.goal,
        "Contact time": lead.contactTime,
        Message: lead.message,
      },
      `/admin/leads/${lead.id}`
    )
  );

  return lead;
}

export { intentLabel };
