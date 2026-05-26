import { auth } from "@/auth";
import type { Session } from "next-auth";
import {
  canAccessAdmin,
  canManageContent,
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
  | { status: "denied" };

export async function getInsurerAdminAccess(): Promise<AdminAccessState> {
  const session = await auth();

  if (!session) {
    return { status: "locked" };
  }

  if (!canAccessAdmin(session) || !canManageContent(session)) {
    return { status: "denied" };
  }

  return { status: "authenticated", session: session as AdminSession };
}

export async function requireInsurerContentManager() {
  const session = await auth();

  if (!session || !canAccessAdmin(session) || !canManageContent(session)) {
    throw new Error("ADMIN_CONTENT_ACCESS_DENIED");
  }

  return session as AdminSession;
}

export async function requireInsurerPublisher() {
  const session = await auth();

  if (!session || !canAccessAdmin(session) || !canPublishContent(session)) {
    throw new Error("ADMIN_PUBLISH_ACCESS_DENIED");
  }

  return session as AdminSession;
}

export function getSessionUserId(session: AdminSession) {
  return session.user?.id ?? null;
}
