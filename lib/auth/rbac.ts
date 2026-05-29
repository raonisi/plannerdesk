/**
 * Centralized Role-Based Access Control (RBAC) constants, types, and helpers for PlannerDesk.
 *
 * These helpers are pure functions that validate permissions on session or user objects
 * server-side. They do not perform database queries or import NextAuth libraries directly,
 * ensuring type safety and decoupling authorization decisions from raw DB fetches.
 */

export const ROLE_SUPER_ADMIN = "super_admin";
export const ROLE_CONTENT_ADMIN = "content_admin";
export const ROLE_MODERATOR = "moderator";
export const ROLE_VERIFIED_PLANNER = "verified_planner";
export const ROLE_ANONYMOUS_PUBLIC = "anonymous_public";

export const ALL_ROLES = [
  ROLE_SUPER_ADMIN,
  ROLE_CONTENT_ADMIN,
  ROLE_MODERATOR,
  ROLE_VERIFIED_PLANNER,
  ROLE_ANONYMOUS_PUBLIC,
] as const;

export type PlannerDeskRole = typeof ALL_ROLES[number];

export const ADMIN_ROLES: readonly PlannerDeskRole[] = [
  ROLE_SUPER_ADMIN,
  ROLE_CONTENT_ADMIN,
] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

export const FUTURE_COMMUNITY_ROLES: readonly PlannerDeskRole[] = [
  ROLE_MODERATOR,
] as const;

export const NON_ADMIN_ROLES: readonly PlannerDeskRole[] = [
  ROLE_VERIFIED_PLANNER,
  ROLE_ANONYMOUS_PUBLIC,
] as const;

export type NonAdminRole = typeof NON_ADMIN_ROLES[number];

/**
 * Normalizes a role value to a valid PlannerDeskRole.
 * If the input is null, undefined, or invalid, defaults to 'anonymous_public'.
 */
export function normalizeRole(role: string | null | undefined): PlannerDeskRole {
  if (!role) return ROLE_ANONYMOUS_PUBLIC;
  const lowerRole = role.trim().toLowerCase();
  if ((ALL_ROLES as readonly string[]).includes(lowerRole)) {
    return lowerRole as PlannerDeskRole;
  }
  return ROLE_ANONYMOUS_PUBLIC;
}

/**
 * Checks if a role string is an admin role (super_admin or content_admin).
 */
export function isAdminRole(role: string | null | undefined): boolean {
  const norm = normalizeRole(role);
  return (ADMIN_ROLES as readonly string[]).includes(norm);
}

/**
 * Checks if a role string is super_admin.
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return normalizeRole(role) === ROLE_SUPER_ADMIN;
}

/**
 * Checks if a role string is content_admin.
 */
export function isContentAdmin(role: string | null | undefined): boolean {
  return normalizeRole(role) === ROLE_CONTENT_ADMIN;
}

/**
 * Interface for user-like or session-like objects passed to permission checks.
 */
export interface UserSessionLike {
  role?: string | null;
  user?: {
    role?: string | null;
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

/**
 * Helper to extract role safely from user or session.
 */
function extractRole(userOrSession: UserSessionLike | null | undefined): PlannerDeskRole {
  if (!userOrSession) return ROLE_ANONYMOUS_PUBLIC;
  const role = userOrSession.role ?? userOrSession.user?.role;
  return normalizeRole(role);
}

/**
 * Checks if a user has access to the `/admin` shell or dashboard.
 * Requires super_admin or content_admin.
 */
export function canAccessAdmin(userOrSession: UserSessionLike | null | undefined): boolean {
  const role = extractRole(userOrSession);
  return isAdminRole(role);
}

/**
 * Checks if a user can create or edit content resources (insurers, claims, links, templates).
 * Requires super_admin or content_admin.
 */
export function canManageContent(userOrSession: UserSessionLike | null | undefined): boolean {
  const role = extractRole(userOrSession);
  return isAdminRole(role);
}

/**
 * Checks if a user can publish/unpublish content.
 * Requires super_admin or content_admin.
 */
export function canPublishContent(userOrSession: UserSessionLike | null | undefined): boolean {
  const role = extractRole(userOrSession);
  return isAdminRole(role);
}

/**
 * Checks if a user can manage users or edit roles.
 * Requires super_admin only.
 */
export function canManageUsers(userOrSession: UserSessionLike | null | undefined): boolean {
  const role = extractRole(userOrSession);
  return role === ROLE_SUPER_ADMIN;
}

/** Human-readable Korean label for admin UI and access-denied copy. */
export function roleDisplayLabel(role: string | null | undefined): string {
  const normalized = normalizeRole(role);

  if (normalized === ROLE_SUPER_ADMIN) return "슈퍼 관리자";
  if (normalized === ROLE_CONTENT_ADMIN) return "콘텐츠 관리자";
  if (normalized === ROLE_MODERATOR) return "모더레이터";
  if (normalized === ROLE_VERIFIED_PLANNER) return "인증 설계사";

  return "일반 사용자";
}

/**
 * Permission matrix (server-side only):
 * - super_admin: full /admin shell, content CRUD, publish, future user/role management
 * - content_admin: /admin shell, content CRUD, publish (insurers, claim documents, future KB)
 * - all other roles: /admin blocked at layout and server actions
 */
export const ADMIN_PERMISSION_MATRIX = {
  super_admin: {
    accessAdmin: true,
    manageContent: true,
    publishContent: true,
    manageUsers: true,
  },
  content_admin: {
    accessAdmin: true,
    manageContent: true,
    publishContent: true,
    manageUsers: false,
  },
} as const;
