"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { buttonClass } from "@/components/ui/Button";

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/our-story" },
  { label: "Training", href: "/training" },
  { label: "Memberships", href: "/memberships" },
  { label: "Fuel Studio", href: "/fuel-studio" },
  { label: "Transformations", href: "/transformations" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  // Menu state is tied to the path it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const [scrolled, setScrolled] = useState(false);
  const fuel = pathname.startsWith("/fuel-studio");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const user = session?.user;
  const isMember = user?.membershipStatus === "ACTIVE";
  const isAdmin = user?.role === "ADMIN";

  const memberLinks = user
    ? [
        { label: "My Fitness", href: "/my-fitness" },
        ...(isMember ? [{ label: "The Inner Circle", href: "/inner-circle" }] : []),
        { label: "My Profile", href: "/my-fitness/profile" },
        ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
      ]
    : [];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const bar = fuel
    ? scrolled
      ? "bg-cream/85 backdrop-blur-md border-b border-earth/10"
      : "bg-transparent"
    : scrolled
      ? "glass border-b border-white/5"
      : "bg-gradient-to-b from-pitch/70 to-transparent";

  const linkTone = fuel ? "text-earth/75 hover:text-earth" : "text-bone/70 hover:text-bone";
  const activeTone = fuel ? "text-earth" : "text-bone";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${bar}`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-furnace focus:px-3 focus:py-2 focus:text-pitch"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Logo tone={fuel ? "light" : "dark"} />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {publicLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`relative text-[0.92rem] font-medium transition-colors ${
                    isActive(l.href) ? activeTone : linkTone
                  }`}
                >
                  {l.label}
                  {isActive(l.href) && (
                    <span
                      aria-hidden
                      className={`absolute -bottom-1.5 left-0 h-[2px] w-full ${fuel ? "bg-sage-deep" : "bg-furnace"}`}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {status === "loading" ? (
            <span className="h-9 w-40 animate-pulse rounded bg-white/5" />
          ) : user ? (
            <>
              {memberLinks.slice(0, 2).map((l) => (
                <Link key={l.href} href={l.href} className={`text-[0.92rem] font-medium ${linkTone}`}>
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`text-[0.92rem] font-medium ${linkTone}`}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`text-[0.92rem] font-medium ${linkTone}`}>
                Log in
              </Link>
              <Link href="/join" className={buttonClass(fuel ? "fuel" : "primary", "sm")}>
                Join now
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className={`grid h-11 w-11 place-items-center rounded xl:hidden ${fuel ? "text-earth" : "text-bone"}`}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className={`fixed inset-0 top-[72px] overflow-y-auto xl:hidden ${fuel ? "bg-cream" : "bg-pitch"}`}
        >
          <nav aria-label="Mobile" className="flex min-h-full flex-col px-6 pb-10 pt-6">
            <ul className="space-y-1">
              {[...publicLinks, ...memberLinks].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`block py-2 font-display text-[2.1rem] font-bold uppercase leading-tight ${
                      isActive(l.href)
                        ? fuel
                          ? "text-sage-deep"
                          : "text-furnace"
                        : fuel
                          ? "text-earth"
                          : "text-bone"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3 pt-10">
              {user ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={buttonClass(fuel ? "fuel-outline" : "outline", "lg")}
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link href="/join" className={buttonClass(fuel ? "fuel" : "primary", "lg")}>
                    Join now
                  </Link>
                  <Link href="/login" className={buttonClass(fuel ? "fuel-outline" : "outline", "lg")}>
                    Log in
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
