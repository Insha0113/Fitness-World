import type { DefaultSession } from "next-auth";

type MembershipState = "ACTIVE" | "EXPIRED" | "PENDING" | "NONE";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "MEMBER" | "ADMIN";
      membershipStatus: MembershipState;
      planName: string | null;
      membershipEndsAt: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role: "MEMBER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "MEMBER" | "ADMIN";
  }
}
