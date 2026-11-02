"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { site } from "@/config/site";
import { Container } from "@/components/ui/primitives";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  // Always render 0 first so server and client markup match; reduced motion jumps straight to the value.
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: reduce ? 0 : 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("en-IN")}
      {suffix && <span className="text-[0.45em] font-bold text-ash">{suffix}</span>}
    </span>
  );
}

export function Stats() {
  const { items, isPlaceholder } = site.stats;
  return (
    <section aria-label="Fitness World in numbers" className="border-y border-line bg-coal">
      <Container>
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <div
              key={s.label}
              className={`px-2 py-10 sm:px-6 lg:py-14 ${i % 2 ? "border-l border-line" : ""} ${
                i > 1 ? "border-t border-line lg:border-t-0" : ""
              } ${i === 2 ? "lg:border-l" : ""}`}
            >
              <dt className="text-sm text-ash">{s.label}</dt>
              <dd className="mt-2 font-display text-[clamp(2.6rem,5vw,4.4rem)] font-extrabold leading-none text-bone">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
        {isPlaceholder && (
          <p className="border-t border-line py-3 text-xs text-ash">
            Sample figures for layout. Real numbers will be published once confirmed.
          </p>
        )}
      </Container>
    </section>
  );
}
