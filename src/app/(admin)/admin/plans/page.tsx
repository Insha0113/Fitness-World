import type { Metadata } from "next";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortalTitle, Panel } from "@/components/portal/ui";
import { AdminForm, AdminInput, AdminTextarea, AdminCheck } from "@/components/admin/AdminForm";
import { savePlan } from "../actions";
import { cycles } from "@/lib/format";

export const metadata: Metadata = { title: "Plans" };

type PlanWithPrices = Awaited<ReturnType<typeof load>>[number];
const load = () =>
  prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" }, include: { prices: true } });

function PlanFields({ p }: { p?: PlanWithPrices }) {
  const price = (c: string) => {
    const x = p?.prices.find((y) => y.cycle === c && y.isActive);
    return x ? x.amountPaise / 100 : "";
  };
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminInput label="Name" name="name" defaultValue={p?.name} required />
        <AdminInput label="Slug (used in URLs)" name="slug" defaultValue={p?.slug} required />
        <AdminInput label="Sort order" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} />
      </div>
      <AdminInput label="Tagline" name="tagline" defaultValue={p?.tagline} required />
      <AdminTextarea label="Features (one per line)" name="features" rows={5} defaultValue={p?.features.join("\n")} />
      <fieldset>
        <legend className="mb-2 text-sm text-bone/85">Prices in ₹ (leave blank to not offer that period)</legend>
        <div className="grid gap-4 sm:grid-cols-4">
          {cycles.map((c) => (
            <AdminInput key={c.value} label={c.label} name={`price_${c.value}`} type="number" defaultValue={price(c.value)} />
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-6">
        <AdminCheck label="Enabled (visible and purchasable)" name="isActive" defaultChecked={p?.isActive ?? true} />
        <AdminCheck label="Featured" name="isFeatured" defaultChecked={p?.isFeatured} />
        <AdminCheck label="Includes personal training" name="includesPersonalTraining" defaultChecked={p?.includesPersonalTraining} />
      </div>
    </>
  );
}

export default async function PlansAdmin() {
  await requireAdmin();
  const plans = await load();
  return (
    <div className="space-y-5">
      <PortalTitle
        title="Membership plans"
        lede="Price changes apply to new payments only. Past payments keep the price they were made at."
      />
      {plans.map((p) => (
        <Panel key={p.id} title={`${p.name}${p.isActive ? "" : " (disabled)"}`}>
          <AdminForm action={savePlan.bind(null, p.id)} submitLabel="Save plan">
            <PlanFields p={p} />
          </AdminForm>
        </Panel>
      ))}
      <Panel title="Create a new plan">
        <AdminForm action={savePlan.bind(null, null)} submitLabel="Create plan" resetOnSuccess>
          <PlanFields />
        </AdminForm>
      </Panel>
    </div>
  );
}
