import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Panel, StatusPill } from "@/components/portal/ui";
import { AdminForm, AdminInput, AdminTextarea, AdminCheck, ActionButton } from "@/components/admin/AdminForm";
import { saveAnnouncement, deleteRecord } from "../../actions";
import { date } from "@/lib/format";

export const metadata: Metadata = { title: "Announcements" };

export default async function AnnouncementsAdmin() {
  await requireAdmin();
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-5">
      <Panel title="Publish an announcement">
        <p className="mb-4 text-sm text-ash">Shown to active members on My Fitness and The Inner Circle.</p>
        <AdminForm action={saveAnnouncement.bind(null, null)} submitLabel="Publish" resetOnSuccess>
          <AdminInput label="Title" name="title" required />
          <AdminTextarea label="Message" name="body" rows={4} />
          <div className="flex gap-6">
            <AdminCheck label="Pin to top" name="isPinned" />
            <AdminCheck label="Published" name="isPublished" defaultChecked />
          </div>
        </AdminForm>
      </Panel>
      {items.map((a) => (
        <details key={a.id} className="rounded-md border border-line bg-coal">
          <summary className="flex cursor-pointer items-center gap-3 p-4 text-bone">
            <span className="flex-1">
              {a.title} <span className="text-sm text-ash">— {date(a.createdAt)}</span>
            </span>
            {a.isPinned && <span className="text-xs text-ember">pinned</span>}
            <StatusPill status={a.isPublished ? "ACTIVE" : "CLOSED"} />
          </summary>
          <div className="space-y-4 border-t border-line p-4">
            <AdminForm action={saveAnnouncement.bind(null, a.id)}>
              <AdminInput label="Title" name="title" defaultValue={a.title} required />
              <AdminTextarea label="Message" name="body" rows={4} defaultValue={a.body} />
              <div className="flex gap-6">
                <AdminCheck label="Pin to top" name="isPinned" defaultChecked={a.isPinned} />
                <AdminCheck label="Published" name="isPublished" defaultChecked={a.isPublished} />
              </div>
            </AdminForm>
            <ActionButton action={deleteRecord.bind(null, "announcement", a.id)} confirm="Delete this announcement?" variant="ghost">
              Delete
            </ActionButton>
          </div>
        </details>
      ))}
    </div>
  );
}
