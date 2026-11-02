import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getFeeStatus } from "@/lib/member";
import { PortalTitle, Panel, StatusPill, Empty } from "@/components/portal/ui";
import { buttonClass } from "@/components/ui/Button";
import { inr, date, cycleLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Pay my fee" };

export default async function PaymentsPage() {
  const { user } = await requireUser("/my-fitness/payments");
  const [fee, payments] = await Promise.all([
    getFeeStatus(user.id),
    prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const payHref = fee.planPrice
    ? `/my-fitness/renew?plan=${fee.planPrice.plan.slug}&cycle=${fee.planPrice.cycle}`
    : "/my-fitness/renew";
  const active = fee.state === "ACTIVE";

  return (
    <div className="space-y-5">
      <PortalTitle
        title="Pay my fee"
        lede="Pay whenever suits you. Paying early adds time on top of your current end date, so you never lose days."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Outstanding" className="lg:col-span-2">
          <p className="font-display text-6xl font-extrabold text-bone">{inr(fee.outstandingPaise)}</p>
          <p className="mt-2 text-ash">
            {!active
              ? fee.state === "EXPIRED"
                ? `Your membership ended on ${date(fee.nextDueDate)}. Pay to reactivate.`
                : "Choose a plan to start your membership."
              : fee.dueSoon
                ? `Due by ${date(fee.nextDueDate)} to keep your access uninterrupted.`
                : `Nothing due right now. Next payment by ${date(fee.nextDueDate)}.`}
          </p>
          {fee.planPrice && (
            <p className="mt-1 text-sm text-ash">
              {fee.planPrice.plan.name} · {cycleLabel(fee.planPrice.cycle)} · {inr(fee.planPrice.amountPaise)}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={payHref} className={buttonClass("primary", "lg")}>
              {fee.planPrice ? `Pay now · ${inr(fee.planPrice.amountPaise)}` : "Choose a plan"}
            </Link>
            {fee.planPrice && (
              <Link href="/my-fitness/renew" className={buttonClass("outline", "lg")}>
                Change plan or period
              </Link>
            )}
          </div>
          <p className="mt-4 text-xs text-ash">
            Payments are one-time charges through Razorpay. Nothing renews automatically.
          </p>
        </Panel>
        <Panel title="Next payment date">
          <p className="text-3xl font-semibold text-bone">{active ? date(fee.nextDueDate) : "Now"}</p>
          {active && fee.daysLeft !== null && <p className={fee.dueSoon ? "text-ember" : "text-ash"}>{fee.daysLeft} days from today</p>}
        </Panel>
      </div>

      <Panel title="Payment history">
        {payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-ash">
                <tr>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Plan</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Transaction ID</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">
                    <span className="sr-only">Receipt</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-bone">{date(p.paidAt ?? p.createdAt)}</td>
                    <td className="py-3 text-ash">
                      {p.planName} · {cycleLabel(p.cycle)}
                    </td>
                    <td className="py-3 text-bone">{inr(p.amountPaise)}</td>
                    <td className="py-3 font-mono text-xs text-ash">{p.razorpayPaymentId ?? "—"}</td>
                    <td className="py-3">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="py-3 text-right">
                      {p.status === "PAID" && (
                        <Link href={`/my-fitness/payments/${p.id}/receipt`} className="text-ember underline">
                          Receipt
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No payments yet" />
        )}
      </Panel>
    </div>
  );
}
