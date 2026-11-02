"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { MealCard, type MealView, type SaveState } from "./MealCard";
import { fitnessGoals } from "@/config/site";

type Meal = MealView & { category: string; goals: string[] };

export const slotLabels: Record<string, string> = {
  BREAKFAST: "Breakfast",
  MID_MORNING: "Mid-morning snack",
  LUNCH: "Lunch",
  EVENING_SNACK: "Evening snack",
  DINNER: "Dinner",
};

const SavedCtx = createContext<ReturnType<typeof useSavedState> | null>(null);

export function SavedProvider({ initial, children }: { initial: string[]; children: ReactNode }) {
  const v = useSavedState(initial);
  return <SavedCtx.Provider value={v}>{children}</SavedCtx.Provider>;
}

function useSaved() {
  const v = useContext(SavedCtx);
  if (!v) throw new Error("SavedProvider missing");
  return v;
}

function useSavedState(initial: string[]) {
  const [saved, setSaved] = useState(() => new Set(initial));
  async function toggle(id: string, next: boolean) {
    const res = await fetch("/api/meals/saved", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId: id }),
    }).catch(() => null);
    if (!res?.ok) return false;
    setSaved((s) => {
      const n = new Set(s);
      if (next) n.add(id);
      else n.delete(id);
      return n;
    });
    return true;
  }
  return { saved, toggle };
}

export function MealSection({
  id,
  title,
  lede,
  meals,
  saveState,
}: {
  id: string;
  title: string;
  lede: string;
  meals: Meal[];
  saveState: SaveState;
}) {
  const { saved, toggle } = useSaved();
  if (!meals.length) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-16 lg:py-24">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2 id={`${id}-title`} className="font-serif text-[clamp(2.2rem,4.4vw,3.6rem)] font-medium leading-[1.05] tracking-tight text-earth [font-variation-settings:'SOFT'_100,'opsz'_144]">
            {title}
          </h2>
          <p className="mt-3 text-lg text-earth/70">{lede}</p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((m) => (
            <li key={m.id}>
              <MealCard meal={m} saved={saved.has(m.id)} saveState={saveState} onToggle={toggle} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Pick a goal → see a full day (one option per slot), swap options, save to plan. */
export function MealPlanner({ meals, saveState }: { meals: Meal[]; saveState: SaveState }) {
  const [goal, setGoal] = useState<string>("MUSCLE_BUILDING");
  const [pick, setPick] = useState<Record<string, number>>({});
  const { saved, toggle } = useSaved();

  const bySlot = useMemo(() => {
    const out: Record<string, Meal[]> = {};
    for (const slot of Object.keys(slotLabels)) {
      const forGoal = meals.filter((m) => m.slot === slot && m.goals.includes(goal));
      out[slot] = forGoal.length ? forGoal : meals.filter((m) => m.slot === slot);
    }
    return out;
  }, [meals, goal]);

  const day = Object.keys(slotLabels)
    .map((slot) => {
      const opts = bySlot[slot];
      return opts.length ? { slot, meal: opts[(pick[slot] ?? 0) % opts.length], count: opts.length } : null;
    })
    .filter(Boolean) as { slot: string; meal: Meal; count: number }[];

  const totals = day.reduce((a, d) => ({ kcal: a.kcal + d.meal.calories, p: a.p + d.meal.proteinG }), { kcal: 0, p: 0 });

  return (
    <div>
      <div role="radiogroup" aria-label="Your goal" className="flex flex-wrap gap-2">
        {fitnessGoals.map((g) => (
          <button
            key={g.value}
            role="radio"
            aria-checked={goal === g.value}
            onClick={() => {
              setGoal(g.value);
              setPick({});
            }}
            className={`h-11 rounded-full px-5 text-sm font-medium transition-colors ${
              goal === g.value ? "bg-sage-deep text-cream" : "bg-white/70 text-earth ring-1 ring-earth/10 hover:ring-sage-deep"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-earth/70">
        A sample day: about <strong className="text-earth">{totals.kcal.toLocaleString("en-IN")} kcal</strong> and{" "}
        <strong className="text-earth">{totals.p} g protein</strong> (approximate). Your real needs depend on your body,
        training and health, so treat this as inspiration, not a prescription.
      </p>

      <ol className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {day.map(({ slot, meal, count }) => (
          <li key={slot} className="flex flex-col">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-serif text-lg italic text-olive">{slotLabels[slot]}</span>
              {count > 1 && (
                <button
                  onClick={() => setPick((p) => ({ ...p, [slot]: (p[slot] ?? 0) + 1 }))}
                  className="text-sm font-medium text-sage-deep underline-offset-4 hover:underline"
                >
                  Swap
                </button>
              )}
            </div>
            <MealCard meal={meal} saved={saved.has(meal.id)} saveState={saveState} onToggle={toggle} />
          </li>
        ))}
      </ol>
      {saveState !== "member" && (
        <p className="mt-8 text-earth/75">
          Members can save meals to a personal plan in <strong>My Nutrition</strong>.{" "}
          <Link href={saveState === "guest" ? "/join" : "/my-fitness/renew"} className="font-medium text-sage-deep underline">
            {saveState === "guest" ? "Become a member" : "Renew membership"}
          </Link>
        </p>
      )}
    </div>
  );
}
