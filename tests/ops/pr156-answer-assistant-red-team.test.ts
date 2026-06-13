import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  AA_ACCESS_RED_TEAM,
  PR156_ENTRY_CONDITIONS,
  PR156_OPEN_CRITICAL_COUNT,
  PR156_RED_TEAM_INPUT_FIXTURES,
  PR156_RED_TEAM_VERDICTS,
  PR156_SCOPE_NOTICE,
  PR156_TEST_FILES,
} from "@/lib/ops/answer-assistant-red-team";
import { PR155_REGRESSION_VERDICTS } from "@/lib/ops/admin-access-regression";

const ROOT = process.cwd();

describe("PR156 Answer Assistant red-team (static, no provider)", () => {
  it("hub forbids provider calls and links PR155 PR148", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-156-ANSWER-ASSISTANT-RED-TEAM-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-155/);
    assert.match(hub, /PR-148|AI/i);
    assert.match(hub, /red-team|Red-Team/i);
    assert.match(hub, /provider|API 호출/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("PR155 entry allows AA red-team", () => {
    assert.equal(
      PR155_REGRESSION_VERDICTS.regressionReady,
      "conditional_ready",
    );
    const unmet = PR156_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("red-team panel admin only no provider or allowlist writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminAnswerAssistantRedTeamPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminAnswerAssistantRedTeamPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminAnswerAssistantRedTeamPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /fetch\(|openai|anthropic/i);
    assert.doesNotMatch(panel, /allowlist.*=|updateRole|migrate deploy/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("access red-team targets cover public verified allowlist", () => {
    assert.ok(AA_ACCESS_RED_TEAM.length >= 7);
    const scenarios = AA_ACCESS_RED_TEAM.map((r) => r.scenario).join(" ");
    assert.match(scenarios, /public/i);
    assert.match(scenarios, /allowlist/i);
    assert.match(scenarios, /verified/i);
  });

  it("input fixtures use fake data only", () => {
    const combined = PR156_RED_TEAM_INPUT_FIXTURES.map((f) => f.queryCore).join(
      " ",
    );
    assert.doesNotMatch(combined, /\d{6}-\d{7}/);
    assert.doesNotMatch(combined, /010-\d{4}-\d{4}/);
    assert.ok(PR156_RED_TEAM_INPUT_FIXTURES.length >= 10);
  });

  it("verdicts conditional ready no new dependencies", () => {
    assert.equal(PR156_RED_TEAM_VERDICTS.redTeamReady, "conditional_ready");
    assert.equal(PR156_RED_TEAM_VERDICTS.staticRedTeamPass, true);
    assert.equal(PR156_OPEN_CRITICAL_COUNT, 0);
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    assert.equal(pkg.scripts["test:e2e"], undefined);
  });

  it("scope forbids provider and customer data", () => {
    assert.match(PR156_SCOPE_NOTICE, /red-team|Answer Assistant/);
    assert.match(PR156_SCOPE_NOTICE, /provider|고객정보|allowlist/);
  });

  it("test files exist including red-team.test.ts", () => {
    for (const rel of PR156_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
    const redTeam = readFileSync(
      join(ROOT, "tests/answer-assistant/red-team.test.ts"),
      "utf8",
    );
    assert.match(redTeam, /PR156 Answer Assistant red-team/);
  });

  it("operating checklist links PR156 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-156-ANSWER-ASSISTANT-RED-TEAM-OPS/);
  });

  it("PR140 deferred roadmap marks PR156 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR156-A 완료/);
  });
});
