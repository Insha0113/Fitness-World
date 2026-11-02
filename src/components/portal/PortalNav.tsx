"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  User,
  BadgeCheck,
  Dumbbell,
  Salad,
  LineChart,
  Receipt,
  RefreshCw,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

const items = [
  { label: "Overview", href: "/my-fitness", icon: LayoutDashboard },
  { label: "My Profile", href: "/my-fitness/profile", icon: User },
  { label: "My Membership", href: "/my-fitness/membership", icon: BadgeCheck },
  { label: "Workout Plans", href: "/my-fitness/workouts", icon: Dumbbell, members: true },
  { label: "My Nutrition", href: "/my-fitness/nutrition", icon: Salad, members: true },
  { label: "Progress Tracker", href: "/my-fitness/progress", icon: LineChart, members: true },
  { label: "Pay My Fee", href: "/my-fitness/payments", icon: Receipt },
  { label: "Renew Membership", href: "/my-fitness/renew", icon: RefreshCw },
  { label: "Settings", href: "/my-fitness/settings", icon: Settings },
];

export function PortalNav({ active, name, isAdmin }: { active: boolean; name: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const list = (
    <nav aria-label="My Fitness" className="flex h-full flex-col">
      <ul className="space-y-1">
        {items.map((it) => {
          const current = it.href === "/my-fitness" ? pathname === it.href : pathname.startsWith(it.href);
          const locked = it.members && !active;
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={() => setOpen(false)}
                aria-current={current ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.95rem] transition-colors ${
                  current ? "bg-iron text-bone" : "text-ash hover:bg-iron/50 hover:text-bone"
                }`}
              >
                <Icon size={18} aria-hidden className={current ? "text-furnace" : ""} />
                <span className="flex-1">{it.label}</span>
                {locked && <Lock size={14} aria-label="Members only" />}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 space-y-1 border-t border-line pt-6">
        <Link href="/inner-circle" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-ember hover:bg-iron/50">
          <Sparkles size={18} aria-hidden /> The Inner Circle
        </Link>
        {isAdmin && (
          <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-ash hover:bg-iron/50 hover:text-bone">
            <Settings size={18} aria-hidden /> Admin dashboard
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-ash hover:bg-iron/50 hover:text-bone"
        >
          <LogOut size={18} aria-hidden /> Logout
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-pitch/95 px-4 backdrop-blur lg:hidden print:hidden">
        <Logo />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-11 w-11 place-items-center text-bone"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <div className="fixed inset-0 top-16 z-30 overflow-y-auto bg-pitch p-4 lg:hidden">{list}</div>}

      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-line bg-coal/60 p-6 lg:flex print:hidden">
        <Logo />
        <p className="mb-6 mt-8 text-sm text-ash">
          Signed in as <span className="text-bone">{name}</span>
        </p>
        {list}
      </aside>
    </>
  );
}
