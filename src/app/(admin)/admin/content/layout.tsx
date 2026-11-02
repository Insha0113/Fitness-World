import Link from "next/link";
import { PortalTitle } from "@/components/portal/ui";

const tabs = [
  { href: "/admin/content/testimonials", label: "Testimonials & stories" },
  { href: "/admin/content/videos", label: "Inner Circle content" },
  { href: "/admin/content/announcements", label: "Announcements" },
  { href: "/admin/content/meals", label: "Nutrition (meals)" },
  { href: "/admin/content/trainers", label: "Trainers" },
];

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PortalTitle title="Content" />
      <nav aria-label="Content sections" className="mb-6 flex flex-wrap gap-2 text-sm">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-full border border-line px-4 py-1.5 text-ash hover:text-bone">
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
