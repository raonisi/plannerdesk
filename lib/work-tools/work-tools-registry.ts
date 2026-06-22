/**
 * PR-BS-19C / PR-FEATURE-GAP-02: Work Tools visibility registry and public selectors.
 * Catalog SSOT: `WORK_TOOL_GROUPS` in work-tool-groups.ts.
 */

import { getAllWorkToolIds, WORK_TOOL_GROUPS } from "@/lib/work-tools/work-tool-groups";
import type {
  WorkToolGroup,
  WorkToolItem,
  WorkToolKind,
} from "@/lib/work-tools/work-tool-groups";

/** PR-SEC-01: minimum role required to execute a tool or API route. */
export type WorkToolAccessLevel = "public" | "verified_planner" | "admin";

/** PR-SEC-01: how a tool exposes functionality on the public surface. */
export type WorkToolExposure =
  | "catalog_only"
  | "client_only"
  | "server_read"
  | "server_write";

export const WORK_TOOLS_API_ROUTE_IDS = [
  "diseases",
  "diseases/meta",
  "disease-codes",
  "disease-codes/meta",
  "disease-codes/coverages",
  "surgery-codes",
  "surgery-codes/meta",
  "storage",
] as const;

export type WorkToolsApiRouteId = (typeof WORK_TOOLS_API_ROUTE_IDS)[number];

type WorkToolsApiRoutePolicy = {
  routeId: WorkToolsApiRouteId;
  accessLevel: WorkToolAccessLevel;
  exposure: WorkToolExposure;
  /** When set, anonymous read is allowed only if every linked tool is catalog-public. */
  linkedToolIds?: readonly string[];
};

const DEFAULT_EXPOSURE_BY_KIND: Record<WorkToolKind, WorkToolExposure> = {
  stats: "client_only",
  search: "server_read",
  calculator: "client_only",
  external: "client_only",
  newsletter: "server_read",
  folder: "server_read",
  internal: "catalog_only",
  accordion: "client_only",
};

/**
 * PR-SEC-01: API route access SSOT — page, API, and registry read the same policy.
 * Unlisted routes default deny at the guard layer.
 */
export const WORK_TOOLS_API_ROUTE_POLICIES: readonly WorkToolsApiRoutePolicy[] = [
  {
    routeId: "diseases",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: ["disease-search"],
  },
  {
    routeId: "diseases/meta",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: ["disease-search"],
  },
  {
    routeId: "disease-codes",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: ["disease-code"],
  },
  {
    routeId: "disease-codes/meta",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: ["disease-code"],
  },
  {
    routeId: "disease-codes/coverages",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: ["disease-code"],
  },
  {
    routeId: "surgery-codes",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: ["surgery-code"],
  },
  {
    routeId: "surgery-codes/meta",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: ["surgery-code"],
  },
  {
    routeId: "storage",
    accessLevel: "public",
    exposure: "server_read",
    linkedToolIds: [
      "insurer-newsletter",
      "nonlife-textbook",
      "life-textbook",
      "variable-textbook",
      "nonlife-mock",
      "life-mock",
      "variable-mock",
    ],
  },
];

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
  accessLevel?: WorkToolAccessLevel;
  exposure?: WorkToolExposure;
};

export type WorkToolAccessPolicy = {
  accessLevel: WorkToolAccessLevel;
  exposure: WorkToolExposure;
  catalogVisible: boolean;
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

export function getWorkToolItem(id: string): WorkToolItem | undefined {
  return getAllWorkTools().find((tool) => tool.id === id);
}

export function getWorkToolConfig(id: string): WorkToolConfig {
  const override = TOOL_OVERRIDES[id];
  return {
    id,
    ...DEFAULT_CONFIG,
    ...override,
  };
}

function resolveConfigAccessLevel(
  config: WorkToolConfig,
  kind: WorkToolKind,
): WorkToolAccessLevel {
  if (config.accessLevel) return config.accessLevel;
  if (config.isAdminOnly || config.requiresAdmin || config.visibility === "admin") {
    return "admin";
  }
  if (config.status === "admin_only") return "admin";
  if (kind === "internal") return "verified_planner";
  return "public";
}

/** PR-SEC-01: unified tool access policy for page badges and server guards. */
export function getWorkToolAccessPolicy(toolId: string): WorkToolAccessPolicy {
  const config = getWorkToolConfig(toolId);
  const kind = getWorkToolItem(toolId)?.kind ?? "internal";
  const accessLevel = resolveConfigAccessLevel(config, kind);
  const exposure = config.exposure ?? DEFAULT_EXPOSURE_BY_KIND[kind];
  return {
    accessLevel,
    exposure,
    catalogVisible: isWorkToolPublicVisible(config),
  };
}

export function resolveWorkToolsApiRoutePolicy(
  routeId: string,
): WorkToolsApiRoutePolicy | null {
  return (
    WORK_TOOLS_API_ROUTE_POLICIES.find((policy) => policy.routeId === routeId) ??
    null
  );
}

export function isWorkToolsApiRouteRegistered(
  routeId: string,
): routeId is WorkToolsApiRouteId {
  return (WORK_TOOLS_API_ROUTE_IDS as readonly string[]).includes(routeId);
}

/**
 * True when an anonymous GET may proceed for a registered public server_read route.
 * Unknown routes and non-public policies return false (default deny).
 */
export function isWorkToolsApiPublicReadAllowed(routeId: string): boolean {
  const policy = resolveWorkToolsApiRoutePolicy(routeId);
  if (!policy) return false;
  if (policy.accessLevel !== "public") return false;
  if (policy.exposure !== "server_read") return false;
  if (policy.linkedToolIds?.length) {
    return policy.linkedToolIds.every((toolId) =>
      isWorkToolIdPublicVisible(toolId),
    );
  }
  return true;
}

export function requiredAccessLevelForWorkToolsApi(
  routeId: string,
): WorkToolAccessLevel | "deny" {
  const policy = resolveWorkToolsApiRoutePolicy(routeId);
  if (!policy) return "deny";
  if (policy.linkedToolIds?.length) {
    const toolsPublic = policy.linkedToolIds.every((toolId) =>
      isWorkToolIdPublicVisible(toolId),
    );
    if (!toolsPublic) return "deny";
  }
  return policy.accessLevel;
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

export function isPublicWorkTool(toolId: string): boolean {
  return isWorkToolIdPublicVisible(toolId);
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

export function getAllWorkTools(): WorkToolItem[] {
  return WORK_TOOL_GROUPS.flatMap((group) => group.tools);
}

export function getPublicWorkToolGroups(): WorkToolGroup[] {
  return filterPublicWorkToolGroups(WORK_TOOL_GROUPS) as WorkToolGroup[];
}

export function getPublicWorkTools(): WorkToolItem[] {
  return getPublicWorkToolGroups().flatMap((group) => group.tools);
}

export function getWorkToolSurface(): {
  count: number;
  toolIds: string[];
} {
  const tools = getPublicWorkTools();
  return {
    count: tools.length,
    toolIds: tools.map((tool) => tool.id),
  };
}

export function listHiddenWorkToolIds(allIds: string[]): string[] {
  return allIds.filter((id) => !isWorkToolIdPublicVisible(id));
}

export function listPublicWorkToolIds(allIds: string[]): string[] {
  return allIds.filter((id) => isWorkToolIdPublicVisible(id));
}

/** Count of Work Tools panels visible on /work-tools — same selector as the page UI. */
export function countPublicWorkTools(): number {
  return getWorkToolSurface().count;
}

export { WORK_TOOL_GROUPS, getAllWorkToolIds };
