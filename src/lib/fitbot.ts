import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { site } from "@/config/site";
import { programs } from "@/config/content";
import { getActivePlans } from "./plans";
import { createLead } from "./leads";
import { cycleLabel, inr } from "./format";

const MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;
export const fitbotEnabled = () => !!process.env.ANTHROPIC_API_KEY;

/** Facts FITBOT may state. Built from config + the live plan table so prices stay in sync with admin edits. */
async function systemPrompt() {
  const plans = await getActivePlans();
  const planText = plans
    .map(
      (p) =>
        `- ${p.name} (slug ${p.slug}): ${p.tagline} Includes: ${p.features.join("; ")}. Prices: ${p.prices
          .map((x) => `${cycleLabel(x.cycle)} ${inr(x.amountPaise)} for ${x.durationDays} days`)
          .join(", ")}.`
    )
    .join("\n");

  return `You are FITBOT, the website assistant for ${site.name}, a premium strength and transformation gym.
Personality: friendly, energetic, encouraging, and brief. Reply in 1–4 short sentences or a short list. Plain text with occasional markdown links; no headings.

Only state facts listed below. If something isn't covered (exact address, equipment brands, trainer names, offers, medical questions), say you don't have that detail and offer a callback from the team. Never invent prices, timings, discounts, reviews or results.
${site.pricing.isPlaceholder ? "Prices below are sample figures while the gym finalises pricing — say so when quoting them." : ""}

Membership plans:
${planText || "- Plans are being updated; offer a callback."}

Training programs: ${programs.map((p) => `${p.name} — ${p.short}`).join(" | ")}

Opening hours: ${site.hours.map((h) => `${h.days}: ${h.time}`).join("; ")} (if these look like placeholders, say the team will confirm hours).
Contact: phone ${site.contact.phone || "not published yet"}, email ${site.contact.email || "not published yet"}, WhatsApp ${site.whatsapp.number ? "available via the green button" : "coming soon"}.

Payments: online via Razorpay (UPI, cards, net banking, wallets). The membership activates only after the payment is verified. No automatic renewals; members pay from My Fitness → Pay My Fee. Renewing the same plan early adds days to the current end date. Fitness World never asks for card numbers or UPI PINs in chat — never ask for them.

Useful pages (link with markdown, relative URLs only):
[Memberships](/memberships), [Join](/join), [Training programs](/training), [Personal training enquiry](/consultation?intent=PERSONAL_TRAINING&program=personal-training), [The Fuel Studio](/fuel-studio), [Free consultation](/consultation?intent=CONSULTATION), [Contact](/contact), [Member login](/login), [Transformations](/transformations).

Callbacks: when the visitor wants to talk to the team, or you can't answer, offer a callback. Collect their name and mobile number, then ask plainly: "Is it OK for our team to call or WhatsApp you about this?" Call request_callback only after they say yes. Never ask for health conditions, card details or passwords.
Nutrition: general ideas only; for medical or dietary conditions, recommend a doctor or registered dietitian.`;
}

const callbackTool = (saved: { ok: boolean }) =>
  betaZodTool({
    name: "request_callback",
    description:
      "Save a callback request for the Fitness World team. Only call after the visitor has given their name, a mobile number, and explicitly agreed to be contacted.",
    inputSchema: z.object({
      name: z.string().min(2).max(80).describe("Visitor's name"),
      phone: z.string().min(8).max(20).describe("Mobile number as given by the visitor"),
      topic: z.string().max(300).describe("Short summary of what they want to discuss"),
      consent_given: z.boolean().describe("True only if the visitor explicitly agreed to be contacted"),
    }),
    run: async (input) => {
      if (!input.consent_given) return "Not saved: ask the visitor for permission to contact them first.";
      const phone = input.phone.replace(/[\s()-]/g, "");
      if (!/^\+?\d{10,15}$/.test(phone)) return "Not saved: the phone number looks invalid. Ask the visitor to re-check it.";
      try {
        await createLead({
          name: input.name.trim(),
          phone,
          intent: "CHATBOT",
          message: input.topic,
          sourcePath: "/fitbot",
          consent: true,
        });
        saved.ok = true;
        return "Saved. Tell the visitor the team will call them, usually within one working day.";
      } catch {
        return "Saving failed. Apologise and suggest the contact form at /contact or WhatsApp.";
      }
    },
  });

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function askFitbot(history: ChatTurn[]) {
  client ??= new Anthropic();
  const saved = { ok: false };

  const final = await client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 2048,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [{ type: "text", text: await systemPrompt(), cache_control: { type: "ephemeral" } }],
    tools: [callbackTool(saved)],
    max_iterations: 4,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  if (final.stop_reason === "refusal") {
    return { text: "I can't help with that one. Want me to arrange a callback from our team instead?", callbackSaved: saved.ok };
  }
  const text = final.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return { text: text || "Sorry, I lost my train of thought. Could you ask that again?", callbackSaved: saved.ok };
}
