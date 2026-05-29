import { auth } from "@/auth";
import type { Session } from "next-auth";
import {
  canAccessAdmin,
  canManageContent,
  canManageUsers,
  canPublishContent,
} from "@/lib/auth/rbac";

export type AdminSession = Session & {
  user?: Session["user"] & {
    id?: string | null;
    role?: string | null;
  };
};

export type AdminAccessState =
  | { status: "authenticated"; session: AdminSession }
  | { status: "locked" }
  | { status: "denied"; session: AdminSession };

/**
 * Resolves admin route access for server components and layouts.
 * - locked: no session
 * - denied: session exists but lacks admin role
 * - authenticated: super_admin or content_admin
 */
export async function getAdminAccess(): Promise<AdminAccessState> {
  const session = await auth();

  if (!session) {
    return { status: "locked" };
  }

  const adminSession = session as AdminSession;

  if (!canAccessAdmin(adminSession)) {
    return { status: "denied", session: adminSession };
  }

  return { status: "authenticated", session: adminSession };
}

export async function requireAdminAccess(): Promise<AdminSession> {
  const access = await getAdminAccess();

  if (access.status === "locked") {
    throw new Error("ADMIN_AUTH_REQUIRED");
  }

  if (access.status === "denied") {
    throw new Error("ADMIN_ACCESS_DENIED");
  }

  return access.session;
}

export async function requireContentManagerAccess(): Promise<AdminSession> {
  const session = await requireAdminAccess();

  if (!canManageContent(session)) {
    throw new Error("ADMIN_CONTENT_ACCESS_DENIED");
  }

  return session;
}

export async function requirePublisherAccess(): Promise<AdminSession> {
  const session = await requireAdminAccess();

  if (!canPublishContent(session)) {
    throw new Error("ADMIN_PUBLISH_ACCESS_DENIED");
  }

  return session;
}

export async function requireSuperAdminAccess(): Promise<AdminSession> {
  const session = await requireAdminAccess();

  if (!canManageUsers(session)) {
    throw new Error("ADMIN_SUPER_ACCESS_DENIED");
  }

  return session;
}

export function getSessionUserId(session: AdminSession): string | null {
  return session.user?.id ?? null;
}
