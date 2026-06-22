import { NextResponse } from "next/server";
import { getWorkToolsAccess } from "@/lib/auth/access";
import { canAccessAdmin } from "@/lib/auth/rbac";
import type { WorkToolAccessLevel } from "@/lib/work-tools/work-tools-registry";
import {
  isWorkToolsApiPublicReadAllowed,
  requiredAccessLevelForWorkToolsApi,
  type WorkToolsApiRouteId,
} from "@/lib/work-tools/work-tools-registry";

export type WorkToolsGuardResult =
  | { ok: true; access: WorkToolAccessLevel }
  | { ok: false; status: 401 | 403; code: "AUTH_REQUIRED" | "FORBIDDEN" };

function guardErrorResponse(result: Extract<WorkToolsGuardResult, { ok: false }>) {
  if (result.status === 401) {
    return NextResponse.json({ error: "Unauthorized", code: result.code }, { status: 401 });
  }
  return NextResponse.json({ error: "Forbidden", code: result.code }, { status: 403 });
}

/**
 * PR-SEC-01: resolves protected work-tools access from server session only.
 * Client headers, query params, and body role hints are never trusted.
 */
export async function resolveWorkToolsGuard(
  required: WorkToolAccessLevel,
): Promise<WorkToolsGuardResult> {
  if (required === "public") {
    return { ok: true, access: "public" };
  }

  const access = await getWorkToolsAccess();

  if (access.status === "locked") {
    return { ok: false, status: 401, code: "AUTH_REQUIRED" };
  }

  if (required === "admin") {
    if (!canAccessAdmin(access.session)) {
      return { ok: false, status: 403, code: "FORBIDDEN" };
    }
    return { ok: true, access: "admin" };
  }

  if (access.status === "denied") {
    return { ok: false, status: 403, code: "FORBIDDEN" };
  }

  return { ok: true, access: "verified_planner" };
}

/**
 * PR-SEC-01: registry-backed public read guard for GET /api/work-tools/*.
 * Returns null when anonymous read is allowed; otherwise 401/403 JSON.
 */
export async function workToolsPublicReadRouteGuard(
  routeId: WorkToolsApiRouteId,
): Promise<NextResponse | null> {
  if (isWorkToolsApiPublicReadAllowed(routeId)) {
    return null;
  }

  const required = requiredAccessLevelForWorkToolsApi(routeId);
  if (required === "deny") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const result = await resolveWorkToolsGuard(required);
  if (!result.ok) {
    return guardErrorResponse(result);
  }

  return null;
}

/** Planner/admin guard for protected /api/work-tools/* write or sensitive routes. */
export async function workToolsRouteGuard(
  required: WorkToolAccessLevel = "verified_planner",
): Promise<NextResponse | null> {
  const result = await resolveWorkToolsGuard(required);
  if (!result.ok) {
    return guardErrorResponse(result);
  }
  return null;
}
