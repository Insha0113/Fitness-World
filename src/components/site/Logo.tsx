import Link from "next/link";

/** Wordmark: two weights of the display face, a furnace slash between. */
export function Logo({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const ink = tone === "dark" ? "text-bone" : "text-earth";
  return (
    <Link href="/" aria-label="Fitness World home" className={`group inline-flex items-baseline gap-1.5 ${className}`}>
      <span className={`font-display text-[1.65rem] font-black uppercase leading-none tracking-[0.02em] ${ink}`}>
        Fitness
      </span>
      <span
        aria-hidden
        className={`h-5 w-[3px] -skew-x-[18deg] transition-transform duration-500 group-hover:scale-y-125 ${
          tone === "dark" ? "bg-furnace" : "bg-sage-deep"
        }`}
      />
      <span className={`font-display text-[1.65rem] font-light uppercase leading-none tracking-[0.08em] ${ink}`}>
        World
      </span>
    </Link>
  );
}
