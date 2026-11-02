import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PortalTitle, Panel, MembersOnly, Empty } from "@/components/portal/ui";
import { ProgressForm, DeleteButton } from "@/components/portal/forms";
import { date } from "@/lib/format";

export const metadata: Metadata = { title: "Progress tracker" };

function Trend({ points }: { points: { x: Date; y: number }[] }) {
  if (points.length < 2) return <p className="text-sm text-ash">Log two or more weights to see your trend.</p>;
  const W = 600;
  const H = 160;
  const P = 12;
  const ys = points.map((p) => p.y);
  const min = Math.min(...ys) - 0.5;
  const max = Math.max(...ys) + 0.5;
  const t0 = points[0].x.getTime();
  const t1 = points[points.length - 1].x.getTime();
  const sx = (t: number) => P + ((t - t0) / Math.max(1, t1 - t0)) * (W - 2 * P);
  const sy = (y: number) => H - P - ((y - min) / (max - min)) * (H - 2 * P);
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x.getTime()).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" role="img" aria-label={`Weight trend from ${points[0].y} kg to ${last.y} kg`}>
        <path d={d} fill="none" stroke="var(--color-furnace)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={sx(p.x.getTime())} cy={sy(p.y)} r="3.5" fill="var(--color-bone)" />
        ))}
      </svg>
      <figcaption className="mt-2 flex justify-between text-xs text-ash">
        <span>
          {date(points[0].x)} · {points[0].y} kg
        </span>
        <span>
          {date(last.x)} · {last.y} kg
        </span>
      </figcaption>
    </figure>
  );
}

export default async function ProgressPage() {
  const { session, user } = await requireUser("/my-fitness/progress");
  if (session.user.membershipStatus !== "ACTIVE") {
    return (
      <div>
        <PortalTitle title="Progress tracker" />
        <MembersOnly what="The progress tracker" />
      </div>
    );
  }
  const entries = await prisma.progressEntry.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } });
  const weights = entries.filter((e) => e.weightKg !== null).map((e) => ({ x: e.date, y: Number(e.weightKg) }));

  return (
    <div className="space-y-5">
      <PortalTitle title="Progress tracker" lede="Log what you want to track. Only you and the gym's coaching team can see it." />
      <Panel title="Log an entry">
        <ProgressForm />
      </Panel>
      <Panel title="Weight trend">
        <Trend points={weights} />
      </Panel>
      <Panel title="History">
        {entries.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-ash">
                <tr>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Weight</th>
                  <th className="py-2 font-medium">Waist</th>
                  <th className="py-2 font-medium">Sessions</th>
                  <th className="py-2 font-medium">Note</th>
                  <th className="py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[...entries].reverse().map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 text-bone">{date(e.date)}</td>
                    <td className="py-2.5 text-ash">{e.weightKg ? `${Number(e.weightKg)} kg` : "—"}</td>
                    <td className="py-2.5 text-ash">{e.waistCm ? `${Number(e.waistCm)} cm` : "—"}</td>
                    <td className="py-2.5 text-ash">{e.sessions ?? "—"}</td>
                    <td className="py-2.5 text-ash">{e.note ?? ""}</td>
                    <td className="py-2.5 text-right">
                      <DeleteButton url={`/api/me/progress/${e.id}`} label={`Delete entry from ${date(e.date)}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No entries yet">Your first entry sets the baseline.</Empty>
        )}
      </Panel>
    </div>
  );
}
