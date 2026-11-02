"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/forms/Field";
import { fitnessGoals } from "@/config/site";

/** Shared submit helper: JSON → API, field errors back into the form. */
function useJsonSubmit(url: string, method = "POST") {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(payload: unknown, success: string) {
    setPending(true);
    setFormError(null);
    setOk(null);
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const j = await res?.json().catch(() => null);
    setPending(false);
    if (!res?.ok) {
      setErrors(j?.fields ?? {});
      setFormError(j?.error ?? "Couldn't save. Try again.");
      return false;
    }
    setErrors({});
    setOk(success);
    router.refresh();
    return true;
  }
  return { errors, formError, ok, pending, submit };
}

export function ProfileForm({
  initial,
}: {
  initial: { name: string; phone: string; goal: string; city: string; emergencyContact: string; marketingOptIn: boolean };
}) {
  const { errors, formError, ok, pending, submit } = useJsonSubmit("/api/me/profile", "PATCH");
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        submit({ ...Object.fromEntries(fd.entries()), marketingOptIn: fd.get("marketingOptIn") === "on" }, "Profile saved.");
      }}
    >
      <FormError message={formError} />
      {ok && <p role="status" className="text-sm text-success">{ok}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="p-name" label="Full name" error={errors.name}>
          <input id="p-name" name="name" defaultValue={initial.name} className="field" autoComplete="name" />
        </Field>
        <Field id="p-phone" label="Mobile number" error={errors.phone}>
          <input id="p-phone" name="phone" defaultValue={initial.phone} className="field" type="tel" autoComplete="tel" />
        </Field>
        <Field id="p-goal" label="Main goal" optional>
          <select id="p-goal" name="goal" defaultValue={initial.goal} className="field">
            <option value="">Not set</option>
            {fitnessGoals.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="p-city" label="City" optional error={errors.city}>
          <input id="p-city" name="city" defaultValue={initial.city} className="field" autoComplete="address-level2" />
        </Field>
      </div>
      <Field id="p-emergency" label="Emergency contact (name and number)" optional error={errors.emergencyContact}>
        <input id="p-emergency" name="emergencyContact" defaultValue={initial.emergencyContact} className="field" />
      </Field>
      <label className="flex items-start gap-3 text-sm text-bone/80">
        <input name="marketingOptIn" type="checkbox" defaultChecked={initial.marketingOptIn} className="mt-0.5 h-5 w-5 accent-[var(--color-furnace)]" />
        Send me training tips and offers.
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const { errors, formError, ok, pending, submit } = useJsonSubmit("/api/me/password");
  return (
    <form
      noValidate
      className="max-w-md space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        if (await submit(Object.fromEntries(fd.entries()), "Password changed.")) form.reset();
      }}
    >
      <FormError message={formError} />
      {ok && <p role="status" className="text-sm text-success">{ok}</p>}
      <Field id="pw-current" label="Current password" error={errors.currentPassword}>
        <input id="pw-current" name="currentPassword" type="password" autoComplete="current-password" className="field" />
      </Field>
      <Field id="pw-new" label="New password" error={errors.newPassword} hint="At least 8 characters, with a letter and a number.">
        <input id="pw-new" name="newPassword" type="password" autoComplete="new-password" className="field" />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}

export function ProgressForm() {
  const { errors, formError, pending, submit } = useJsonSubmit("/api/me/progress");
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (await submit(Object.fromEntries(new FormData(form).entries()), "Saved")) form.reset();
      }}
    >
      <div className="sm:col-span-2 lg:col-span-6">
        <FormError message={formError} />
      </div>
      <Field id="pr-date" label="Date" error={errors.date}>
        <input id="pr-date" name="date" type="date" defaultValue={today} max={today} className="field" />
      </Field>
      <Field id="pr-weight" label="Weight (kg)" optional error={errors.weightKg}>
        <input id="pr-weight" name="weightKg" inputMode="decimal" className="field" />
      </Field>
      <Field id="pr-waist" label="Waist (cm)" optional error={errors.waistCm}>
        <input id="pr-waist" name="waistCm" inputMode="decimal" className="field" />
      </Field>
      <Field id="pr-sessions" label="Sessions" optional error={errors.sessions}>
        <input id="pr-sessions" name="sessions" inputMode="numeric" className="field" />
      </Field>
      <Field id="pr-note" label="Note" optional error={errors.note}>
        <input id="pr-note" name="note" maxLength={200} className="field" />
      </Field>
      <Button type="submit" disabled={pending} className="h-[50px]">
        {pending ? <Loader2 size={18} className="animate-spin" /> : "Log entry"}
      </Button>
    </form>
  );
}

export function DeleteButton({ url, label }: { url: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch(url, { method: "DELETE" }).catch(() => null);
        setPending(false);
        router.refresh();
      }}
      className="grid h-9 w-9 place-items-center rounded text-ash hover:bg-iron hover:text-danger"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}

export function RemoveMealButton({ mealId, name }: { mealId: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Remove ${name} from my plan`}
      onClick={async () => {
        setPending(true);
        await fetch("/api/meals/saved", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealId }),
        }).catch(() => null);
        setPending(false);
        router.refresh();
      }}
      className="text-sm text-ash underline-offset-4 hover:text-danger hover:underline"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
