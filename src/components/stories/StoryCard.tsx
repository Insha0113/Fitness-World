import Image from "next/image";
import { img } from "@/config/media";

export type Story = {
  id: string;
  clientName: string;
  quote: string;
  story: string | null;
  program: string | null;
  durationLabel: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  isSample: boolean;
};

function Photo({ src, label }: { src: string | null; label: string }) {
  return (
    <figure className="relative aspect-[3/4] overflow-hidden rounded bg-iron">
      {src ? (
        <Image src={img(src, 600)} alt={label} fill sizes="(min-width: 1024px) 15vw, 40vw" className="object-cover" />
      ) : (
        <div className="grid h-full place-items-center border border-dashed border-line text-xs text-ash">
          {label} photo
        </div>
      )}
      <figcaption className="absolute left-2 top-2 rounded-sm bg-pitch/80 px-2 py-0.5 text-xs text-bone">{label}</figcaption>
    </figure>
  );
}

export function StoryCard({ s, withPhotos = true }: { s: Story; withPhotos?: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-line bg-coal p-6 sm:p-7">
      {s.isSample && (
        <p className="mb-4 w-fit rounded-full border border-dashed border-ember/50 px-3 py-0.5 text-xs text-ember">
          Sample story — not a real member
        </p>
      )}
      {withPhotos && (
        <div className="mb-6 grid grid-cols-2 gap-2">
          <Photo src={s.beforeImage} label="Before" />
          <Photo src={s.afterImage} label="After" />
        </div>
      )}
      <blockquote className="text-lg leading-relaxed text-bone/90">“{s.quote}”</blockquote>
      {s.story && <p className="mt-3 text-sm text-ash">{s.story}</p>}
      <footer className="mt-auto pt-6">
        <p className="font-display text-xl font-bold uppercase text-bone">{s.clientName}</p>
        <p className="text-sm text-ash">{[s.program, s.durationLabel].filter(Boolean).join(", ")}</p>
      </footer>
    </article>
  );
}
