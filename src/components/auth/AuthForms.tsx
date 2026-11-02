"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/forms/Field";

function safeCallback(url: string | null | undefined) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/my-fitness";
}

export function LoginForm({ callbackUrl, notice }: { callbackUrl?: string; notice?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) return setError("Enter your email and password.");
    setPending(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (!res || res.error) {
      setError(res?.error && res.error !== "CredentialsSignin" ? res.error : "That email and password don't match. Try again or reset your password.");
      return;
    }
    router.push(safeCallback(callbackUrl));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {notice && <p className="rounded-md border border-ember/40 p-3 text-sm text-ember">{notice}</p>}
      <FormError message={error} />
      <Field id="login-email" label="Email">
        <input id="login-email" name="email" type="email" autoComplete="email" className="field" required />
      </Field>
      <Field id="login-password" label="Password">
        <input id="login-password" name="password" type="password" autoComplete="current-password" className="field" required />
      </Field>
      <div className="flex items-center justify-between gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" size={18} />}
          {pending ? "Logging in…" : "Log in"}
        </Button>
        <Link href="/forgot-password" className="text-sm text-ash underline-offset-4 hover:text-bone hover:underline">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const email = new FormData(e.currentTarget).get("email");
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setPending(false);
    if (!res?.ok) {
      const j = await res?.json().catch(() => null);
      return setError(j?.error ?? "Something went wrong. Try again.");
    }
    setSent(true);
  }

  if (sent)
    return (
      <p role="status" className="rounded-md border border-success/30 bg-success/5 p-5 text-bone">
        If an account exists for that email, a reset link is on its way. It expires in 1 hour.
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormError message={error} />
      <Field id="forgot-email" label="Email">
        <input id="forgot-email" name="email" type="email" autoComplete="email" className="field" required />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password !== fd.get("confirm")) return setError("The passwords don't match.");
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setPending(false);
    const j = await res?.json().catch(() => null);
    if (!res?.ok) return setError(j?.error ?? "Couldn't reset your password.");
    router.push("/login?reset=1");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormError message={error} />
      <Field id="reset-password" label="New password" hint="At least 8 characters, with a letter and a number.">
        <input id="reset-password" name="password" type="password" autoComplete="new-password" className="field" required />
      </Field>
      <Field id="reset-confirm" label="Confirm new password">
        <input id="reset-confirm" name="confirm" type="password" autoComplete="new-password" className="field" required />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
