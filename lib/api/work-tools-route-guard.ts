import { NextResponse } from "next/server";
import { getWorkToolsAccess } from "@/lib/auth/access";

/** PR-BS-19C: read-only public work-tools APIs — no session required. */
export async function workToolsPublicReadRouteGuard(): Promise<NextResponse | null> {
  return null;
}

/** Planner/admin guard for protected /api/work-tools/* write or sensitive routes. */
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
