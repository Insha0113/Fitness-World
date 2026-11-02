import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { askFitbot, fitbotEnabled } from "@/lib/fitbot";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(24)
    .refine((m) => m[0].role === "user" && m[m.length - 1].role === "user", "Conversation must start and end with the visitor."),
});

export async function GET() {
  return NextResponse.json({ enabled: fitbotEnabled() });
}

export async function POST(req: Request) {
  if (!fitbotEnabled()) {
    return NextResponse.json({ error: "FITBOT is offline right now.", offline: true }, { status: 503 });
  }
  const ip = await clientIp();
  if (!rateLimit(`fitbot:${ip}`, 25, 10 * 60_000).ok) {
    return NextResponse.json({ error: "You're sending messages quickly. Take a breather and try again in a few minutes." }, { status: 429 });
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message couldn't be read." }, { status: 400 });

  try {
    const res = await askFitbot(parsed.data.messages);
    return NextResponse.json(res);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "FITBOT is busy. Try again in a moment, or use WhatsApp." }, { status: 503 });
    }
    if (e instanceof Anthropic.APIError) console.error("[fitbot] API error", e.status, e.message);
    else console.error("[fitbot] failed", e);
    return NextResponse.json({ error: "FITBOT hit a snag. Try again, or reach us via the contact page." }, { status: 502 });
  }
}
