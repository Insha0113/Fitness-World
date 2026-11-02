import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { sweepExpired } from "@/lib/membership";
import { PortalNav } from "@/components/portal/PortalNav";

export const metadata: Metadata = {
  title: { default: "My Fitness", template: "%s | My Fitness" },
  robots: { index: false },
};

export default async function MyFitnessLayout({ children }: { children: React.ReactNode }) {
  const { session, user } = await requireUser("/my-fitness");
  await sweepExpired(user.id);

  return (
    <div className="min-h-dvh bg-pitch lg:flex">
      <PortalNav active={session.user.membershipStatus === "ACTIVE"} name={user.name} isAdmin={user.role === "ADMIN"} />
      <main id="main" className="min-w-0 flex-1 px-4 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        {children}
      </main>
    </div>
  );
}
