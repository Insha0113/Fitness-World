import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PrintButton } from "@/components/portal/PrintButton";
import { inr, date, cycleLabel } from "@/lib/format";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Receipt" };

export default async function ReceiptPage({ params }: PageProps<"/my-fitness/payments/[id]/receipt">) {
  const { id } = await params;
  const { user } = await requireUser("/my-fitness/payments");
  const p = await prisma.payment.findUnique({ where: { id }, include: { membership: true } });
  // Admins may view any receipt; members only their own.
  if (!p || p.status !== "PAID" || (p.userId !== user.id && user.role !== "ADMIN")) notFound();
  const owner = p.userId === user.id ? user : await prisma.user.findUnique({ where: { id: p.userId } });

  return (
    <div>
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <article className="mx-auto max-w-2xl rounded-md bg-white p-8 text-neutral-900 sm:p-12 print:max-w-none print:p-0">
        <header className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div>
            <p className="font-display text-3xl font-black uppercase">Fitness World</p>
            <p className="text-sm text-neutral-500">{site.contact.addressLines.join(", ")}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Payment receipt</p>
            <p className="font-mono font-semibold">{p.receiptNumber}</p>
          </div>
        </header>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 text-sm">
          <div>
            <dt className="text-neutral-500">Billed to</dt>
            <dd className="font-medium">{owner?.name}</dd>
            <dd>{owner?.email}</dd>
          </div>
          <div className="text-right">
            <dt className="text-neutral-500">Paid on</dt>
            <dd className="font-medium">{date(p.paidAt)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Transaction ID</dt>
            <dd className="font-mono">{p.razorpayPaymentId}</dd>
          </div>
          <div className="text-right">
            <dt className="text-neutral-500">Payment method</dt>
            <dd className="capitalize">{p.method ?? "Online"}</dd>
          </div>
        </dl>
        <table className="w-full border-t border-neutral-200 text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-3 font-medium">Description</th>
              <th className="py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-neutral-100">
              <td className="py-3">
                {p.planName} membership, {cycleLabel(p.cycle)} ({p.durationDays} days)
                {p.membership && (
                  <span className="block text-neutral-500">Valid until {date(p.membership.endsAt)}</span>
                )}
              </td>
              <td className="py-3 text-right">{inr(p.amountPaise)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-900">
              <td className="py-3 font-semibold">Total paid</td>
              <td className="py-3 text-right text-lg font-semibold">{inr(p.amountPaise)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-8 text-xs text-neutral-500">
          Payment processed by Razorpay. This is a computer-generated receipt. [Placeholder: add GSTIN and tax breakdown if
          applicable.]
        </p>
      </article>
    </div>
  );
}
