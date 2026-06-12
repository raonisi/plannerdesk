import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { listHiddenWorkToolIds } from "@/lib/work-tools/work-tools-registry";

const ROOT = process.cwd();

const ALL_TOOL_IDS = [
  "planner-stats",
  "disease-search",
  "silbi-calculator",
  "insurance-age",
  "bmi-calculator",
  "currency-value",
  "loan",
  "savings",
  "net-salary",
  "earned-tax",
  "comp-tax",
  "inheritance-tax",
  "card-deduction",
  "vat",
  "surgery-code",
  "disease-code",
  "hospital-pharmacy",
  "silson24",
  "hidden-insurance",
  "lost-health-standard",
  "car-face-quote",
  "nonlife-mock",
  "life-mock",
  "variable-mock",
  "claim-docs-guide",
] as const;

describe("PR-BS-19C unfinished tools hidden", () => {
  it("registry marks mock tools as hidden", () => {
    const hidden = listHiddenWorkToolIds([...ALL_TOOL_IDS]);
    for (const id of ["nonlife-mock", "life-mock", "variable-mock"]) {
      assert.ok(hidden.includes(id), id);
    }
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
