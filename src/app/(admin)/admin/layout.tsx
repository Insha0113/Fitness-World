import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh bg-pitch lg:flex">
      <AdminNav />
      <main id="main" className="min-w-0 flex-1 px-4 pb-20 pt-8 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
