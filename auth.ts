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

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  /**
   * Use the Prisma Adapter to persist user, account, and verification tokens.
   */
  adapter: PrismaAdapter(prisma),

  /**
   * Providers will be added in a future PR.
   * An empty array means no login method is available yet.
   * This is intentional for the foundation setup.
   */
  providers: [],

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
