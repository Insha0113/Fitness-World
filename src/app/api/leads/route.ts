import { NextResponse } from "next/server";
import { leadSchema, fieldErrors } from "@/lib/validation";
import { createLead } from "@/lib/leads";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = await clientIp();
  const rl = rateLimit(`lead:${ip}`, 6, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a few minutes, or reach us on WhatsApp." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  // Honeypot filled: pretend success, store nothing.
  if (parsed.data.company) return NextResponse.json({ ok: true });

  try {
    const lead = await createLead(parsed.data);
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (e) {
    console.error("[leads] create failed", e);
    return NextResponse.json({ error: "We couldn't save your request. Please try again or contact us on WhatsApp." }, { status: 500 });
  }
}
