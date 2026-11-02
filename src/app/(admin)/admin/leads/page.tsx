import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortalTitle, StatusPill, Empty } from "@/components/portal/ui";
import { intentLabel } from "@/lib/leads";
import { intentValues } from "@/lib/validation";
import { programs } from "@/config/content";
import { date } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Leads" };

const statuses = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;
const PAGE = 50;

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requireAdmin();
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const status = s("status");
  const intent = s("intent");
  const program = s("program");
  const from = s("from");
  const to = s("to");
  const q = s("q");
  const page = Math.max(1, Number(s("page")) || 1);

  const where: Prisma.LeadWhereInput = {
    ...((statuses as readonly string[]).includes(status) ? { status: status as (typeof statuses)[number] } : {}),
    ...((intentValues as readonly string[]).includes(intent) ? { intent: intent as (typeof intentValues)[number] } : {}),
    ...(program ? { program } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(new Date(to).getTime() + 86_400_000 - 1) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE, skip: (page - 1) * PAGE }),
    prisma.lead.count({ where }),
  ]);
  const qs = (p: number) => {
    const u = new URLSearchParams(Object.entries({ status, intent, program, from, to, q }).filter(([, v]) => v));
    u.set("page", String(p));
    return `?${u}`;
  };

  return (
    <div>
      <PortalTitle title="Leads" lede={`${total} matching enquiries`} />
      <form className="mb-6 grid gap-3 rounded-md border border-line bg-coal p-4 sm:grid-cols-3 xl:grid-cols-7 xl:items-end">
        <label className="text-sm xl:col-span-2">
          <span className="mb-1 block text-ash">Search</span>
          <input name="q" defaultValue={q} placeholder="Name, phone or email" className="field !py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ash">Status</span>
          <select name="status" defaultValue={status} className="field !py-2">
            <option value="">Any</option>
            {statuses.map((x) => (
              <option key={x} value={x}>
                {x.charAt(0) + x.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ash">Source</span>
          <select name="intent" defaultValue={intent} className="field !py-2">
            <option value="">Any</option>
            {intentValues.map((x) => (
              <option key={x} value={x}>
                {intentLabel[x]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ash">Interest</span>
          <select name="program" defaultValue={program} className="field !py-2">
            <option value="">Any</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ash">From</span>
          <input type="date" name="from" defaultValue={from} className="field !py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ash">To</span>
          <input type="date" name="to" defaultValue={to} className="field !py-2" />
        </label>
        <div className="flex gap-2 sm:col-span-3 xl:col-span-7">
          <button className="h-10 rounded bg-bone px-4 text-sm font-semibold text-pitch">Apply filters</button>
          <Link href="/admin/leads" className="grid h-10 place-items-center px-3 text-sm text-ash hover:text-bone">
            Clear
          </Link>
        </div>
      </form>

      {leads.length ? (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-coal text-ash">
              <tr>
                {["Received", "Name", "Phone", "Source", "Interest", "Goal", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-coal/60">
                  <td className="px-4 py-3 text-ash">{date(l.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="text-bone underline-offset-2 hover:underline">
                      {l.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ash">
                    <a href={`tel:${l.phone}`} className="hover:text-bone">
                      {l.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-ash">{intentLabel[l.intent]}</td>
                  <td className="px-4 py-3 text-ash">{programs.find((p) => p.slug === l.program)?.name ?? l.planSlug ?? "—"}</td>
                  <td className="px-4 py-3 text-ash">{l.goal?.replace(/_/g, " ").toLowerCase() ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No leads match these filters" />
      )}
      {total > PAGE && (
        <nav aria-label="Pagination" className="mt-4 flex gap-3 text-sm">
          {page > 1 && <Link href={qs(page - 1)} className="text-ember underline">Previous</Link>}
          <span className="text-ash">Page {page} of {Math.ceil(total / PAGE)}</span>
          {page * PAGE < total && <Link href={qs(page + 1)} className="text-ember underline">Next</Link>}
        </nav>
      )}
    </div>
  );
}
