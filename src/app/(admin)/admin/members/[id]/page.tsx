import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortalTitle, Panel, StatusPill } from "@/components/portal/ui";
import { AdminForm, ActionButton, AdminInput } from "@/components/admin/AdminForm";
import { setUserActive, setMembershipStatus, assignTrainer } from "../../actions";
import { inr, date, cycleLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Member" };

export default async function MemberDetail({ params }: PageProps<"/admin/members/[id]">) {
  const { user: admin } = await requireAdmin();
  const { id } = await params;
  const [u, trainers] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        memberships: { orderBy: { startsAt: "desc" }, include: { plan: true, payments: { where: { status: "PAID" } } } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.trainer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!u) notFound();
  const now = new Date();

  return (
    <div className="space-y-5">
      <Link href="/admin/members" className="text-sm text-ash hover:text-bone">
        ← All members
      </Link>
      <PortalTitle
        title={u.name}
        lede={`${u.email} · ${u.phone} · joined ${date(u.createdAt)}`}
        action={
          u.id !== admin.id &&
          (u.isActive ? (
            <ActionButton action={setUserActive.bind(null, u.id, false)} confirm={`Disable ${u.name}'s account? They won't be able to log in.`}>
              Disable account
            </ActionButton>
          ) : (
            <ActionButton action={setUserActive.bind(null, u.id, true)} variant="primary">
              Re-enable account
            </ActionButton>
          ))
        }
      />
      {!u.isActive && <p className="rounded-md border border-danger/40 p-3 text-sm text-danger">This account is disabled.</p>}

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Profile">
          <dl className="space-y-2 text-sm">
            {[
              ["Goal", u.profile?.goal?.replace(/_/g, " ").toLowerCase()],
              ["City", u.profile?.city],
              ["Emergency contact", u.profile?.emergencyContact],
              ["Marketing opt-in", u.profile?.marketingOptIn ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-ash">{k}</dt>
                <dd className="text-right text-bone">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Trainer" className="xl:col-span-2">
          {trainers.length ? (
            <AdminForm action={assignTrainer.bind(null, u.id)} submitLabel="Save trainer" className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-ash">Assigned trainer</span>
                <select name="trainerId" defaultValue={u.profile?.trainerId ?? ""} className="field !py-2">
                  <option value="">None</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.specialty}
                    </option>
                  ))}
                </select>
              </label>
            </AdminForm>
          ) : (
            <p className="text-sm text-ash">
              No trainers yet. <Link href="/admin/content/trainers" className="text-ember underline">Add trainers</Link>.
            </p>
          )}
        </Panel>
      </div>

      <Panel title="Membership history">
        <p className="mb-4 text-sm text-ash">
          Time is only added by verified payments. You can cancel a membership, or reinstate a cancelled one that has a verified
          payment and hasn&apos;t ended. A reason is required for the audit trail.
        </p>
        {u.memberships.length ? (
          <ul className="space-y-4">
            {u.memberships.map((m) => {
              const live = m.status === "ACTIVE" && m.endsAt > now;
              return (
                <li key={m.id} className="rounded border border-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-bone">{m.plan.name}</p>
                      <p className="text-sm text-ash">
                        {date(m.startsAt)} – {date(m.endsAt)} · {m.payments.length} verified payment(s)
                      </p>
                      {m.adminNote && <p className="text-xs text-ash">Note: {m.adminNote}</p>}
                    </div>
                    <StatusPill status={live ? "ACTIVE" : m.status === "CANCELLED" ? "CANCELLED" : "EXPIRED"} />
                  </div>
                  {(live || (m.status === "CANCELLED" && m.endsAt > now)) && (
                    <AdminForm
                      action={setMembershipStatus.bind(null, m.id)}
                      submitLabel={live ? "Cancel membership" : "Reinstate membership"}
                      className="mt-3 flex flex-wrap items-end gap-3"
                    >
                      <input type="hidden" name="status" value={live ? "CANCELLED" : "ACTIVE"} />
                      <div className="min-w-64 flex-1">
                        <AdminInput label="Reason" name="note" required />
                      </div>
                    </AdminForm>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-ash">No memberships yet.</p>
        )}
      </Panel>

      <Panel title="Payments">
        {u.payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-ash">
                <tr>
                  {["Date", "Plan", "Amount", "Status", "Razorpay payment", "Receipt"].map((h) => (
                    <th key={h} className="py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {u.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 text-bone">{date(p.paidAt ?? p.createdAt)}</td>
                    <td className="py-2 text-ash">
                      {p.planName} · {cycleLabel(p.cycle)}
                    </td>
                    <td className="py-2 text-bone">{inr(p.amountPaise)}</td>
                    <td className="py-2">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="py-2 font-mono text-xs text-ash">{p.razorpayPaymentId ?? "—"}</td>
                    <td className="py-2">
                      {p.status === "PAID" ? (
                        <Link href={`/my-fitness/payments/${p.id}/receipt`} className="text-ember underline">
                          {p.receiptNumber}
                        </Link>
                      ) : (
                        <span className="text-ash">{p.receiptNumber}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-ash">No payments.</p>
        )}
      </Panel>
    </div>
  );
}
