import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { razorpay, verifyCheckoutSignature } from "@/lib/razorpay";
import { activatePayment, markPaymentFailed } from "@/lib/payments";

const body = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
});

/**
 * Checkout callback. The browser's "success" is only a hint: we verify the
 * HMAC signature, confirm the order belongs to this user, and re-fetch the
 * payment from Razorpay to check its real status and amount before activating.
 */
export async function POST(req: Request) {
  const ctx = await apiUser();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: sig } = parsed.data;

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment || payment.userId !== ctx.user.id) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  if (payment.status === "PAID") return NextResponse.json({ ok: true, orderId });

  if (!verifyCheckoutSignature(orderId, paymentId, sig)) {
    await markPaymentFailed(orderId, "Signature verification failed");
    return NextResponse.json({ error: "We couldn't verify this payment. If money was deducted, contact us with your receipt." }, { status: 400 });
  }

  try {
    let rp = await razorpay().payments.fetch(paymentId);
    if (rp.order_id !== orderId) {
      return NextResponse.json({ error: "Payment does not match this order." }, { status: 400 });
    }
    if (rp.status === "authorized") {
      // Accounts without auto-capture: capture now so the money is actually collected.
      rp = await razorpay().payments.capture(paymentId, Number(rp.amount), "INR");
    }
    if (rp.status !== "captured") {
      if (rp.status === "failed") await markPaymentFailed(orderId, rp.error_description ?? "Payment failed", paymentId);
      return NextResponse.json({ error: "The payment hasn't completed yet. We'll activate your membership as soon as it does." }, { status: 202 });
    }

    const result = await activatePayment({
      orderId,
      paymentId,
      method: rp.method,
      amountPaise: Number(rp.amount),
      via: "checkout",
    });
    if (result.status === "amount_mismatch" || result.status === "unknown_order") {
      console.error("[payments] verify mismatch", orderId, result.status);
      return NextResponse.json({ error: "Payment details don't match. Our team has been notified." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, orderId });
  } catch (e) {
    console.error("[payments] verify failed", e);
    return NextResponse.json(
      { error: "We couldn't confirm the payment right now. If it went through, your membership will activate automatically within a few minutes." },
      { status: 502 }
    );
  }
}
