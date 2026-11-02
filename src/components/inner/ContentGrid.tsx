"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Play, X } from "lucide-react";
import { img } from "@/config/media";

export type ContentView = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  body: string | null;
  videoUrl: string | null;
  thumbnailUrl: string;
  category: string;
  durationMin: number | null;
  locked: boolean;
};

const kindLabel: Record<string, string> = {
  VIDEO: "Workout video",
  TUTORIAL: "Exercise tutorial",
  TIP: "Training tip",
  CHALLENGE: "Challenge",
  ARTICLE: "Article",
  MOTIVATION: "Motivation",
};

export function ContentGrid({ items }: { items: ContentView[] }) {
  const kinds = ["ALL", ...Array.from(new Set(items.map((i) => i.kind)))];
  const [filter, setFilter] = useState("ALL");
  const [open, setOpen] = useState<ContentView | null>(null);
  const shown = filter === "ALL" ? items : items.filter((i) => i.kind === filter);

  return (
    <>
      <div role="tablist" aria-label="Filter content" className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={`h-10 rounded-full px-4 text-sm ${filter === k ? "bg-bone text-pitch" : "border border-line text-ash hover:text-bone"}`}
          >
            {k === "ALL" ? "Everything" : kindLabel[k] ?? k}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => !c.locked && setOpen(c)}
              aria-disabled={c.locked}
              className="group block w-full text-left"
            >
              <div className="relative aspect-video overflow-hidden rounded-md bg-coal">
                <Image
                  src={img(c.thumbnailUrl, 800)}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
                  className={`object-cover transition-transform duration-700 group-hover:scale-105 ${c.locked ? "blur-sm brightness-50" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pitch/80 to-transparent" />
                <span className="absolute left-3 top-3 rounded-sm bg-pitch/80 px-2 py-0.5 text-xs text-bone">{kindLabel[c.kind] ?? c.kind}</span>
                <span className="absolute inset-0 grid place-items-center">
                  {c.locked ? (
                    <span className="flex items-center gap-2 rounded-full bg-pitch/80 px-4 py-2 text-sm text-bone">
                      <Lock size={16} aria-hidden /> Members only
                    </span>
                  ) : c.videoUrl ? (
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-furnace text-pitch transition-transform group-hover:scale-110">
                      <Play size={22} aria-hidden />
                    </span>
                  ) : null}
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold uppercase leading-tight text-bone">{c.title}</p>
              <p className="mt-1 text-sm text-ash">
                {c.category}
                {c.durationMin ? ` · ${c.durationMin} min` : ""}
              </p>
              <p className="mt-2 text-ash">{c.summary}</p>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="content-title" className="fixed inset-0 z-[70] grid place-items-center bg-pitch/90 p-4" onClick={() => setOpen(null)}>
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-line bg-coal" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-pitch/70 text-bone">
              <X size={18} />
            </button>
            {open.videoUrl ? (
              <video src={open.videoUrl} controls autoPlay playsInline className="aspect-video w-full bg-pitch" />
            ) : (
              <div className="relative aspect-[21/9]">
                <Image src={img(open.thumbnailUrl, 1200)} alt="" fill sizes="768px" className="object-cover" />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <h2 id="content-title" className="display text-[2.4rem] text-bone">
                {open.title}
              </h2>
              <p className="mt-3 text-ash">{open.summary}</p>
              {open.body && <p className="mt-4 whitespace-pre-line text-bone/85">{open.body}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
