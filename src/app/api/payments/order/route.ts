import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { createOrder } from "@/lib/payments";
import { razorpayKeyId } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";

const body = z.object({ planPriceId: z.string().min(1).max(40) });

export async function POST(req: Request) {
  const ctx = await apiUser();
  if (!ctx) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  if (!rateLimit(`order:${ctx.user.id}`, 10, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many payment attempts. Please wait a few minutes." }, { status: 429 });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a plan to continue." }, { status: 400 });

  try {
    const res = await createOrder(ctx.user.id, parsed.data.planPriceId);
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({
      keyId: razorpayKeyId(),
      orderId: res.order.id,
      amount: res.order.amount,
      currency: res.order.currency,
      description: `${res.price.plan.name} membership`,
      prefill: { name: ctx.user.name, email: ctx.user.email, contact: ctx.user.phone },
    });
  } catch (e) {
    console.error("[payments] order failed", e);
    return NextResponse.json({ error: "We couldn't start the payment. Please try again in a moment." }, { status: 502 });
  }
}
