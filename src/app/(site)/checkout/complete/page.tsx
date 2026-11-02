import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { AutoRefresh } from "@/components/checkout/AutoRefresh";
import { inr, date, cycleLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Payment status", robots: { index: false } };

export default async function CheckoutCompletePage({ searchParams }: PageProps<"/checkout/complete">) {
  const sp = await searchParams;
  const orderId = typeof sp.order === "string" ? sp.order : "";
  const { user } = await requireUser(`/checkout/complete?order=${encodeURIComponent(orderId)}`);

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: orderId },
    include: { membership: true },
  });
  if (!payment || payment.userId !== user.id) notFound();

  return (
    <div className="bg-pitch pb-24 pt-[72px]">
      <Container className="max-w-2xl pt-16">
        {payment.status === "PAID" ? (
          <>
            <CheckCircle2 size={48} className="text-success" aria-hidden />
            <h1 className="display mt-6 text-[clamp(3rem,8vw,5.5rem)] text-bone">You&apos;re in.</h1>
            <p className="mt-4 text-lg text-bone/80">
              Payment confirmed. Welcome to Fitness World, {user.name.split(" ")[0]}. A receipt has been sent to {user.email}.
            </p>
            <dl className="mt-8 divide-y divide-line rounded-md border border-line bg-coal">
              {[
                ["Plan", `${payment.planName} (${cycleLabel(payment.cycle)})`],
                ["Amount paid", inr(payment.amountPaise)],
                ["Active until", date(payment.membership?.endsAt)],
                ["Receipt", payment.receiptNumber],
                ["Transaction ID", payment.razorpayPaymentId ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-4">
                  <dt className="text-ash">{k}</dt>
                  <dd className="text-right text-bone">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/my-fitness" size="lg">
                Go to My Fitness
              </ButtonLink>
              <ButtonLink href={`/my-fitness/payments/${payment.id}/receipt`} size="lg" variant="outline">
                View receipt
              </ButtonLink>
            </div>
          </>
        ) : payment.status === "FAILED" ? (
          <>
            <XCircle size={48} className="text-danger" aria-hidden />
            <h1 className="display mt-6 text-[clamp(3rem,8vw,5rem)] text-bone">Payment didn&apos;t go through</h1>
            <p className="mt-4 text-lg text-bone/80">
              Your membership has not been activated. {payment.failureReason ? `Reason: ${payment.failureReason}.` : ""} If money
              was debited, your bank will reverse it automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/my-fitness/renew" size="lg">
                Try again
              </ButtonLink>
              <ButtonLink href="/consultation?intent=CALLBACK" size="lg" variant="outline">
                Get help
              </ButtonLink>
            </div>
          </>
        ) : (
          <>
            <Clock size={48} className="text-ember" aria-hidden />
            <h1 className="display mt-6 text-[clamp(3rem,8vw,5rem)] text-bone">Confirming your payment</h1>
            <p className="mt-4 text-lg text-bone/80">
              We&apos;re waiting for confirmation from the bank. This page updates automatically. Your membership activates
              only once the payment is verified.
            </p>
            <AutoRefresh seconds={5} />
            <p className="mt-6 text-sm text-ash">
              Taking too long? <Link href="/my-fitness/payments" className="underline">Check payment history</Link> later or
              contact us with order reference {payment.receiptNumber}.
            </p>
          </>
        )}
      </Container>
    </div>
  );
}
