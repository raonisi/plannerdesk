/**
 * PR-BS-19C: Work Tools visibility registry — complete tools only on public /work-tools.
 * Admin-only surfaces stay on /admin; unfinished tools are omitted (not disabled).
 */

export type WorkToolStatus =
  | "complete"
  | "ready"
  | "in_progress"
  | "draft"
  | "placeholder"
  | "admin_only"
  | "deprecated";

export type WorkToolVisibility = "public" | "admin";

export type WorkToolConfig = {
  id: string;
  status: WorkToolStatus;
  visibility: WorkToolVisibility;
  isAdminOnly?: boolean;
  requiresAdmin?: boolean;
};

const PUBLIC_READY_STATUSES: readonly WorkToolStatus[] = ["complete", "ready"];

/** Tools hidden from public Work Tools (mock / unfinished). */
const TOOL_OVERRIDES: Record<string, Partial<WorkToolConfig>> = {
};

const DEFAULT_CONFIG: Omit<WorkToolConfig, "id"> = {
  status: "complete",
  visibility: "public",
  isAdminOnly: false,
  requiresAdmin: false,
};

export function getWorkToolConfig(id: string): WorkToolConfig {
  const override = TOOL_OVERRIDES[id];
  return {
    id,
    ...DEFAULT_CONFIG,
    ...override,
  };
}

export function isWorkToolPublicVisible(config: WorkToolConfig): boolean {
  if (config.isAdminOnly) return false;
  if (config.requiresAdmin) return false;
  if (config.visibility !== "public") return false;
  if (config.status === "admin_only") return false;
  if (!PUBLIC_READY_STATUSES.includes(config.status)) return false;
  return true;
}

export function isWorkToolIdPublicVisible(toolId: string): boolean {
  return isWorkToolPublicVisible(getWorkToolConfig(toolId));
}

export type WorkToolGroupLike<T extends { id: string }> = {
  title: string;
  description?: string;
  tools: T[];
};

/** Filters tool groups for anonymous/public Work Tools rendering. */
export function filterPublicWorkToolGroups<T extends { id: string }>(
  groups: WorkToolGroupLike<T>[],
): WorkToolGroupLike<T>[] {
  return groups
    .map((group) => ({
      ...group,
      tools: group.tools.filter((tool) => isWorkToolIdPublicVisible(tool.id)),
    }))
    .filter((group) => group.tools.length > 0);
}

export function listHiddenWorkToolIds(allIds: string[]): string[] {
  return allIds.filter((id) => !isWorkToolIdPublicVisible(id));
}

export function listPublicWorkToolIds(allIds: string[]): string[] {
  return allIds.filter((id) => isWorkToolIdPublicVisible(id));
}
