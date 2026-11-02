import Image from "next/image";
import type { ReactNode } from "react";
import { img, media } from "@/config/media";

export function AuthShell({ title, lede, children }: { title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-[100svh] bg-pitch lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={img(media.gym.darkLift, 1400)} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-pitch" />
      </div>
      <div className="flex items-center px-4 pb-16 pt-28 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <h1 className="display text-[clamp(3rem,7vw,5rem)] text-bone">{title}</h1>
          {lede && <div className="mb-8 mt-3 text-ash">{lede}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}
