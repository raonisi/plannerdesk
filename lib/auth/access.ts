import { auth } from "@/auth";
import type { Session } from "next-auth";
import {
  canAccessAdmin,
  canAccessWorkTools,
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

/** Alias for content_admin and super_admin content CRUD guards. */
export const requireContentAdmin = requireContentManagerAccess;

export type WorkToolsAccessState =
  | { status: "authenticated"; session: AdminSession }
  | { status: "locked" }
  | { status: "denied"; session: AdminSession };

/**
 * Resolves /work-tools and /api/work-tools/* access.
 * - locked: no session
 * - denied: session without verified_planner or admin role
 * - authenticated: verified_planner or admin
 */
export async function getWorkToolsAccess(): Promise<WorkToolsAccessState> {
  const session = await auth();

  if (!session) {
    return { status: "locked" };
  }

  const workSession = session as AdminSession;

  if (!canAccessWorkTools(workSession)) {
    return { status: "denied", session: workSession };
  }

  return { status: "authenticated", session: workSession };
}

export async function requireWorkToolsAccess(): Promise<AdminSession> {
  const access = await getWorkToolsAccess();

  if (access.status === "locked") {
    throw new Error("WORK_TOOLS_AUTH_REQUIRED");
  }

  if (access.status === "denied") {
    throw new Error("WORK_TOOLS_ACCESS_DENIED");
  }

  return access.session;
}
