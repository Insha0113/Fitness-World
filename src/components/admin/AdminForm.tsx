"use client";

import { useActionState, useEffect, useRef, useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/Button";

/** Form bound to a server action, with inline success/error feedback. */
export function AdminForm({
  action,
  children,
  submitLabel = "Save",
  className = "space-y-4",
  resetOnSuccess = false,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="flex items-center gap-4">
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 size={14} className="animate-spin" />}
          {submitLabel}
        </Button>
        {state?.ok && <p role="status" className="text-sm text-success">{state.ok}</p>}
        {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      </div>
    </form>
  );
}

/** One-click action button (status changes, deletes). */
export function ActionButton({
  action,
  children,
  confirm,
  variant = "outline",
}: {
  action: () => Promise<unknown>;
  children: ReactNode;
  confirm?: string;
  variant?: "outline" | "primary" | "ghost";
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          try {
            await action();
          } catch (e) {
            window.alert(e instanceof Error ? e.message : "Action failed.");
          }
        });
      }}
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {children}
    </Button>
  );
}

export function AdminInput({ label, name, defaultValue, type = "text", required, placeholder, hint }: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-bone/85">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} className="field !py-2" />
      {hint && <span className="mt-1 block text-xs text-ash">{hint}</span>}
    </label>
  );
}

export function AdminTextarea({ label, name, defaultValue, rows = 3, hint }: { label: string; name: string; defaultValue?: string | null; rows?: number; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-bone/85">{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} className="field !py-2" />
      {hint && <span className="mt-1 block text-xs text-ash">{hint}</span>}
    </label>
  );
}

export function AdminCheck({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-bone/85">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[var(--color-furnace)]" />
      {label}
    </label>
  );
}
