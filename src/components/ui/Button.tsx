import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline" | "fuel" | "fuel-outline";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[4px] transition-[background-color,color,box-shadow,transform,border-color] duration-300 ease-[var(--ease-out-expo)] disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "font-display uppercase tracking-[0.06em] font-bold bg-furnace text-pitch hover:bg-ember heat-glow",
  ghost: "font-display uppercase tracking-[0.06em] font-bold text-bone hover:text-ember",
  outline: "font-display uppercase tracking-[0.06em] font-bold border border-bone/30 text-bone hover:border-ember hover:text-ember backdrop-blur-sm",
  fuel: "bg-sage-deep text-cream hover:bg-olive rounded-full font-semibold",
  "fuel-outline":
    "border border-earth/30 text-earth hover:border-sage-deep hover:text-sage-deep rounded-full font-semibold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.95rem]",
  md: "h-12 px-6 text-[1.05rem]",
  lg: "h-14 px-8 text-[1.2rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function ButtonLink({
  variant,
  size,
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button {...props} className={buttonClass(variant, size, className)}>
      {children}
    </button>
  );
}
