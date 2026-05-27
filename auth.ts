/**
 * Auth.js (NextAuth v5) foundation configuration for PlannerDesk.
 *
 * This is the Auth.js setup used by protected admin routes.
 *
 * Current state:
 * - Google provider is conditionally enabled from Railway/local env values.
 * - JWT session strategy with Prisma Adapter-backed user/account persistence.
 * - JWT/session callbacks map User.id and User.role into session.user.
 * - No OAuth provider secrets committed.
 * - No edge middleware blocking public routes.
 * - Public MVP pages remain fully accessible without login.
 *
 * Future PRs will:
 * - Add more providers only after explicit review.
 * - Keep RBAC deny-by-default and server-side.
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
      const roleToken = token as typeof token & {
        id?: string | null;
        role?: string | null;
      };

      if (user) {
        roleToken.id = user.id;
        roleToken.role = user.role ?? null;
      }

      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true },
          });
          roleToken.id = dbUser?.id ?? null;
          roleToken.role = dbUser?.role ?? null;
        } catch (err) {
          roleToken.role = null;
          console.error("[plannerdesk] Failed to refresh user role in jwt callback", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      const roleToken = token as typeof token & {
        id?: string | null;
        role?: string | null;
      };

      if (session.user) {
        session.user.role = roleToken.role ?? null;
        session.user.id = roleToken.id ?? token.sub ?? "";
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
