/**
 * Auth.js (NextAuth v5) foundation configuration for PlannerDesk.
 *
 * This is the minimal Auth.js setup required before implementing
 * real login providers, database adapters, or protected admin routes.
 *
 * Current state:
 * - No login providers configured (empty providers array).
 * - JWT session strategy (no database tables required).
 * - No Prisma Adapter (will be added in a future PR after schema review).
 * - No OAuth provider secrets committed.
 * - No middleware blocking public routes.
 * - Public MVP pages remain fully accessible without login.
 *
 * Future PRs will:
 * - Add OAuth providers (Google, Kakao, Naver) with Railway Variables.
 * - Add Prisma Adapter for database-backed sessions.
 * - Add role-based access control (RBAC) callbacks.
 * - Add protected admin shell under /admin.
 *
 * @see docs/AUTH_FOUNDATION_PLAN.md
 * @see docs/ADMIN_ACCESS_PLAN.md
 */

import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string | null;
      id?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string | null;
  }
}

const googleProviderEnabled =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  /**
   * Use the Prisma Adapter to persist user, account, and verification tokens.
   */
  adapter: PrismaAdapter(prisma),

  /**
   * Google provider is conditionally registered only when environment variables are set.
   * If they are missing, the providers list remains empty to prevent application crashes.
   */
  providers: [
    ...(googleProviderEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],

  /**
   * Custom NextAuth callbacks to map custom DB fields (like user.role)
   * from the database to the session user object securely.
   */
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      } else if (token.email) {
        // Safe database fallback to ensure role changes (e.g. to super_admin)
        // propagate without requiring a manual user sign-out/sign-in.
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (err) {
          console.error("[plannerdesk] Failed to fetch user role in jwt callback", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | null;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },

  /**
   * Use JWT strategy for session token resolution to minimize database-backed
   * session validation traffic on every request, as planned.
   */
  session: {
    strategy: "jwt",
  },

  /**
   * Auth.js route prefix. Defaults to /api/auth.
   * Route handler is at app/api/auth/[...nextauth]/route.ts.
   */
  basePath: "/api/auth",
});
