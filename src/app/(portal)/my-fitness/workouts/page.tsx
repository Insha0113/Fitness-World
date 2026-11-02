import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PortalTitle, Panel, MembersOnly, Empty } from "@/components/portal/ui";
import { fitnessGoals } from "@/config/site";

export const metadata: Metadata = { title: "Workout plans" };

type Day = { day: string; exercises: { name: string; sets: number; reps: string; note?: string }[] };

export default async function WorkoutsPage() {
  const { session, user } = await requireUser("/my-fitness/workouts");
  if (session.user.membershipStatus !== "ACTIVE") {
    return (
      <div>
        <PortalTitle title="Workout plans" />
        <MembersOnly what="Workout plans" />
      </div>
    );
  }
  const plans = await prisma.workoutPlan.findMany({
    where: { isPublished: true, OR: [{ userId: null }, { userId: user.id }] },
    orderBy: { createdAt: "asc" },
  });
  plans.sort((a, b) => Number(!!b.userId) - Number(!!a.userId));

  return (
    <div className="space-y-5">
      <PortalTitle title="Workout plans" lede="Plans written for you by your coach appear first. Ask on the floor if anything is unclear." />
      {plans.length === 0 && <Empty title="No plans yet">Your coach will add your first plan after your assessment.</Empty>}
      {plans.map((p) => (
        <Panel key={p.id} title={p.title} action={p.userId ? <span className="text-sm text-ember">Assigned to you</span> : undefined}>
          <p className="text-ash">{p.summary}</p>
          <p className="mt-1 text-sm text-ash">
            {p.level}
            {p.goal ? ` · ${fitnessGoals.find((g) => g.value === p.goal)?.label}` : ""}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(p.days as unknown as Day[]).map((d) => (
              <div key={d.day} className="rounded border border-line p-4">
                <p className="font-display text-lg font-bold uppercase text-bone">{d.day}</p>
                <table className="mt-2 w-full text-sm">
                  <tbody className="divide-y divide-line/60">
                    {d.exercises.map((x) => (
                      <tr key={x.name}>
                        <td className="py-1.5 pr-2 text-bone/90">{x.name}</td>
                        <td className="whitespace-nowrap py-1.5 text-right text-ash">
                          {x.sets} × {x.reps}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
