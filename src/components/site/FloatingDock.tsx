"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { ConsultPrompt } from "./ConsultPrompt";
import { FitBot } from "@/components/fitbot/FitBot";

const HIDE_STICKY = ["/consultation", "/join", "/checkout", "/login"];

/** Fixed UI shared by every public page: sticky consultation CTA, WhatsApp, FITBOT. */
export function FloatingDock() {
  const pathname = usePathname();
  const [past, setPast] = useState(false);
  const fuel = pathname.startsWith("/fuel-studio");
  const showSticky = !HIDE_STICKY.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {showSticky && (
        <Link
          href="/consultation?intent=CONSULTATION"
          className={`fixed bottom-4 left-4 z-40 inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-xl transition-[opacity,transform] duration-500 sm:bottom-8 sm:left-8 ${
            fuel ? "bg-sage-deep text-cream" : "bg-furnace text-pitch heat-glow"
          } ${past ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
          tabIndex={past ? 0 : -1}
          aria-hidden={!past}
        >
          <CalendarCheck size={18} aria-hidden />
          Free consultation
        </Link>
      )}

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
        <FitBot />
        <WhatsAppButton />
      </div>

      <ConsultPrompt />
    </>
  );
}
