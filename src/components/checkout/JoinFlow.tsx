"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Check, Loader2, Lock } from "lucide-react";
import type { PublicPlan } from "@/lib/plans";
import { cycles, inr, date, type Cycle } from "@/lib/format";
import { fitnessGoals } from "@/config/site";
import { signupSchema, fieldErrors } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/forms/Field";
import { useCheckout } from "./useCheckout";

type Current = { planSlug: string; planName: string; endsAt: string } | null;

export function JoinFlow({
  plans,
  initialPlan,
  initialCycle,
  loggedIn,
  current,
  placeholderPricing,
  mode = "join",
}: {
  plans: PublicPlan[];
  initialPlan?: string;
  initialCycle?: string;
  loggedIn: boolean;
  current: Current;
  placeholderPricing: boolean;
  mode?: "join" | "renew";
}) {
  const router = useRouter();
  const [planSlug, setPlanSlug] = useState(plans.find((p) => p.slug === initialPlan)?.slug ?? current?.planSlug ?? plans[0]?.slug);
  const [cycle, setCycle] = useState<Cycle>((cycles.find((c) => c.value === initialCycle)?.value as Cycle) ?? "MONTHLY");
  const [step, setStep] = useState<"plan" | "details" | "review">(initialPlan ? (loggedIn ? "review" : "details") : "plan");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { pay, status, error: payError } = useCheckout();

  const plan = plans.find((p) => p.slug === planSlug);
  const price = plan?.prices.find((x) => x.cycle === cycle) ?? plan?.prices[0];
  const effectiveCycle = (price?.cycle as Cycle) ?? cycle;

  const steps = loggedIn ? (["plan", "review"] as const) : (["plan", "details", "review"] as const);
  const stepLabel = { plan: "Choose plan", details: "Your details", review: "Review & pay" };

  const projected = useMemo(() => {
    if (!price) return null;
    const sameActive = current && current.planSlug === planSlug && new Date(current.endsAt) > new Date();
    const start = sameActive ? new Date(current!.endsAt) : new Date();
    return { start, end: new Date(start.getTime() + price.durationDays * 86_400_000), stacked: !!sameActive };
  }, [price, current, planSlug]);

  async function submitDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      password: fd.get("password"),
      goal: fd.get("goal"),
      planSlug,
      cycle: effectiveCycle,
      acceptTerms: fd.get("acceptTerms") === "on",
      marketingOptIn: fd.get("marketingOptIn") === "on",
    };
    const parsed = signupSchema.safeParse(payload);
    if (!parsed.success) {
      const f = fieldErrors(parsed.error);
      setErrors(f);
      document.getElementById(`join-${Object.keys(f)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setFormError(json.error ?? "Couldn't create your account.");
        return;
      }
      const login = await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirect: false });
      if (login?.error) {
        setFormError("Account created, but we couldn't log you in. Please log in to finish payment.");
        return;
      }
      router.refresh();
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPending(false);
    }
  }

  if (!plans.length) {
    return <p className="text-ash">No plans are available right now. Please contact us.</p>;
  }

  const err = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `join-${k}-error` } : {});

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <ol className="mb-10 flex gap-6 text-sm" aria-label="Progress">
          {steps.map((s, i) => {
            const idx = steps.indexOf(step as never);
            const state = i < idx ? "done" : i === idx ? "current" : "todo";
            return (
              <li key={s} aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full font-display font-bold ${
                    state === "current" ? "bg-furnace text-pitch" : state === "done" ? "bg-bone text-pitch" : "border border-line text-ash"
                  }`}
                >
                  {state === "done" ? <Check size={14} /> : i + 1}
                </span>
                <span className={state === "todo" ? "text-ash" : "text-bone"}>{stepLabel[s]}</span>
              </li>
            );
          })}
        </ol>

        {step === "plan" && (
          <div>
            <h2 className="display text-[2.4rem] text-bone">Choose your plan</h2>
            <div role="radiogroup" aria-label="Billing period" className="mt-6 inline-flex flex-wrap rounded-full border border-line p-1">
              {cycles.map((c) => (
                <button
                  key={c.value}
                  role="radio"
                  aria-checked={cycle === c.value}
                  onClick={() => setCycle(c.value)}
                  className={`h-10 rounded-full px-4 text-sm ${cycle === c.value ? "bg-bone text-pitch" : "text-ash hover:text-bone"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Plan" className="mt-6 grid gap-3">
              {plans.map((p) => {
                const pr = p.prices.find((x) => x.cycle === cycle);
                const selected = p.slug === planSlug;
                return (
                  <button
                    key={p.id}
                    role="radio"
                    aria-checked={selected}
                    disabled={!pr}
                    onClick={() => setPlanSlug(p.slug)}
                    className={`flex flex-col gap-2 rounded-md border p-5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${
                      selected ? "border-furnace bg-iron" : "border-line bg-coal hover:border-ash"
                    } disabled:opacity-40`}
                  >
                    <span>
                      <span className="block font-display text-2xl font-bold uppercase text-bone">{p.name}</span>
                      <span className="text-sm text-ash">{p.tagline}</span>
                    </span>
                    <span className="font-display text-2xl font-bold text-bone">{pr ? inr(pr.amountPaise) : "—"}</span>
                  </button>
                );
              })}
            </div>
            <Button className="mt-8" size="lg" onClick={() => setStep(loggedIn ? "review" : "details")} disabled={!price}>
              Continue
            </Button>
          </div>
        )}

        {step === "details" && (
          <form onSubmit={submitDetails} noValidate className="space-y-5">
            <h2 className="display text-[2.4rem] text-bone">Create your account</h2>
            <p className="text-ash">
              Already a member?{" "}
              <Link href={`/login?callbackUrl=${encodeURIComponent(`/join?plan=${planSlug}&cycle=${effectiveCycle}`)}`} className="text-ember underline">
                Log in
              </Link>
            </p>
            <FormError message={formError} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="join-name" label="Full name" error={errors.name}>
                <input id="join-name" name="name" autoComplete="name" className="field" {...err("name")} />
              </Field>
              <Field id="join-phone" label="Mobile number" error={errors.phone}>
                <input id="join-phone" name="phone" type="tel" autoComplete="tel" className="field" {...err("phone")} />
              </Field>
            </div>
            <Field id="join-email" label="Email" error={errors.email}>
              <input id="join-email" name="email" type="email" autoComplete="email" className="field" {...err("email")} />
            </Field>
            <Field id="join-password" label="Create a password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
              <input id="join-password" name="password" type="password" autoComplete="new-password" className="field" {...err("password")} />
            </Field>
            <Field id="join-goal" label="Main goal" optional>
              <select id="join-goal" name="goal" defaultValue="" className="field">
                <option value="">Choose a goal</option>
                {fitnessGoals.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-start gap-3 text-sm text-bone/80">
              <input id="join-acceptTerms" name="acceptTerms" type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--color-furnace)]" {...err("acceptTerms")} />
              <span>
                I accept the{" "}
                <Link href="/terms" target="_blank" className="underline">
                  membership terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="underline">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            {errors.acceptTerms && (
              <p id="join-acceptTerms-error" role="alert" className="text-sm text-danger">
                {errors.acceptTerms}
              </p>
            )}
            <label className="flex items-start gap-3 text-sm text-bone/80">
              <input name="marketingOptIn" type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--color-furnace)]" />
              <span>Send me training tips and offers (optional, unsubscribe any time).</span>
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg" disabled={pending}>
                {pending && <Loader2 className="animate-spin" size={18} />}
                {pending ? "Creating account…" : "Continue to review"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep("plan")}>
                Back
              </Button>
            </div>
          </form>
        )}

        {step === "review" && plan && price && projected && (
          <div>
            <h2 className="display text-[2.4rem] text-bone">Review and pay</h2>
            <dl className="mt-6 divide-y divide-line rounded-md border border-line bg-coal">
              {[
                ["Plan", plan.name],
                ["Billing period", cycles.find((c) => c.value === price.cycle)!.label],
                ["Access", `${price.durationDays} days`],
                [projected.stacked ? "Extends your membership to" : "Membership runs", projected.stacked ? date(projected.end) : `${date(projected.start)} – ${date(projected.end)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-4">
                  <dt className="text-ash">{k}</dt>
                  <dd className="text-right text-bone">{v}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 px-5 py-5">
                <dt className="font-semibold text-bone">Total to pay</dt>
                <dd className="font-display text-4xl font-extrabold text-bone">{inr(price.amountPaise)}</dd>
              </div>
            </dl>
            {current && current.planSlug !== planSlug && new Date(current.endsAt) > new Date() && (
              <p className="mt-4 rounded-md border border-ember/40 p-4 text-sm text-ember">
                You currently have {current.planName} until {date(current.endsAt)}. Paying for {plan.name} switches you to the
                new plan today. Talk to the front desk first if you&apos;d rather wait until your current plan ends.
              </p>
            )}
            {placeholderPricing && <p className="mt-4 text-sm text-ember/90">Sample pricing during setup. Use Razorpay test mode only.</p>}
            <FormError message={payError} />
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" onClick={() => pay(price.id)} disabled={status !== "idle"}>
                {status !== "idle" && <Loader2 className="animate-spin" size={18} />}
                {status === "verifying" ? "Confirming payment…" : status === "idle" ? `Pay ${inr(price.amountPaise)}` : "Opening secure checkout…"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("plan")}>
                Change plan
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-ash">
              <Lock size={14} aria-hidden /> Secure payment by Razorpay: UPI, cards, net banking and wallets. We never see or store
              your card or UPI details.
            </p>
          </div>
        )}
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-24 rounded-md border border-line bg-coal p-6">
          <p className="text-sm text-ash">{mode === "renew" ? "Renewing" : "You're joining"}</p>
          <p className="mt-1 font-display text-3xl font-extrabold uppercase text-bone">{plan?.name}</p>
          {price && (
            <p className="mt-2 text-bone">
              {inr(price.amountPaise)} <span className="text-ash">{cycles.find((c) => c.value === price.cycle)?.short}</span>
            </p>
          )}
          <ul className="mt-5 space-y-2 text-sm text-bone/80">
            {plan?.features.map((f) => (
              <li key={f} className="flex gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-furnace" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
