"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cycles, inr, type Cycle } from "@/lib/format";
import { buttonClass } from "@/components/ui/Button";
import type { PublicPlan } from "@/lib/plans";

export function PlanTable({
  plans,
  placeholderPricing,
  joinBase = "/join",
}: {
  plans: PublicPlan[];
  placeholderPricing: boolean;
  joinBase?: string;
}) {
  const available = cycles.filter((c) => plans.some((p) => p.prices.some((x) => x.cycle === c.value)));
  const [cycle, setCycle] = useState<Cycle>(available[0]?.value ?? "MONTHLY");

  if (plans.length === 0) {
    return (
      <p className="rounded-md border border-line p-8 text-ash">
        Membership plans are being updated. <Link className="text-ember underline" href="/consultation?intent=PLAN_ENQUIRY">Ask us about pricing</Link>.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full border border-line p-1">
          {available.map((c) => (
            <button
              key={c.value}
              role="radio"
              aria-checked={cycle === c.value}
              onClick={() => setCycle(c.value)}
              className={`h-10 rounded-full px-4 text-sm font-medium transition-colors sm:px-5 ${
                cycle === c.value ? "bg-bone text-pitch" : "text-ash hover:text-bone"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {placeholderPricing && (
          <p className="text-sm text-ember/90">Sample pricing. Final prices will be confirmed by the gym.</p>
        )}
      </div>

      <div className="mt-8 grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
        {plans.map((p, i) => {
          const price = p.prices.find((x) => x.cycle === cycle);
          const monthly = p.prices.find((x) => x.cycle === "MONTHLY");
          const months = cycles.find((c) => c.value === cycle)!.months;
          const saving =
            price && monthly && months > 1 ? monthly.amountPaise * months - price.amountPaise : 0;

          return (
            <article
              key={p.id}
              className={`relative flex flex-col p-7 sm:p-9 ${p.isFeatured ? "bg-iron" : "bg-coal"}`}
            >
              {p.isFeatured && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-furnace" />}
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-display text-lg font-bold text-ash">Plan 0{i + 1}</span>
                {p.isFeatured && <span className="text-sm font-medium text-ember">Most chosen</span>}
              </div>
              <h3 className="display mt-3 text-[2.6rem] text-bone">{p.name}</h3>
              <p className="mt-2 text-ash">{p.tagline}</p>

              <div className="mt-8 min-h-[5.5rem]">
                {price ? (
                  <>
                    <p className="flex items-baseline gap-2">
                      <span className="font-display text-[3.4rem] font-extrabold leading-none text-bone">
                        {inr(price.amountPaise)}
                      </span>
                      <span className="text-ash">{cycles.find((c) => c.value === cycle)!.short}</span>
                    </p>
                    <p className="mt-2 text-sm text-ash">
                      {price.durationDays} days of access
                      {saving > 0 && <span className="text-ember"> · save {inr(saving)} vs monthly</span>}
                    </p>
                  </>
                ) : (
                  <p className="text-ash">Not offered for this billing period.</p>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-bone/85">
                    <Check size={18} className="mt-1 shrink-0 text-furnace" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-2 pt-10">
                {price ? (
                  <Link
                    href={`${joinBase}?plan=${p.slug}&cycle=${cycle}`}
                    className={buttonClass(p.isFeatured ? "primary" : "outline", "md", "w-full")}
                  >
                    Subscribe to {p.name}
                  </Link>
                ) : null}
                <Link
                  href={`/consultation?intent=PLAN_ENQUIRY&plan=${p.slug}`}
                  className="py-2 text-center text-sm text-ash underline-offset-4 hover:text-bone hover:underline"
                >
                  Know more about this plan
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
