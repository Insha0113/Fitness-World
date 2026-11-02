import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortalTitle, StatusPill, Empty } from "@/components/portal/ui";
import { date } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage({ searchParams }: PageProps<"/admin/members">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const now = new Date();

  const where: Prisma.UserWhereInput = {
    role: "MEMBER",
    ...(q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
      : {}),
    ...(status === "ACTIVE"
      ? { memberships: { some: { status: "ACTIVE", endsAt: { gt: now } } } }
      : status === "EXPIRED"
        ? { memberships: { some: {}, none: { status: "ACTIVE", endsAt: { gt: now } } } }
        : status === "NONE"
          ? { memberships: { none: {} } }
          : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { memberships: { orderBy: { endsAt: "desc" }, take: 1, include: { plan: true } } },
  });

  return (
    <div>
      <PortalTitle title="Members" lede={`${users.length} shown${users.length === 200 ? " (first 200 — refine your search)" : ""}`} />
      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-md border border-line bg-coal p-4">
        <label className="min-w-60 flex-1 text-sm">
          <span className="mb-1 block text-ash">Search</span>
          <input name="q" defaultValue={q} placeholder="Name, email or phone" className="field !py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ash">Membership</span>
          <select name="status" defaultValue={status} className="field !py-2">
            <option value="">Any</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired / cancelled</option>
            <option value="NONE">Never paid</option>
          </select>
        </label>
        <button className="h-10 rounded bg-bone px-4 text-sm font-semibold text-pitch">Search</button>
      </form>
      {users.length ? (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-coal text-ash">
              <tr>
                {["Name", "Email", "Phone", "Plan", "Ends", "Status", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const m = u.memberships[0];
                const st = !m ? "NONE" : m.status === "ACTIVE" && m.endsAt > now ? "ACTIVE" : m.status === "CANCELLED" ? "CANCELLED" : "EXPIRED";
                return (
                  <tr key={u.id} className="hover:bg-coal/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/members/${u.id}`} className="text-bone hover:underline">
                        {u.name}
                      </Link>
                      {!u.isActive && <span className="ml-2 text-xs text-danger">disabled</span>}
                    </td>
                    <td className="px-4 py-3 text-ash">{u.email}</td>
                    <td className="px-4 py-3 text-ash">{u.phone}</td>
                    <td className="px-4 py-3 text-ash">{m?.plan.name ?? "—"}</td>
                    <td className="px-4 py-3 text-ash">{m ? date(m.endsAt) : "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={st} />
                    </td>
                    <td className="px-4 py-3 text-ash">{date(u.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No members found" />
      )}
    </div>
  );
}
