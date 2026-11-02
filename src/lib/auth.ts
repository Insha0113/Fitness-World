import "server-only";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "./db";
import { getMembershipState } from "./membership";
import { rateLimit } from "./rate-limit";

let DUMMY_HASH: string | undefined;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        // Slow down password guessing per account.
        if (!rateLimit(`login:${email}`, 8, 15 * 60_000).ok) {
          throw new Error("Too many attempts. Try again in 15 minutes.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        // Compare against a dummy hash when the user is missing to keep timing uniform.
        const hash = user?.passwordHash ?? (DUMMY_HASH ??= await bcrypt.hash("timing-equaliser", 12));
        const valid = await bcrypt.compare(password, hash);
        if (!user || !valid) return null;
        if (!user.isActive) throw new Error("This account is disabled. Contact the gym.");

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      const { state, membership } = await getMembershipState(token.id);
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        membershipStatus: state,
        planName: membership?.plan.name ?? null,
        membershipEndsAt: membership?.endsAt.toISOString() ?? null,
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

/** Server-side guard for pages: must be logged in. */
export async function requireUser(callbackUrl = "/my-fitness") {
  const session = await getSession();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.isActive) redirect("/login?error=disabled");
  return { session, user };
}

/** Server-side guard: logged in AND holding an active, paid membership. */
export async function requireActiveMember(callbackUrl = "/my-fitness") {
  const ctx = await requireUser(callbackUrl);
  if (ctx.session.user.membershipStatus !== "ACTIVE") redirect("/my-fitness/renew?reason=inactive");
  return ctx;
}

export async function requireAdmin() {
  const ctx = await requireUser("/admin");
  if (ctx.user.role !== "ADMIN") redirect("/");
  return ctx;
}

/** For route handlers: returns the user or null (never redirects). */
export async function apiUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.isActive) return null;
  return { session, user };
}
