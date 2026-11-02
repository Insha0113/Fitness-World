import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      lede={
        <>
          Enter your account email and we&apos;ll send you a reset link.{" "}
          <Link href="/login" className="text-ember underline">
            Back to login
          </Link>
        </>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
