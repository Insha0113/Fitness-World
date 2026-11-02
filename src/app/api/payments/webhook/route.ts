import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { activatePayment, markPaymentFailed } from "@/lib/payments";

type RpPayment = {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  method?: string;
  error_description?: string | null;
};

/**
 * Razorpay webhook. Configure in Dashboard → Webhooks with events
 * payment.captured, order.paid and payment.failed, pointing at
 * https://<your-domain>/api/payments/webhook.
 *
 * Guarantees: signature checked on the raw body; each event id processed
 * once (WebhookEvent table); activation itself is idempotent too.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  try {
    if (!signature || !verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (e) {
    console.error("[webhook] not configured", e);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let evt: { event: string; payload?: { payment?: { entity: RpPayment } } };
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const eventId = req.headers.get("x-razorpay-event-id");
  if (eventId) {
    try {
      await prisma.webhookEvent.create({ data: { id: eventId, event: evt.event } });
    } catch {
      // Unique violation: already processed this delivery.
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const p = evt.payload?.payment?.entity;
  try {
    if (p && (evt.event === "payment.captured" || evt.event === "order.paid") && p.status === "captured") {
      const r = await activatePayment({
        orderId: p.order_id,
        paymentId: p.id,
        method: p.method,
        amountPaise: p.amount,
        via: "webhook",
      });
      if (r.status === "amount_mismatch") console.error("[webhook] amount mismatch", p.order_id);
    } else if (p && evt.event === "payment.failed") {
      await markPaymentFailed(p.order_id, p.error_description ?? "Payment failed", p.id);
    }
  } catch (e) {
    console.error("[webhook] processing failed", evt.event, e);
    // Let Razorpay retry: remove the dedupe marker so the retry is processed.
    if (eventId) await prisma.webhookEvent.delete({ where: { id: eventId } }).catch(() => {});
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
