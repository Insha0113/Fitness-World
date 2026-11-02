"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { media } from "@/config/media";
import { Embers } from "./Embers";

const lines = ["Built", "by", "discipline."];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="hero-title" className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-pitch">
      {/* Background video with slow drift */}
      <div className="absolute inset-0 -z-10 animate-drift will-change-transform">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`${media.heroVideo.poster}?auto=format&fit=crop&w=1600&q=60`}
          aria-hidden
        >
          <source src={media.heroVideo.mobile} type="video/mp4" media="(max-width: 767px)" />
          <source src={media.heroVideo.desktop} type="video/mp4" />
        </video>
      </div>
      {/* Readability: heavy bottom-left shade, warm edge light from the right */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_0%_100%,#000_25%,transparent_70%),linear-gradient(to_top,#000_0%,rgba(0,0,0,.35)_45%,rgba(0,0,0,.55)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 w-2/3 bg-[radial-gradient(60%_60%_at_100%_40%,rgba(255,90,26,.22),transparent_70%)] mix-blend-screen"
      />
      <Embers />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-4 pb-24 pt-32 sm:px-6 lg:px-10 lg:pb-20">
        <h1 id="hero-title" className="display text-[clamp(4.4rem,min(17vw,21vh),15.5rem)] leading-[0.8] text-bone">
          {lines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Heat line: the one orange stroke that ties the page together */}
        <div
          aria-hidden
          className="mt-5 h-[3px] w-full max-w-[min(100%,58rem)] origin-left animate-heat bg-gradient-to-r from-furnace via-ember to-transparent shadow-[0_0_24px_rgba(255,90,26,.8)]"
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <p className="max-w-[30ch] text-xl text-bone/80 sm:text-2xl">
            Your transformation starts where your excuses end.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/consultation?intent=TRANSFORMATION" size="lg">
              Start your transformation
            </ButtonLink>
            <a href="#explore" className={buttonClass("outline", "lg")}>
              Explore Fitness World
            </a>
          </div>
        </motion.div>
      </div>

      <a
        href="#explore"
        aria-label="Scroll to explore"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-bone/60 lg:flex"
      >
        <span className="relative h-12 w-px overflow-hidden bg-bone/20">
          <span className="absolute inset-x-0 top-0 h-1/3 animate-scrollcue bg-ember" />
        </span>
        Scroll
      </a>
    </section>
  );
}
