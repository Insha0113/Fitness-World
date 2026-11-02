import "server-only";
import crypto from "crypto";
import { after } from "next/server";
import prisma from "./db";
import { razorpay } from "./razorpay";
import { getPlanPrice } from "./plans";
import { notifyAdmin, sendEmail, esc } from "./email";
import { inr, date, cycleLabel } from "./format";

function receiptNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `FW-${d}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

/**
 * Create a Razorpay order for a plan price. The amount always comes from the
 * database — never from the browser.
 */
export async function createOrder(userId: string, planPriceId: string) {
  const price = await getPlanPrice(planPriceId);
  if (!price) return { error: "This plan is no longer available. Please choose another." as const };

  const hasHistory = await prisma.membership.count({ where: { userId } });
  const receipt = receiptNumber();

  const order = await razorpay().orders.create({
    amount: price.amountPaise,
    currency: "INR",
    receipt,
    notes: { userId, planPriceId: price.id, plan: price.plan.slug, cycle: price.cycle },
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      planPriceId: price.id,
      purpose: hasHistory ? "RENEWAL" : "NEW_MEMBERSHIP",
      planName: price.plan.name,
      cycle: price.cycle,
      durationDays: price.durationDays,
      amountPaise: price.amountPaise,
      razorpayOrderId: order.id,
      receiptNumber: receipt,
    },
  });

  return { order, payment, price };
}

/**
 * Mark a payment PAID and create/extend the membership — exactly once.
 * Called from both the checkout callback and the webhook; whichever arrives
 * first wins, the other becomes a no-op.
 */
export async function activatePayment(opts: {
  orderId: string;
  paymentId: string;
  method?: string | null;
  amountPaise: number;
  via: "checkout" | "webhook";
}) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { razorpayOrderId: opts.orderId } });
    if (!payment) return { status: "unknown_order" as const };
    if (payment.status === "PAID") return { status: "already_paid" as const, payment };
    if (opts.amountPaise !== payment.amountPaise) return { status: "amount_mismatch" as const, payment };

    // Atomic claim: only one concurrent caller can flip CREATED/FAILED → PAID.
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "PAID" } },
      data: {
        status: "PAID",
        razorpayPaymentId: opts.paymentId,
        method: opts.method ?? null,
        paidAt: new Date(),
        verifiedVia: opts.via,
        failureReason: null,
      },
    });
    if (claimed.count === 0) return { status: "already_paid" as const, payment };

    const price = await tx.planPrice.findUniqueOrThrow({ where: { id: payment.planPriceId } });
    const now = new Date();
    const current = await tx.membership.findFirst({
      where: { userId: payment.userId, status: "ACTIVE", endsAt: { gt: now } },
      orderBy: { endsAt: "desc" },
    });

    const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
    let membershipId: string;

    if (current && current.planId === price.planId) {
      // Renewal of the same plan: stack on top of the remaining days.
      const m = await tx.membership.update({
        where: { id: current.id },
        data: { endsAt: addDays(current.endsAt, payment.durationDays) },
      });
      membershipId = m.id;
    } else {
      if (current) {
        await tx.membership.update({
          where: { id: current.id },
          data: { status: "CANCELLED", adminNote: `Replaced by plan change (payment ${payment.receiptNumber})` },
        });
      }
      const m = await tx.membership.create({
        data: {
          userId: payment.userId,
          planId: price.planId,
          startsAt: now,
          endsAt: addDays(now, payment.durationDays),
        },
      });
      membershipId = m.id;
    }

    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: { membershipId },
      include: { user: true, membership: true },
    });
    return { status: "activated" as const, payment: updated };
  });

  if (result.status === "activated") {
    const p = result.payment;
    after(async () => {
      await sendEmail(
        p.user.email,
        `Payment received — ${p.planName}`,
        `<div style="font-family:system-ui,sans-serif"><h2>Welcome to Fitness World, ${esc(p.user.name.split(" ")[0])}.</h2>
         <p>We received ${inr(p.amountPaise)} for <b>${esc(p.planName)}</b> (${cycleLabel(p.cycle)}).</p>
         <p>Your membership is active until <b>${date(p.membership?.endsAt)}</b>.</p>
         <p>Receipt: ${p.receiptNumber}</p></div>`
      );
      await notifyAdmin(
        `Payment received: ${inr(p.amountPaise)} — ${p.user.name}`,
        { Member: p.user.name, Email: p.user.email, Plan: p.planName, Cycle: cycleLabel(p.cycle), Receipt: p.receiptNumber, Via: p.verifiedVia },
        "/admin/payments"
      );
    });
  }
  return result;
}

export async function markPaymentFailed(orderId: string, reason: string, paymentId?: string) {
  await prisma.payment.updateMany({
    where: { razorpayOrderId: orderId, status: "CREATED" },
    data: { status: "FAILED", failureReason: reason.slice(0, 300), ...(paymentId ? { razorpayPaymentId: paymentId } : {}) },
  });
}
