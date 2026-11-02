import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortalTitle, StatusPill, Empty } from "@/components/portal/ui";
import { inr, date, cycleLabel } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsAdmin({ searchParams }: PageProps<"/admin/payments">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && ["PAID", "CREATED", "FAILED"].includes(sp.status) ? sp.status : "";
  const purpose = typeof sp.purpose === "string" && ["NEW_MEMBERSHIP", "RENEWAL"].includes(sp.purpose) ? sp.purpose : "";

  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status: status as "PAID" | "CREATED" | "FAILED" } : {}),
    ...(purpose ? { purpose: purpose as "NEW_MEMBERSHIP" | "RENEWAL" } : {}),
  };
  const [payments, sums] = await Promise.all([
    prisma.payment.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { id: true, name: true } } } }),
    prisma.payment.groupBy({ by: ["status"], _sum: { amountPaise: true }, _count: true }),
  ]);
  const sum = (s: string) => sums.find((x) => x.status === s);

  const tabs = [
    ["", "All"],
    ["PAID", "Successful"],
    ["CREATED", "Pending"],
    ["FAILED", "Failed"],
  ];

  return (
    <div>
      <PortalTitle title="Payments" />
      <dl className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Successful", sum("PAID")],
          ["Pending", sum("CREATED")],
          ["Failed", sum("FAILED")],
        ].map(([label, s]) => (
          <div key={label as string} className="rounded-md border border-line bg-coal p-5">
            <dt className="text-sm text-ash">{label as string}</dt>
            <dd className="mt-1 font-display text-3xl font-extrabold text-bone">{inr((s as (typeof sums)[number] | undefined)?._sum.amountPaise ?? 0)}</dd>
            <dd className="text-sm text-ash">{(s as (typeof sums)[number] | undefined)?._count ?? 0} payments</dd>
          </div>
        ))}
      </dl>
      <nav aria-label="Filter payments" className="mb-4 flex flex-wrap gap-2 text-sm">
        {tabs.map(([v, l]) => (
          <Link
            key={l}
            href={v ? `?status=${v}${purpose ? `&purpose=${purpose}` : ""}` : purpose ? `?purpose=${purpose}` : "?"}
            aria-current={status === v ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 ${status === v ? "bg-bone text-pitch" : "border border-line text-ash hover:text-bone"}`}
          >
            {l}
          </Link>
        ))}
        <Link
          href={`?${new URLSearchParams({ ...(status ? { status } : {}), ...(purpose === "RENEWAL" ? {} : { purpose: "RENEWAL" }) })}`}
          className={`rounded-full px-4 py-1.5 ${purpose === "RENEWAL" ? "bg-furnace text-pitch" : "border border-line text-ash hover:text-bone"}`}
        >
          Renewals only
        </Link>
      </nav>
      {payments.length ? (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-coal text-ash">
              <tr>
                {["Date", "Member", "Plan", "Type", "Amount", "Status", "Order / payment ID", "Verified via"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-ash">{date(p.paidAt ?? p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/members/${p.user.id}`} className="text-bone hover:underline">
                      {p.user.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ash">
                    {p.planName} · {cycleLabel(p.cycle)}
                  </td>
                  <td className="px-4 py-3 text-ash">{p.purpose === "RENEWAL" ? "Renewal" : "New"}</td>
                  <td className="px-4 py-3 text-bone">{inr(p.amountPaise)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} />
                    {p.failureReason && <span className="block text-xs text-ash">{p.failureReason}</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">
                    {p.razorpayOrderId}
                    <br />
                    {p.razorpayPaymentId ?? ""}
                  </td>
                  <td className="px-4 py-3 text-ash">{p.verifiedVia ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No payments here yet" />
      )}
    </div>
  );
}
