"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const KEY = "fw_consult_prompt_seen";
const DELAY_MS = 45_000;
const SUPPRESS_DAYS = 7;
// Pages where a prompt would interrupt a task already in progress.
const SKIP = ["/consultation", "/join", "/login", "/checkout", "/forgot-password", "/reset-password"];

function recentlySeen() {
  try {
    const t = Number(localStorage.getItem(KEY) ?? 0);
    return Date.now() - t < SUPPRESS_DAYS * 86_400_000;
  } catch {
    return true;
  }
}

/**
 * One gentle consultation prompt per visitor per week: after 45s on the site,
 * or on desktop exit intent — whichever comes first. Never shown to logged-in
 * users or on form pages.
 */
export function ConsultPrompt() {
  const pathname = usePathname();
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  const skip = status !== "unauthenticated" || SKIP.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (skip || recentlySeen()) return;
    const show = () => {
      if (recentlySeen()) return;
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {}
      setOpen(true);
    };
    const timer = window.setTimeout(show, DELAY_MS);
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.clearTimeout(timer);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [skip]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || skip) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consult-prompt-title"
      className="fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-md rounded-lg border border-white/10 bg-coal/95 p-6 shadow-2xl backdrop-blur sm:bottom-8 sm:left-8 sm:right-auto"
    >
      <button
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded text-ash hover:text-bone"
      >
        <X size={18} />
      </button>
      <h2 id="consult-prompt-title" className="display text-[2rem] text-bone">
        Not sure where to start?
      </h2>
      <p className="mt-2 text-ash">
        Book a free consultation. A coach looks at your goal and recommends a plan. No obligation.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href="/consultation?intent=CONSULTATION" onClick={() => setOpen(false)}>
          Book a free consultation
        </ButtonLink>
        <button onClick={() => setOpen(false)} className="px-2 text-sm text-ash hover:text-bone">
          Maybe later
        </button>
      </div>
    </div>
  );
}
