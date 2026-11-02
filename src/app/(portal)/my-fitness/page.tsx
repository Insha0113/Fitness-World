import Link from "next/link";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getFeeStatus } from "@/lib/member";
import { PortalTitle, Panel, StatusPill } from "@/components/portal/ui";
import { buttonClass } from "@/components/ui/Button";
import { inr, date, cycleLabel, daysAgo } from "@/lib/format";

export default async function OverviewPage() {
  const { user } = await requireUser("/my-fitness");
  const [fee, profile, progress, sessions30, announcements, savedCount] = await Promise.all([
    getFeeStatus(user.id),
    prisma.memberProfile.findUnique({ where: { userId: user.id }, include: { trainer: true } }),
    prisma.progressEntry.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 2 }),
    prisma.progressEntry.aggregate({
      where: { userId: user.id, date: { gte: daysAgo(30) } },
      _sum: { sessions: true },
    }),
    prisma.announcement.findMany({ where: { isPublished: true }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }], take: 2 }),
    prisma.savedMeal.count({ where: { userId: user.id } }),
  ]);
  const active = fee.state === "ACTIVE";
  const first = user.name.split(" ")[0];
  const latest = progress[0];
  const prev = progress[1];
  const weightDelta = latest?.weightKg && prev?.weightKg ? Number(latest.weightKg) - Number(prev.weightKg) : null;

  return (
    <div>
      <PortalTitle
        title={`Welcome back, ${first}`}
        lede={active ? "Here's where you stand today." : "Your account is ready. Activate a membership to unlock training, nutrition and progress tools."}
      />

      {!active && (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-md border border-furnace/50 bg-furnace/10 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-bone">
              {fee.state === "EXPIRED" ? `Your membership ended on ${date(fee.membership?.endsAt)}.` : "You don't have an active membership yet."}
            </p>
            <p className="text-sm text-ash">Member-only features are paused until you renew.</p>
          </div>
          <Link href="/my-fitness/renew" className={buttonClass("primary", "md")}>
            {fee.state === "EXPIRED" ? "Renew membership" : "Choose a plan"}
          </Link>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Membership" className="xl:col-span-2" action={<StatusPill status={fee.state} />}>
          {fee.membership ? (
            <dl className="grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-ash">Plan</dt>
                <dd className="mt-1 font-display text-3xl font-extrabold uppercase text-bone">{fee.membership.plan.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-ash">{active ? "Expires" : "Ended"}</dt>
                <dd className="mt-1 text-xl text-bone">{date(fee.membership.endsAt)}</dd>
                {active && fee.daysLeft !== null && (
                  <dd className={`text-sm ${fee.dueSoon ? "text-ember" : "text-ash"}`}>{fee.daysLeft} days left</dd>
                )}
              </div>
              <div>
                <dt className="text-sm text-ash">Next fee due</dt>
                <dd className="mt-1 text-xl text-bone">{active ? date(fee.nextDueDate) : "Now"}</dd>
                {fee.planPrice && <dd className="text-sm text-ash">{inr(fee.planPrice.amountPaise)} · {cycleLabel(fee.planPrice.cycle)}</dd>}
              </div>
            </dl>
          ) : (
            <p className="text-ash">No membership yet.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/my-fitness/payments" className={buttonClass(fee.dueSoon || !active ? "primary" : "outline", "sm")}>
              Pay my fee
            </Link>
            <Link href="/my-fitness/membership" className={buttonClass("ghost", "sm")}>
              Membership details
            </Link>
          </div>
        </Panel>

        <Panel title="Payment status">
          {fee.lastPaid ? (
            <>
              <StatusPill status="PAID" />
              <p className="mt-3 text-2xl font-semibold text-bone">{inr(fee.lastPaid.amountPaise)}</p>
              <p className="text-sm text-ash">Paid {date(fee.lastPaid.paidAt)} · {fee.lastPaid.receiptNumber}</p>
              <Link href={`/my-fitness/payments/${fee.lastPaid.id}/receipt`} className="mt-4 inline-block text-sm text-ember underline">
                View receipt
              </Link>
            </>
          ) : (
            <p className="text-ash">No payments yet.</p>
          )}
        </Panel>

        <Panel title="Workout progress">
          {latest ? (
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-ash">Sessions (30 days)</dt>
                <dd className="font-display text-4xl font-extrabold text-bone">{sessions30._sum.sessions ?? 0}</dd>
              </div>
              <div>
                <dt className="text-sm text-ash">Latest weight</dt>
                <dd className="font-display text-4xl font-extrabold text-bone">
                  {latest.weightKg ? `${Number(latest.weightKg)}` : "—"}
                  <span className="text-base text-ash"> kg</span>
                </dd>
                {weightDelta !== null && (
                  <dd className="text-sm text-ash">
                    {weightDelta > 0 ? "+" : ""}
                    {weightDelta.toFixed(1)} kg since last entry
                  </dd>
                )}
              </div>
            </dl>
          ) : (
            <p className="text-ash">Log your first entry to start tracking.</p>
          )}
          <Link href="/my-fitness/progress" className="mt-4 inline-block text-sm text-ember underline">
            Open progress tracker
          </Link>
        </Panel>

        <Panel title="Your trainer">
          {profile?.trainer ? (
            <>
              <p className="text-xl font-semibold text-bone">{profile.trainer.name}</p>
              <p className="text-ash">{profile.trainer.specialty}</p>
              {profile.trainer.bio && <p className="mt-2 text-sm text-ash">{profile.trainer.bio}</p>}
            </>
          ) : (
            <>
              <p className="text-ash">
                {fee.membership?.plan.includesPersonalTraining
                  ? "Your trainer will be assigned shortly. The front desk will confirm."
                  : "Personal training isn't part of your plan."}
              </p>
              {!fee.membership?.plan.includesPersonalTraining && (
                <Link href="/consultation?intent=PERSONAL_TRAINING&program=personal-training" className="mt-3 inline-block text-sm text-ember underline">
                  Ask about personal training
                </Link>
              )}
            </>
          )}
        </Panel>

        <Panel title="Profile">
          <p className="text-bone">{user.name}</p>
          <p className="text-sm text-ash">{user.email}</p>
          <p className="text-sm text-ash">{user.phone}</p>
          <p className="mt-3 text-sm text-ash">{savedCount} meals saved to your nutrition plan</p>
          <Link href="/my-fitness/profile" className="mt-4 inline-block text-sm text-ember underline">
            Edit profile
          </Link>
        </Panel>

        {announcements.length > 0 && (
          <Panel title="From the gym" className="xl:col-span-3">
            <ul className="space-y-4">
              {announcements.map((a) => (
                <li key={a.id}>
                  <p className="font-semibold text-bone">{a.title}</p>
                  <p className="text-sm text-ash">{a.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}
