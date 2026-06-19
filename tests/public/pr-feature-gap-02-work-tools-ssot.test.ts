import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { WORK_TOOL_CATALOG_IDS } from "@/lib/work-tools/work-tool-catalog";
import { getAllWorkToolIds, WORK_TOOL_GROUPS } from "@/lib/work-tools/work-tool-groups";
import {
  countPublicWorkTools,
  filterPublicWorkToolGroups,
  getAllWorkTools,
  getPublicWorkTools,
  getWorkToolConfig,
  getWorkToolSurface,
  isPublicWorkTool,
  isWorkToolIdPublicVisible,
  isWorkToolPublicVisible,
} from "@/lib/work-tools/work-tools-registry";
import { resolveVisiblePublicWorkTools } from "@/lib/public/public-surface-resolvers";

const ROOT = process.cwd();

describe("PR-FEATURE-GAP-02 work tools catalog SSOT", () => {
  it("catalog ids are derived from WORK_TOOL_GROUPS — no manual duplicate list", () => {
    assert.deepEqual([...WORK_TOOL_CATALOG_IDS], getAllWorkToolIds());
  });

  it("home resolver count matches countPublicWorkTools and /work-tools filter", () => {
    const home = resolveVisiblePublicWorkTools();
    const registryCount = countPublicWorkTools();
    const pageVisible = filterPublicWorkToolGroups(WORK_TOOL_GROUPS).flatMap(
      (group) => group.tools,
    ).length;

    assert.equal(home.count, registryCount);
    assert.equal(registryCount, pageVisible);
    assert.equal(registryCount, getWorkToolSurface().count);
    assert.equal(registryCount, getPublicWorkTools().length);
  });

  it("every registry tool id appears in catalog with no orphan ids", () => {
    const catalogSet = new Set(WORK_TOOL_CATALOG_IDS);
    const groupIds = getAllWorkToolIds();
    assert.equal(catalogSet.size, groupIds.length);
    for (const id of groupIds) {
      assert.ok(catalogSet.has(id), `missing catalog id: ${id}`);
    }
  });

  it("has no duplicate tool ids in WORK_TOOL_GROUPS", () => {
    const ids = getAllWorkToolIds();
    assert.equal(new Set(ids).size, ids.length);
  });

  it("excludes non-public statuses from public count", () => {
    const draftLike: Array<Parameters<typeof getWorkToolConfig>[0]> = [];
    for (const tool of getAllWorkTools()) {
      const config = getWorkToolConfig(tool.id);
      if (!isWorkToolPublicVisible(config)) {
        draftLike.push(tool.id);
      }
    }
    for (const id of draftLike) {
      assert.equal(isPublicWorkTool(id), false);
      assert.equal(
        getPublicWorkTools().some((tool) => tool.id === id),
        false,
      );
    }
    assert.equal(
      countPublicWorkTools(),
      getAllWorkTools().filter((tool) => isPublicWorkTool(tool.id)).length,
    );
  });

  it("does not hardcode tool count in source", () => {
    for (const rel of [
      "lib/work-tools/work-tool-catalog.ts",
      "lib/work-tools/work-tools-registry.ts",
      "app/page.tsx",
      "components/dashboard/home-public-stats-strip.tsx",
    ]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /\b56\b/, rel);
    }
  });

  it("work-tools client imports WORK_TOOL_GROUPS SSOT", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.match(client, /WORK_TOOL_GROUPS/);
    assert.doesNotMatch(client, /const toolGroups:/);
  });

  it("adding a tool to WORK_TOOL_GROUPS is reflected by selectors", () => {
    const syntheticId = "ssot-synthetic-tool-gap-02";
    const syntheticGroups = [
      ...WORK_TOOL_GROUPS,
      {
        title: "Synthetic",
        description: "test",
        tools: [
          {
            id: syntheticId,
            label: "Synthetic",
            description: "test",
            kind: "internal" as const,
            href: "/work-tools",
          },
        ],
      },
    ];
    const withSynthetic = filterPublicWorkToolGroups(syntheticGroups).flatMap(
      (group) => group.tools,
    );
    assert.equal(
      withSynthetic.length,
      countPublicWorkTools() + 1,
      "public selector should include new complete tool",
    );
    assert.ok(withSynthetic.some((tool) => tool.id === syntheticId));
  });

  it("isWorkToolIdPublicVisible falls back safely for unknown ids", () => {
    assert.equal(isWorkToolIdPublicVisible("unknown-gap-02-tool"), true);
    assert.equal(isPublicWorkTool("unknown-gap-02-tool"), true);
  });
});
