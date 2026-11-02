import Image from "next/image";
import type { ReactNode } from "react";
import { img } from "@/config/media";
import { Container } from "@/components/ui/primitives";

export function PageHero({
  title,
  lede,
  image,
  imageAlt = "",
  children,
}: {
  title: ReactNode;
  lede?: ReactNode;
  image: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <section className="grain relative isolate flex min-h-[78svh] items-end overflow-hidden bg-pitch pb-16 pt-32 lg:pb-24">
      <Image src={img(image, 2000)} alt={imageAlt} fill priority sizes="100vw" className="-z-20 animate-drift object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#000_5%,rgba(0,0,0,.55)_55%,rgba(0,0,0,.35))]" />
      <Container>
        <h1 className="display max-w-[16ch] text-[clamp(3.6rem,10vw,9rem)] text-bone">{title}</h1>
        <div aria-hidden className="mt-5 h-[3px] w-full max-w-xl origin-left animate-heat bg-gradient-to-r from-furnace via-ember to-transparent" />
        {lede && <p className="mt-6 max-w-[52ch] text-lg text-bone/80 sm:text-xl">{lede}</p>}
        {children}
      </Container>
    </section>
  );
}
