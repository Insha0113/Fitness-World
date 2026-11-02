import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PortalTitle, Panel, MembersOnly, Empty } from "@/components/portal/ui";
import { RemoveMealButton } from "@/components/portal/forms";
import { buttonClass } from "@/components/ui/Button";
import { img } from "@/config/media";

export const metadata: Metadata = { title: "My nutrition" };

const slots = [
  ["BREAKFAST", "Breakfast"],
  ["MID_MORNING", "Mid-morning snack"],
  ["LUNCH", "Lunch"],
  ["EVENING_SNACK", "Evening snack"],
  ["DINNER", "Dinner"],
] as const;

export default async function NutritionPage() {
  const { session, user } = await requireUser("/my-fitness/nutrition");
  if (session.user.membershipStatus !== "ACTIVE") {
    return (
      <div>
        <PortalTitle title="My nutrition" />
        <MembersOnly what="Your nutrition plan" />
      </div>
    );
  }
  const saved = await prisma.savedMeal.findMany({ where: { userId: user.id }, include: { meal: true }, orderBy: { createdAt: "asc" } });
  const total = (key: "calories" | "proteinG") =>
    slots.reduce((sum, [s]) => sum + (saved.find((x) => x.slot === s)?.meal[key] ?? 0), 0);

  return (
    <div className="space-y-5">
      <PortalTitle
        title="My nutrition"
        lede="Meals you saved from the Fuel Studio, grouped by time of day."
        action={
          <Link href="/fuel-studio#planner" className={buttonClass("outline", "md")}>
            Find more meals
          </Link>
        }
      />
      {saved.length === 0 ? (
        <Empty title="Your plan is empty">
          Browse the{" "}
          <Link href="/fuel-studio" className="text-ember underline">
            Fuel Studio
          </Link>{" "}
          and tap the bookmark on any meal to save it here.
        </Empty>
      ) : (
        <>
          <p className="text-sm text-ash">
            One of each slot comes to roughly {total("calories")} kcal and {total("proteinG")} g protein. Values are
            approximate. This is general guidance, not medical or dietetic advice.
          </p>
          {slots.map(([slot, label]) => {
            const items = saved.filter((s) => s.slot === slot);
            if (!items.length) return null;
            return (
              <Panel key={slot} title={label}>
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map(({ meal }) => (
                    <li key={meal.id} className="flex gap-4 rounded border border-line p-3">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded">
                        <Image src={img(meal.imageUrl, 300)} alt="" fill sizes="96px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-bone">{meal.name}</p>
                        <p className="text-sm text-ash">
                          ~{meal.calories} kcal · ~{meal.proteinG} g protein
                        </p>
                        <RemoveMealButton mealId={meal.id} name={meal.name} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            );
          })}
        </>
      )}
    </div>
  );
}
