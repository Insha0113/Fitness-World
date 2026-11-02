import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortalTitle, Panel, StatusPill } from "@/components/portal/ui";
import { AdminForm, ActionButton, AdminTextarea } from "@/components/admin/AdminForm";
import { updateLeadStatus, addLeadNote } from "../../actions";
import { intentLabel } from "@/lib/leads";
import { programs } from "@/config/content";
import { date } from "@/lib/format";
import { WhatsAppGlyph } from "@/components/site/WhatsAppButton";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadDetail({ params }: PageProps<"/admin/leads/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } } },
  });
  if (!lead) notFound();
  const waNumber = lead.phone.replace(/\D/g, "");

  const rows: [string, string | null][] = [
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Source", intentLabel[lead.intent]],
    ["Interested in", programs.find((p) => p.slug === lead.program)?.name ?? lead.program],
    ["Plan", lead.planSlug],
    ["Goal", lead.goal?.replace(/_/g, " ").toLowerCase() ?? null],
    ["Best time to call", lead.contactTime?.toLowerCase() ?? null],
    ["Submitted from", lead.sourcePath],
    ["Received", date(lead.createdAt)],
    ["Consent recorded", date(lead.consentAt)],
  ];

  return (
    <div className="space-y-5">
      <Link href="/admin/leads" className="text-sm text-ash hover:text-bone">
        ← All leads
      </Link>
      <PortalTitle title={lead.name} action={<StatusPill status={lead.status} />} />
      <div className="flex flex-wrap gap-2">
        <a href={`tel:${lead.phone}`} className="inline-flex h-9 items-center rounded border border-line px-4 text-sm text-bone hover:border-ash">
          Call
        </a>
        <a
          href={`https://wa.me/${waNumber.length === 10 ? `91${waNumber}` : waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded border border-line px-4 text-sm text-bone hover:border-ash"
        >
          <WhatsAppGlyph className="h-4 w-4 text-[#1fa855]" /> WhatsApp
        </a>
        {lead.status !== "CONTACTED" && <ActionButton action={updateLeadStatus.bind(null, lead.id, "CONTACTED")}>Mark contacted</ActionButton>}
        {lead.status !== "CONVERTED" && <ActionButton action={updateLeadStatus.bind(null, lead.id, "CONVERTED")} variant="primary">Mark converted</ActionButton>}
        {lead.status !== "CLOSED" && <ActionButton action={updateLeadStatus.bind(null, lead.id, "CLOSED")} variant="ghost">Close</ActionButton>}
        {lead.status !== "NEW" && <ActionButton action={updateLeadStatus.bind(null, lead.id, "NEW")} variant="ghost">Reopen</ActionButton>}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Details">
          <dl className="divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-ash">{k}</dt>
                <dd className="text-right text-bone">{v ?? "—"}</dd>
              </div>
            ))}
          </dl>
          {lead.message && (
            <div className="mt-4">
              <p className="text-sm text-ash">Message</p>
              <p className="mt-1 whitespace-pre-line text-bone">{lead.message}</p>
            </div>
          )}
        </Panel>
        <Panel title="Internal notes">
          <AdminForm action={addLeadNote.bind(null, lead.id)} submitLabel="Add note" resetOnSuccess>
            <AdminTextarea label="New note (visible to admins only)" name="body" rows={3} />
          </AdminForm>
          <ul className="mt-6 space-y-4">
            {lead.notes.map((n) => (
              <li key={n.id} className="border-l-2 border-line pl-3">
                <p className="whitespace-pre-line text-sm text-bone">{n.body}</p>
                <p className="text-xs text-ash">
                  {n.author?.name ?? "Admin"} · {date(n.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
