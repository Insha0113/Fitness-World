import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Panel, StatusPill } from "@/components/portal/ui";
import { AdminForm, AdminInput, AdminTextarea, AdminCheck, ActionButton } from "@/components/admin/AdminForm";
import { saveTestimonial, deleteRecord } from "../../actions";

export const metadata: Metadata = { title: "Testimonials" };

type T = Awaited<ReturnType<typeof prisma.testimonial.findMany>>[number];

function Fields({ t }: { t?: T }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminInput label="Client name (as they agreed to be shown)" name="clientName" defaultValue={t?.clientName} required />
        <AdminInput label="Program" name="program" defaultValue={t?.program} />
        <AdminInput label="Journey length (e.g. 6 months)" name="durationLabel" defaultValue={t?.durationLabel} />
      </div>
      <AdminTextarea label="Quote" name="quote" defaultValue={t?.quote} />
      <AdminTextarea label="Story (optional)" name="story" rows={4} defaultValue={t?.story} />
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminInput label="Before photo URL" name="beforeImage" defaultValue={t?.beforeImage} placeholder="https://…" />
        <AdminInput label="After photo URL" name="afterImage" defaultValue={t?.afterImage} placeholder="https://…" />
        <AdminInput label="Sort order" name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} />
      </div>
      <div className="flex flex-wrap gap-6">
        <AdminCheck label="Client gave written consent to publish (name, story and photos)" name="consentGiven" defaultChecked={t?.consentGiven} />
        <AdminCheck label="Sample content (shown with a 'sample' label)" name="isSample" defaultChecked={t?.isSample} />
        <AdminCheck label="Published" name="isPublished" defaultChecked={t?.isPublished} />
      </div>
    </>
  );
}

export default async function TestimonialsAdmin() {
  await requireAdmin();
  const items = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-5">
      <Panel title="Add a testimonial or transformation story">
        <p className="mb-4 text-sm text-ash">
          Real stories can only be published once consent is recorded. Host photos on your own storage or CDN and paste the
          URL (Unsplash URLs display optimised).
        </p>
        <AdminForm action={saveTestimonial.bind(null, null)} submitLabel="Add story" resetOnSuccess>
          <Fields />
        </AdminForm>
      </Panel>
      {items.map((t) => (
        <details key={t.id} className="rounded-md border border-line bg-coal">
          <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-bone">
            <span className="flex-1">
              {t.clientName} <span className="text-sm text-ash">— {t.quote.slice(0, 70)}…</span>
            </span>
            {t.isSample && <span className="text-xs text-ember">sample</span>}
            <StatusPill status={t.isPublished ? "ACTIVE" : "CLOSED"} />
          </summary>
          <div className="space-y-4 border-t border-line p-4">
            <AdminForm action={saveTestimonial.bind(null, t.id)}>
              <Fields t={t} />
            </AdminForm>
            <ActionButton action={deleteRecord.bind(null, "testimonial", t.id)} confirm="Delete this story permanently?" variant="ghost">
              Delete
            </ActionButton>
          </div>
        </details>
      ))}
    </div>
  );
}
