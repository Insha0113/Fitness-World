import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PortalTitle, Panel } from "@/components/portal/ui";
import { PasswordForm } from "@/components/portal/forms";
import { SignOutButton } from "@/components/portal/SignOutButton";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireUser("/my-fitness/settings");
  return (
    <div className="space-y-5">
      <PortalTitle title="Settings" />
      <Panel title="Change password">
        <PasswordForm />
      </Panel>
      <Panel title="Session">
        <p className="mb-4 text-ash">Log out of Fitness World on this device.</p>
        <SignOutButton />
      </Panel>
      <Panel title="Your data">
        <p className="text-ash">
          To download or delete your account data, contact the gym. We&apos;ll respond within the period required by law.
        </p>
      </Panel>
    </div>
  );
}
