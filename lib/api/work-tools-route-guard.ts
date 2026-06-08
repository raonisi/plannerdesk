import { NextResponse } from "next/server";
import { getWorkToolsAccess } from "@/lib/auth/access";

/** Server-side guard for /api/work-tools/* — returns 401/403 without internal details. */
export async function workToolsRouteGuard(): Promise<NextResponse | null> {
  const access = await getWorkToolsAccess();

  if (access.status === "locked") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (access.status === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
