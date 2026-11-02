import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

/** Section heading: big display title with an optional short lede. No eyebrow labels. */
export function SectionTitle({
  title,
  lede,
  align = "left",
  className = "",
  as: Tag = "h2",
}: {
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      <Tag className="display text-[clamp(2.6rem,6vw,5rem)] text-bone">{title}</Tag>
      {lede ? <p className="mt-5 max-w-[58ch] text-lg text-ash">{lede}</p> : null}
    </div>
  );
}

export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-dashed border-ember/40 px-3 py-1 text-xs text-ember/90">
      {children}
    </p>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-iron/70 ${className}`} />;
}
