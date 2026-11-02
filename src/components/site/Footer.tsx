"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, whatsappLink } from "@/config/site";
import { Logo } from "./Logo";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Training", href: "/training" },
      { label: "Memberships", href: "/memberships" },
      { label: "Fuel Studio", href: "/fuel-studio" },
      { label: "Transformations", href: "/transformations" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Book a free consultation", href: "/consultation?intent=CONSULTATION" },
      { label: "Request a callback", href: "/consultation?intent=CALLBACK" },
      { label: "Join Fitness World", href: "/join" },
      { label: "Member login", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of membership", href: "/terms" },
    ],
  },
];

export function Footer() {
  const fuel = usePathname().startsWith("/fuel-studio");
  const wa = whatsappLink();
  const tone = fuel ? "bg-oat text-earth" : "bg-coal text-bone";
  const muted = fuel ? "text-earth/65" : "text-ash";
  const hover = fuel ? "hover:text-sage-deep" : "hover:text-ember";

  return (
    <footer className={`${tone} pb-28 pt-16 sm:pb-12`}>
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-10">
        <div>
          <Logo tone={fuel ? "light" : "dark"} />
          <p className={`mt-4 max-w-sm ${muted}`}>{site.description}</p>
          <dl className={`mt-6 space-y-1 text-sm ${muted}`}>
            {site.hours.map((h) => (
              <div key={h.days} className="flex gap-3">
                <dt className="min-w-36">{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide">{g.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={`${muted} ${hover} transition-colors`}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                {g.title === "Get started" && wa && (
                  <li>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className={`${muted} ${hover}`}>
                      WhatsApp us
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`mx-auto mt-14 flex max-w-[1320px] flex-col gap-2 border-t px-4 pt-6 text-xs sm:flex-row sm:justify-between sm:px-6 lg:px-10 ${
          fuel ? "border-earth/10" : "border-white/5"
        } ${muted}`}
      >
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Nutritional and training information on this site is general guidance, not medical advice.</p>
      </div>
    </footer>
  );
}
