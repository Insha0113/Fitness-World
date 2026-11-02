"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { experiences } from "@/config/content";
import { img } from "@/config/media";
import { Container, SectionTitle } from "@/components/ui/primitives";

/**
 * Five "doors". On desktop the focused/hovered door opens wide and the others
 * compress to slivers; on mobile they stack as full cards. Each one leads to a
 * real page or lead form.
 */
export function ExperienceDoors() {
  const [active, setActive] = useState(0);

  return (
    <section id="explore" aria-labelledby="explore-title" className="scroll-mt-20 bg-pitch py-24 lg:py-32">
      <Container>
        <SectionTitle
          title={<span id="explore-title">Where do you want to begin?</span>}
          lede="Five ways into Fitness World. Open one."
        />
      </Container>

      <Container className="mt-12">
        <ul className="flex flex-col gap-3 lg:h-[74vh] lg:min-h-[560px] lg:flex-row">
          {experiences.map((e, i) => (
            <Door key={e.title} e={e} i={i} open={active === i} onOpen={() => setActive(i)} />
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Door({
  e,
  i,
  open,
  onOpen,
}: {
  e: (typeof experiences)[number];
  i: number;
  open: boolean;
  onOpen: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const hasVideo = "video" in e && e.video;

  const activate = () => {
    onOpen();
    video.current?.play().catch(() => {});
  };

  return (
    <li
      onMouseEnter={activate}
      onFocus={activate}
      onMouseLeave={() => video.current?.pause()}
      className={`group relative isolate min-h-[420px] overflow-hidden rounded-md bg-coal transition-[flex-grow] duration-700 ease-[var(--ease-out-expo)] lg:min-h-0 ${
        open ? "lg:flex-[4.2]" : "lg:flex-1"
      }`}
    >
      <Image
        src={img(e.image, 1400)}
        alt=""
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className={`-z-20 object-cover transition-[transform,filter] duration-[1.2s] ease-[var(--ease-out-expo)] ${
          open ? "lg:scale-100 lg:grayscale-0" : "lg:scale-110 lg:grayscale"
        }`}
      />
      {hasVideo && (
        <video
          ref={video}
          src={e.video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className={`absolute inset-0 -z-10 hidden h-full w-full object-cover transition-opacity duration-700 lg:block ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-pitch via-pitch/55 to-pitch/10"
      />

      {/* Collapsed label (desktop only) */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-6 hidden justify-center transition-opacity duration-300 lg:flex ${
          open ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="font-display text-xl font-bold uppercase tracking-wide text-bone [writing-mode:vertical-rl] rotate-180">
          {e.title}
        </span>
      </div>

      <div
        className={`flex h-full flex-col justify-end p-6 sm:p-8 transition-opacity duration-500 lg:p-10 ${
          open ? "lg:opacity-100 lg:delay-200" : "lg:pointer-events-none lg:opacity-0"
        }`}
      >
        <span className="font-display text-lg font-bold text-ember">0{i + 1}</span>
        <h3 className="display mt-2 max-w-[14ch] text-[clamp(2.4rem,4.4vw,4.2rem)] text-bone">{e.title}</h3>
        <p className="mt-4 max-w-[42ch] text-bone/75">{e.body}</p>
        <Link
          href={e.href}
          className="mt-6 inline-flex w-fit items-center gap-3 border-b-2 border-furnace pb-1 font-display text-lg font-bold uppercase tracking-wide text-bone transition-colors hover:border-ember hover:text-ember"
        >
          {e.cta}
        </Link>
      </div>
    </li>
  );
}
