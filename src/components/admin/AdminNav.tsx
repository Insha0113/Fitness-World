"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, Users, Tags, CreditCard, FileText, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const items = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Inbox },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Plans", href: "/admin/plans", icon: Tags },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Content", href: "/admin/content", icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="border-b border-line bg-coal/60 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between p-4 lg:block lg:p-6">
        <Logo />
        <p className="text-xs text-ember lg:mt-2">Admin</p>
      </div>
      <nav aria-label="Admin" className="overflow-x-auto px-2 pb-3 lg:px-4">
        <ul className="flex gap-1 lg:flex-col">
          {items.map((it) => {
            const active = it.href === "/admin" ? pathname === it.href : pathname.startsWith(it.href);
            const Icon = it.icon;
            return (
              <li key={it.href} className="shrink-0">
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${active ? "bg-iron text-bone" : "text-ash hover:bg-iron/50 hover:text-bone"}`}
                >
                  <Icon size={16} aria-hidden className={active ? "text-furnace" : ""} />
                  {it.label}
                </Link>
              </li>
            );
          })}
          <li className="shrink-0 lg:mt-6">
            <Link href="/my-fitness" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ash hover:text-bone">
              <ArrowLeft size={16} aria-hidden /> My Fitness
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
