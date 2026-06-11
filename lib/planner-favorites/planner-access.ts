import type { WorkToolsAccessState } from "@/lib/auth/access";

/** Planner favorites UI and local preference writes require verified planner or admin session. */
export function isPlannerFavoritesEnabled(
  access: WorkToolsAccessState,
): boolean {
  return access.status === "authenticated";
}
