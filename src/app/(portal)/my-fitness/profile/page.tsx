import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getMembershipState } from "@/lib/membership";
import { PortalTitle, Panel, StatusPill } from "@/components/portal/ui";
import { ProfileForm } from "@/components/portal/forms";
import { date } from "@/lib/format";

export const metadata: Metadata = { title: "My profile" };

export default async function ProfilePage() {
  const { user } = await requireUser("/my-fitness/profile");
  const [profile, ms] = await Promise.all([
    prisma.memberProfile.findUnique({ where: { userId: user.id } }),
    getMembershipState(user.id),
  ]);
  return (
    <div>
      <PortalTitle title="My profile" lede="Keep your contact details current so we can reach you." />
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Personal details" className="xl:col-span-2">
          <p className="mb-5 text-sm text-ash">
            Email: <span className="text-bone">{user.email}</span>. To change your email, contact the front desk.
          </p>
          <ProfileForm
            initial={{
              name: user.name,
              phone: user.phone,
              goal: profile?.goal ?? "",
              city: profile?.city ?? "",
              emergencyContact: profile?.emergencyContact ?? "",
              marketingOptIn: profile?.marketingOptIn ?? false,
            }}
          />
        </Panel>
        <Panel title="Subscription" action={<StatusPill status={ms.state} />}>
          {ms.membership ? (
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-ash">Plan</dt>
                <dd className="text-bone">{ms.membership.plan.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-ash">Started</dt>
                <dd className="text-bone">{date(ms.membership.startsAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-ash">{ms.state === "ACTIVE" ? "Expires" : "Ended"}</dt>
                <dd className="text-bone">{date(ms.membership.endsAt)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-ash">No membership yet.</p>
          )}
          <Link href="/my-fitness/membership" className="mt-5 inline-block text-sm text-ember underline">
            Full membership history
          </Link>
        </Panel>
      </div>
    </div>
  );
}
