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
  it("shows exam materials and newsletter tools as planner-ready resources", () => {
    for (const id of [
      "insurer-newsletter",
      "nonlife-textbook",
      "life-textbook",
      "variable-textbook",
      "nonlife-mock",
      "life-mock",
      "variable-mock",
    ]) {
      assert.equal(isWorkToolPublicVisible(getWorkToolConfig(id)), true, id);
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

  it("filter keeps complete exam groups and removes empty groups only", () => {
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
    assert.equal(filtered.length, 2);
    assert.equal(filtered[0]?.title, "시험");
    assert.equal(filtered[1]?.title, "계산");
  });

  it("work-tools default screen prioritizes newsletter, exam files, and financial calculators", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.match(client, /PRIMARY_WORK_DESK_SECTIONS/);
    assert.match(client, /"insurer-newsletter"/);
    assert.match(client, /"nonlife-mock"/);
    assert.match(client, /"nonlife-textbook"/);
    assert.match(client, /"currency-value"/);
    assert.match(client, /"loan"/);
    assert.match(client, /"savings"/);
    assert.match(client, /보조 업무 도구/);
  });
});
