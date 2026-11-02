import Link from "next/link";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortalTitle, Panel, StatusPill } from "@/components/portal/ui";
import { inr, date, daysAgo, daysFromNow } from "@/lib/format";
import { intentLabel } from "@/lib/leads";

export default async function AdminOverview() {
  await requireAdmin();
  const now = new Date();
  const d30 = daysAgo(30);
  const in7 = daysFromNow(7);
  const [newLeads, activeMembers, revenue, pending, expiring, recent] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.membership.count({ where: { status: "ACTIVE", endsAt: { gt: now } } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: d30 } }, _sum: { amountPaise: true }, _count: true }),
    prisma.payment.count({ where: { status: "CREATED" } }),
    prisma.membership.findMany({
      where: { status: "ACTIVE", endsAt: { gt: now, lte: in7 } },
      include: { user: true, plan: true },
      orderBy: { endsAt: "asc" },
      take: 10,
    }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const tiles = [
    { label: "New leads", value: newLeads, href: "/admin/leads?status=NEW" },
    { label: "Active members", value: activeMembers, href: "/admin/members?status=ACTIVE" },
    { label: "Revenue, last 30 days", value: inr(revenue._sum.amountPaise ?? 0), sub: `${revenue._count} payments`, href: "/admin/payments?status=PAID" },
    { label: "Pending payments", value: pending, href: "/admin/payments?status=CREATED" },
  ];

  return (
    <div className="space-y-5">
      <PortalTitle title="Overview" />
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-md border border-line bg-coal p-5 hover:border-ash">
            <dt className="text-sm text-ash">{t.label}</dt>
            <dd className="mt-1 font-display text-4xl font-extrabold text-bone">{t.value}</dd>
            {t.sub && <dd className="text-sm text-ash">{t.sub}</dd>}
          </Link>
        ))}
      </dl>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Latest leads" action={<Link href="/admin/leads" className="text-sm text-ember underline">All leads</Link>}>
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/leads/${l.id}`} className="min-w-0">
                    <p className="truncate text-bone">{l.name}</p>
                    <p className="text-xs text-ash">
                      {intentLabel[l.intent]} · {date(l.createdAt)}
                    </p>
                  </Link>
                  <StatusPill status={l.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ash">No leads yet.</p>
          )}
        </Panel>
        <Panel title="Renewals due in 7 days">
          {expiring.length ? (
            <ul className="divide-y divide-line">
              {expiring.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/members/${m.userId}`} className="min-w-0">
                    <p className="truncate text-bone">{m.user.name}</p>
                    <p className="text-xs text-ash">
                      {m.plan.name} · {m.user.phone}
                    </p>
                  </Link>
                  <span className="text-sm text-ember">{date(m.endsAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ash">No memberships ending this week.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
