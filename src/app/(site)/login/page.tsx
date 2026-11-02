import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Member login" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;
  if (await getSession()) redirect(callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/my-fitness");

  const notice =
    sp.reset === "1"
      ? "Password updated. Log in with your new password."
      : sp.error === "disabled"
        ? "This account is disabled. Please contact the gym."
        : undefined;

  return (
    <AuthShell
      title="Welcome back"
      lede={
        <>
          Not a member yet?{" "}
          <Link href="/join" className="text-ember underline">
            Join Fitness World
          </Link>
        </>
      }
    >
      <LoginForm callbackUrl={callbackUrl} notice={notice} />
    </AuthShell>
  );
}
