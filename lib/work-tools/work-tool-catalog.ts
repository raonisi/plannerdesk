/**
 * PR-FEATURE-GAP-02: Work tool ids derived from WORK_TOOL_GROUPS — do not edit manually.
 */

import { getAllWorkToolIds } from "@/lib/work-tools/work-tool-groups";

/** All tool ids from the canonical group catalog (same source as /work-tools). */
export const WORK_TOOL_CATALOG_IDS = getAllWorkToolIds();

export type WorkToolCatalogId = ReturnType<typeof getAllWorkToolIds>[number];
