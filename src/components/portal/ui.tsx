import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

export function PortalTitle({ title, lede, action }: { title: string; lede?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-[clamp(2.6rem,6vw,4.2rem)] text-bone">{title}</h1>
        {lede && <p className="mt-2 max-w-[60ch] text-ash">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, children, className = "", action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`rounded-md border border-line bg-coal p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-xl font-bold uppercase tracking-wide text-bone">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    ACTIVE: "bg-success/15 text-success",
    PAID: "bg-success/15 text-success",
    CONVERTED: "bg-success/15 text-success",
    EXPIRED: "bg-danger/15 text-danger",
    FAILED: "bg-danger/15 text-danger",
    CANCELLED: "bg-iron text-ash",
    CLOSED: "bg-iron text-ash",
    CREATED: "bg-ember/15 text-ember",
    PENDING: "bg-ember/15 text-ember",
    NEW: "bg-furnace/20 text-ember",
    CONTACTED: "bg-sky-500/15 text-sky-300",
    NONE: "bg-iron text-ash",
  };
  const label: Record<string, string> = { CREATED: "Pending", NONE: "No membership" };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[status] ?? "bg-iron text-ash"}`}>
      {label[status] ?? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </span>
  );
}

/** Shown in place of member-only content when the membership isn't active. */
export function MembersOnly({ what }: { what: string }) {
  return (
    <div className="rounded-md border border-dashed border-line p-10 text-center">
      <Lock className="mx-auto text-ash" aria-hidden />
      <h2 className="mt-4 font-display text-2xl font-bold uppercase text-bone">{what} is for active members</h2>
      <p className="mx-auto mt-2 max-w-md text-ash">Renew or start a membership to unlock it. Your history is saved and will be here when you return.</p>
      <Link href="/my-fitness/renew" className={buttonClass("primary", "md", "mt-6")}>
        Renew membership
      </Link>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-line p-8 text-center">
      <p className="font-semibold text-bone">{title}</p>
      {children && <div className="mt-2 text-ash">{children}</div>}
    </div>
  );
}
