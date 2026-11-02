import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Panel, StatusPill } from "@/components/portal/ui";
import { AdminForm, AdminInput, AdminTextarea, AdminCheck, ActionButton } from "@/components/admin/AdminForm";
import { saveMeal, deleteRecord } from "../../actions";
import { fitnessGoals } from "@/config/site";

export const metadata: Metadata = { title: "Meals" };

type M = Awaited<ReturnType<typeof prisma.meal.findMany>>[number];
const slots = [
  ["BREAKFAST", "Breakfast"],
  ["MID_MORNING", "Mid-morning snack"],
  ["LUNCH", "Lunch"],
  ["EVENING_SNACK", "Evening snack"],
  ["DINNER", "Dinner"],
];
const categories = ["breakfast", "protein", "muscle", "weight-loss", "snacks"];

function Fields({ m }: { m?: M }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <AdminInput label="Name" name="name" defaultValue={m?.name} required />
        <AdminInput label="Slug" name="slug" defaultValue={m?.slug} required />
        <label className="block text-sm">
          <span className="mb-1 block text-bone/85">Meal slot</span>
          <select name="slot" defaultValue={m?.slot ?? "LUNCH"} className="field !py-2">
            {slots.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-bone/85">Fuel Studio section</span>
          <select name="category" defaultValue={m?.category ?? "protein"} className="field !py-2">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <AdminInput label="Description" name="description" defaultValue={m?.description} required />
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminInput label="Image URL" name="imageUrl" defaultValue={m?.imageUrl} required />
        <AdminInput label="Calories (kcal)" name="calories" type="number" defaultValue={m?.calories} required />
        <AdminInput label="Protein (g)" name="proteinG" type="number" defaultValue={m?.proteinG} required />
      </div>
      <AdminTextarea label="Ingredients (one per line)" name="ingredients" rows={4} defaultValue={m?.ingredients.join("\n")} />
      <fieldset>
        <legend className="mb-2 text-sm text-bone/85">Suits goals</legend>
        <div className="flex flex-wrap gap-4">
          {fitnessGoals.map((g) => (
            <label key={g.value} className="flex items-center gap-2 text-sm text-bone/85">
              <input type="checkbox" name="goals" value={g.value} defaultChecked={m?.goals.includes(g.value)} className="h-4 w-4 accent-[var(--color-furnace)]" />
              {g.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-6">
        <AdminCheck label="Nutrition values verified by a qualified professional" name="isVerified" defaultChecked={m?.isVerified} />
        <AdminCheck label="Published" name="isPublished" defaultChecked={m?.isPublished ?? true} />
      </div>
    </>
  );
}

export default async function MealsAdmin() {
  await requireAdmin();
  const meals = await prisma.meal.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  return (
    <div className="space-y-5">
      <Panel title="Add a meal">
        <p className="mb-4 text-sm text-ash">Unverified values are labelled “approx.” on the site.</p>
        <AdminForm action={saveMeal.bind(null, null)} submitLabel="Add meal" resetOnSuccess>
          <Fields />
        </AdminForm>
      </Panel>
      {meals.map((m) => (
        <details key={m.id} className="rounded-md border border-line bg-coal">
          <summary className="flex cursor-pointer items-center gap-3 p-4 text-bone">
            <span className="flex-1">
              {m.name} <span className="text-sm text-ash">— {m.category} · {m.calories} kcal</span>
            </span>
            <StatusPill status={m.isPublished ? "ACTIVE" : "CLOSED"} />
          </summary>
          <div className="space-y-4 border-t border-line p-4">
            <AdminForm action={saveMeal.bind(null, m.id)}>
              <Fields m={m} />
            </AdminForm>
            <ActionButton action={deleteRecord.bind(null, "meal", m.id)} confirm="Delete this meal? Members who saved it will lose it." variant="ghost">
              Delete
            </ActionButton>
          </div>
        </details>
      ))}
    </div>
  );
}
