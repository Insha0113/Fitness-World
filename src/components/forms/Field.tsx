import type { ReactNode } from "react";

export function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
  tone = "dark",
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  tone?: "dark" | "fuel";
}) {
  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block text-sm font-medium ${tone === "dark" ? "text-bone/90" : "text-earth"}`}>
        {label}
        {optional && <span className={tone === "dark" ? "text-ash" : "text-earth/55"}> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={`mt-1.5 text-xs ${tone === "dark" ? "text-ash" : "text-earth/60"}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}
