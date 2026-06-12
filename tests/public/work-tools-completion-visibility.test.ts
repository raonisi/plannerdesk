import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  filterPublicWorkToolGroups,
  getWorkToolConfig,
  isWorkToolPublicVisible,
} from "@/lib/work-tools/work-tools-registry";

const ROOT = process.cwd();

describe("PR-BS-19C work-tools completion visibility", () => {
  it("hides placeholder mock exam tools", () => {
    for (const id of ["nonlife-mock", "life-mock", "variable-mock"]) {
      assert.equal(isWorkToolPublicVisible(getWorkToolConfig(id)), false, id);
    }
  });

  it("shows complete calculators and code search tools", () => {
    for (const id of [
      "insurance-age",
      "disease-code",
      "surgery-code",
      "disease-search",
      "silbi-calculator",
    ]) {
      assert.equal(isWorkToolPublicVisible(getWorkToolConfig(id)), true, id);
    }
  });

  it("work-tools client filters groups through registry", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.match(client, /filterPublicWorkToolGroups/);
    assert.match(client, /visibleToolGroups/);
    assert.match(client, /isWorkToolIdPublicVisible/);
  });

  it("filter removes empty groups after hiding tools", () => {
    const filtered = filterPublicWorkToolGroups([
      {
        title: "시험",
        tools: [
          { id: "nonlife-mock", label: "mock" },
          { id: "life-mock", label: "mock" },
        ],
      },
      {
        title: "계산",
        tools: [{ id: "insurance-age", label: "age" }],
      },
    ]);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.title, "계산");
  });
});
