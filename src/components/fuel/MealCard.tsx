"use client";

import Image from "next/image";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { img } from "@/config/media";

export type MealView = {
  id: string;
  name: string;
  slot: string;
  description: string;
  imageUrl: string;
  calories: number;
  proteinG: number;
  ingredients: string[];
  isVerified: boolean;
};

export type SaveState = "member" | "guest" | "inactive";

export function MealCard({
  meal,
  saved,
  saveState,
  onToggle,
}: {
  meal: MealView;
  saved: boolean;
  saveState: SaveState;
  onToggle: (id: string, next: boolean) => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function toggle() {
    if (saveState === "guest") return setHint("Log in as a member to save meals to your plan.");
    if (saveState === "inactive") return setHint("Renew your membership to save meals.");
    setBusy(true);
    const ok = await onToggle(meal.id, !saved);
    setBusy(false);
    if (!ok) setHint("Couldn't update your plan. Try again.");
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white/70 shadow-[0_1px_0_rgba(74,58,44,.06)] ring-1 ring-earth/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={img(meal.imageUrl, 900)}
          alt={meal.name}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${meal.name} from my plan` : `Save ${meal.name} to my plan`}
          className={`absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full backdrop-blur transition-colors ${
            saved ? "bg-sage-deep text-cream" : "bg-cream/85 text-earth hover:bg-cream"
          }`}
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-[1.55rem] font-medium leading-tight text-earth [font-variation-settings:'SOFT'_100]">
          {meal.name}
        </h3>
        <p className="mt-2 text-[0.95rem] text-earth/70">{meal.description}</p>
        <dl className="mt-4 flex gap-6 text-sm">
          <div>
            <dt className="text-earth/55">{meal.isVerified ? "Calories" : "Approx. calories"}</dt>
            <dd className="font-semibold text-earth">{meal.calories} kcal</dd>
          </div>
          <div>
            <dt className="text-earth/55">{meal.isVerified ? "Protein" : "Approx. protein"}</dt>
            <dd className="font-semibold text-earth">{meal.proteinG} g</dd>
          </div>
        </dl>
        <details className="mt-4 text-sm text-earth/75">
          <summary className="cursor-pointer font-medium text-sage-deep">Ingredients</summary>
          <p className="mt-2">{meal.ingredients.join(", ")}</p>
        </details>
        {hint && (
          <p role="status" className="mt-3 text-sm text-olive">
            {hint}{" "}
            {saveState === "guest" && (
              <a href="/login?callbackUrl=/fuel-studio" className="underline">
                Log in
              </a>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
