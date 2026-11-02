import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Panel, StatusPill } from "@/components/portal/ui";
import { AdminForm, AdminInput, AdminTextarea, AdminCheck, ActionButton } from "@/components/admin/AdminForm";
import { saveContentItem, deleteRecord } from "../../actions";

export const metadata: Metadata = { title: "Inner Circle content" };

type C = Awaited<ReturnType<typeof prisma.contentItem.findMany>>[number];
const kinds = ["VIDEO", "TUTORIAL", "TIP", "CHALLENGE", "ARTICLE", "MOTIVATION"];

function Fields({ c }: { c?: C }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-bone/85">Type</span>
          <select name="kind" defaultValue={c?.kind ?? "VIDEO"} className="field !py-2">
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k.charAt(0) + k.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <AdminInput label="Title" name="title" defaultValue={c?.title} required />
        <AdminInput label="Category (e.g. Strength)" name="category" defaultValue={c?.category} required />
      </div>
      <AdminInput label="Summary" name="summary" defaultValue={c?.summary} required />
      <AdminTextarea label="Body / instructions (optional)" name="body" rows={4} defaultValue={c?.body} />
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminInput
          label="Video URL (MP4)"
          name="videoUrl"
          defaultValue={c?.videoUrl}
          placeholder="https://…"
          hint="Upload to your video storage (e.g. Vercel Blob, S3, Bunny) and paste the URL."
        />
        <AdminInput label="Thumbnail image URL" name="thumbnailUrl" defaultValue={c?.thumbnailUrl} required />
        <AdminInput label="Duration (minutes)" name="durationMin" type="number" defaultValue={c?.durationMin} />
      </div>
      <div className="flex flex-wrap gap-6">
        <AdminCheck label="Free preview for non-members" name="isPreview" defaultChecked={c?.isPreview} />
        <AdminCheck label="Published" name="isPublished" defaultChecked={c?.isPublished ?? true} />
      </div>
    </>
  );
}

export default async function VideosAdmin() {
  await requireAdmin();
  const items = await prisma.contentItem.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-5">
      <Panel title="Add Inner Circle content">
        <AdminForm action={saveContentItem.bind(null, null)} submitLabel="Add content" resetOnSuccess>
          <Fields />
        </AdminForm>
      </Panel>
      {items.map((c) => (
        <details key={c.id} className="rounded-md border border-line bg-coal">
          <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-bone">
            <span className="flex-1">
              {c.title} <span className="text-sm text-ash">— {c.kind.toLowerCase()} · {c.category}</span>
            </span>
            {c.isPreview && <span className="text-xs text-ember">preview</span>}
            <StatusPill status={c.isPublished ? "ACTIVE" : "CLOSED"} />
          </summary>
          <div className="space-y-4 border-t border-line p-4">
            <AdminForm action={saveContentItem.bind(null, c.id)}>
              <Fields c={c} />
            </AdminForm>
            <ActionButton action={deleteRecord.bind(null, "content", c.id)} confirm="Delete this content?" variant="ghost">
              Delete
            </ActionButton>
          </div>
        </details>
      ))}
    </div>
  );
}
