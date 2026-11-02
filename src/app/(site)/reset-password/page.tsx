import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  return (
    <AuthShell title="New password">
      {typeof token === "string" && token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-ash">
          This link is incomplete.{" "}
          <Link href="/forgot-password" className="text-ember underline">
            Request a new reset link
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
