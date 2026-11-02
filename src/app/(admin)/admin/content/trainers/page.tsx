import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Panel } from "@/components/portal/ui";
import { AdminForm, AdminInput, AdminTextarea, ActionButton } from "@/components/admin/AdminForm";
import { saveTrainer, deleteRecord } from "../../actions";

export const metadata: Metadata = { title: "Trainers" };

export default async function TrainersAdmin() {
  await requireAdmin();
  const trainers = await prisma.trainer.findMany({ where: { isActive: true }, include: { _count: { select: { members: true } } }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-5">
      <Panel title="Add a trainer">
        <p className="mb-4 text-sm text-ash">Trainers can be assigned to members from each member&apos;s page. Members see the name, specialty and bio.</p>
        <AdminForm action={saveTrainer} submitLabel="Add trainer" resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput label="Name" name="name" required />
            <AdminInput label="Specialty" name="specialty" required />
          </div>
          <AdminTextarea label="Short bio" name="bio" />
        </AdminForm>
      </Panel>
      <Panel title="Team">
        {trainers.length ? (
          <ul className="divide-y divide-line">
            {trainers.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-bone">{t.name}</p>
                  <p className="text-sm text-ash">
                    {t.specialty} · {t._count.members} member(s)
                  </p>
                </div>
                <ActionButton action={deleteRecord.bind(null, "trainer", t.id)} confirm={`Remove ${t.name} from the team?`} variant="ghost">
                  Remove
                </ActionButton>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ash">No trainers yet.</p>
        )}
      </Panel>
    </div>
  );
}
