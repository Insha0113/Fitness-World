"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { fitnessGoals, contactTimes, whatsappLink } from "@/config/site";
import { programs } from "@/config/content";
import { leadSchema, fieldErrors } from "@/lib/validation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, FormError } from "./Field";

type Props = {
  intent?: string;
  program?: string;
  planSlug?: string;
  planOptions?: { slug: string; name: string }[];
  submitLabel?: string;
  showMessage?: boolean;
};

export function LeadForm({
  intent = "CONSULTATION",
  program = "",
  planSlug = "",
  planOptions = [],
  submitLabel = "Book my free consultation",
  showMessage = true,
}: Props) {
  const pathname = usePathname();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ name: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(fd.entries()),
      consent: fd.get("consent") === "on",
      intent,
      sourcePath: pathname,
    };

    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const f = fieldErrors(parsed.error);
      setErrors(f);
      document.getElementById(`lead-${Object.keys(f)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setFormError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone({ name: parsed.data.name.split(" ")[0] });
    } catch {
      setFormError("You appear to be offline. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    const wa = whatsappLink();
    return (
      <div role="status" className="rounded-lg border border-success/30 bg-success/5 p-8">
        <CheckCircle2 className="text-success" size={36} aria-hidden />
        <h2 className="display mt-4 text-[2.6rem] text-bone">Request received, {done.name}.</h2>
        <p className="mt-3 max-w-[50ch] text-bone/80">
          Our team will call you at your preferred time, usually within one working day. Want to talk sooner?
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center rounded bg-[#1fa855] px-5 font-semibold text-white">
              Message us on WhatsApp
            </a>
          )}
          <ButtonLink href="/memberships" variant="outline">
            Browse memberships
          </ButtonLink>
        </div>
      </div>
    );
  }

  const err = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `lead-${k}-error` } : {});

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="lead-name" label="Full name" error={errors.name}>
          <input id="lead-name" name="name" autoComplete="name" className="field" {...err("name")} />
        </Field>
        <Field id="lead-phone" label="Mobile number" error={errors.phone}>
          <input id="lead-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" {...err("phone")} />
        </Field>
      </div>
      <Field id="lead-email" label="Email address" optional error={errors.email}>
        <input id="lead-email" name="email" type="email" autoComplete="email" className="field" {...err("email")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="lead-program" label="Interested in" optional error={errors.program}>
          <select id="lead-program" name="program" defaultValue={program} className="field">
            <option value="">Not sure yet</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="lead-goal" label="Fitness goal" optional error={errors.goal}>
          <select id="lead-goal" name="goal" defaultValue="" className="field">
            <option value="">Choose a goal</option>
            {fitnessGoals.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {planOptions.length > 0 ? (
          <Field id="lead-planSlug" label="Membership plan" optional>
            <select id="lead-planSlug" name="planSlug" defaultValue={planSlug} className="field">
              <option value="">Not decided</option>
              {planOptions.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <input type="hidden" name="planSlug" value={planSlug} />
        )}
        <Field id="lead-contactTime" label="Best time to call" optional>
          <select id="lead-contactTime" name="contactTime" defaultValue="" className="field">
            <option value="">Any time</option>
            {contactTimes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {showMessage && (
        <Field id="lead-message" label="Anything we should know?" optional error={errors.message} hint="Please don't share medical details here. We'll discuss anything relevant in person.">
          <textarea id="lead-message" name="message" rows={4} maxLength={1000} className="field resize-y" {...err("message")} />
        </Field>
      )}

      {/* Honeypot — hidden from people and screen readers */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-bone/80">
          <input
            id="lead-consent"
            name="consent"
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-furnace)]"
            {...err("consent")}
          />
          <span>
            I agree that Fitness World may contact me by phone, WhatsApp or email about this request. See our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ember">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id="lead-consent-error" role="alert" className="mt-1.5 text-sm text-danger">
            {errors.consent}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending && <Loader2 className="animate-spin" size={18} aria-hidden />}
        {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
