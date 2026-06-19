import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  listHiddenWorkToolIds,
  listPublicWorkToolIds,
} from "@/lib/work-tools/work-tools-registry";
import { getAllWorkToolIds } from "@/lib/work-tools/work-tool-groups";

const ROOT = process.cwd();

const ALL_TOOL_IDS = getAllWorkToolIds();

describe("PR-BS-19C unfinished tools hidden", () => {
  it("registry marks exam files and newsletter tools as public planner resources", () => {
    const visible = listPublicWorkToolIds([...ALL_TOOL_IDS]);
    for (const id of [
      "nonlife-textbook",
      "life-textbook",
      "variable-textbook",
      "nonlife-mock",
      "life-mock",
      "variable-mock",
      "insurer-newsletter",
    ]) {
      assert.ok(visible.includes(id), id);
    }
  });

  it("registry has no hidden placeholders in the published work-tools set", () => {
    const hidden = listHiddenWorkToolIds([...ALL_TOOL_IDS]);
    assert.deepEqual(hidden, []);
  });

  it("work-tools client does not render disabled placeholders for mock tools", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.doesNotMatch(client, /nonlife-mock[\s\S]{0,200}disabled/i);
    assert.match(client, /filterPublicWorkToolGroups/);
  });
});
