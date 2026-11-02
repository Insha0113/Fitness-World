import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getMembershipState } from "@/lib/membership";
import { PortalTitle, Panel, StatusPill, Empty } from "@/components/portal/ui";
import { buttonClass } from "@/components/ui/Button";
import { date, daysUntil } from "@/lib/format";

export const metadata: Metadata = { title: "My membership" };

export default async function MembershipPage() {
  const { user } = await requireUser("/my-fitness/membership");
  const [ms, history] = await Promise.all([
    getMembershipState(user.id),
    prisma.membership.findMany({ where: { userId: user.id }, orderBy: { startsAt: "desc" }, include: { plan: true } }),
  ]);
  const active = ms.state === "ACTIVE" ? ms.membership : null;

  return (
    <div className="space-y-5">
      <PortalTitle
        title="My membership"
        action={
          <Link href="/my-fitness/renew" className={buttonClass("primary", "md")}>
            {active ? "Renew or change plan" : "Renew membership"}
          </Link>
        }
      />
      <Panel title="Current plan" action={<StatusPill status={ms.state} />}>
        {active ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-ash">Plan</p>
              <p className="font-display text-3xl font-extrabold uppercase text-bone">{active.plan.name}</p>
            </div>
            <div>
              <p className="text-sm text-ash">Valid until</p>
              <p className="text-xl text-bone">{date(active.endsAt)}</p>
              <p className="text-sm text-ash">{daysUntil(active.endsAt)} days left</p>
            </div>
            <div>
              <p className="text-sm text-ash">Includes</p>
              <ul className="text-sm text-bone/85">
                {active.plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-ash">You don&apos;t have an active membership. Renew to regain access to member features.</p>
        )}
      </Panel>
      <Panel title="History">
        {history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-ash">
                <tr>
                  <th className="py-2 font-medium">Plan</th>
                  <th className="py-2 font-medium">From</th>
                  <th className="py-2 font-medium">To</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {history.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 text-bone">{m.plan.name}</td>
                    <td className="py-3 text-ash">{date(m.startsAt)}</td>
                    <td className="py-3 text-ash">{date(m.endsAt)}</td>
                    <td className="py-3">
                      <StatusPill status={m.status === "ACTIVE" && m.endsAt <= new Date() ? "EXPIRED" : m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No memberships yet" />
        )}
      </Panel>
    </div>
  );
}
