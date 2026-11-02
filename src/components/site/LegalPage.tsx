import type { ReactNode } from "react";
import { Container, PlaceholderNote } from "@/components/ui/primitives";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-pitch pb-24 pt-[72px]">
      <Container className="max-w-3xl pt-12 lg:pt-20">
        <h1 className="display text-[clamp(3rem,7vw,5rem)] text-bone">{title}</h1>
        <div className="mt-4">
          <PlaceholderNote>Draft for review by the gym and its legal adviser before launch</PlaceholderNote>
        </div>
        <div className="mt-10 space-y-6 text-bone/80 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-bone [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </Container>
    </div>
  );
}
