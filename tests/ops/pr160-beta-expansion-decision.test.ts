import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  FEATURE_EXPANSION_FINAL,
  PR157_TO_159_SYNTHESIS,
  PR160_ENTRY_CONDITIONS,
  PR160_EXPANSION_VERDICTS,
  PR160_OPEN_CRITICAL_COUNT,
  PR160_SCOPE_NOTICE,
  PR160_TEST_FILES,
} from "@/lib/ops/beta-expansion-decision";
import { PR159_INCIDENT_VERDICTS } from "@/lib/ops/beta-incident-drill";
import { PR158_FEEDBACK_VERDICTS } from "@/lib/ops/beta-feedback-loop";

const ROOT = process.cwd();

describe("PR160 beta expansion decision (static, no expansion execution)", () => {
  it("hub forbids expansion and links PR157 PR159", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-160-BETA-EXPANSION-DECISION-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR157~PR159|PR-157/);
    assert.match(hub, /확대|Expansion/);
    assert.match(hub, /beta user|실제 확대 없음|실행 없음/);
    assert.match(hub, /Conditional Expansion|Maintain/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions met except codex", () => {
    assert.notEqual(PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared, "not_ready");
    assert.notEqual(PR159_INCIDENT_VERDICTS.incidentDrillPrepared, "not_ready");
    const unmet = PR160_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 1);
    assert.equal(unmet[0]?.id, "codex");
  });

  it("synthesis covers PR157 through PR159", () => {
    assert.equal(PR157_TO_159_SYNTHESIS.length, 3);
    const prs = PR157_TO_159_SYNTHESIS.map((r) => r.pr).join(" ");
    assert.match(prs, /PR157/);
    assert.match(prs, /PR158/);
    assert.match(prs, /PR159/);
  });

  it("expansion panel admin only no beta user or allowlist writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaExpansionDecisionPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaExpansionDecisionPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaExpansionDecisionPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(
      panel,
      /beta user|allowlist|updateRole|invite|발송|deploy/i,
    );
    assert.match(panel, /overflow-x-auto/);
  });

  it("verdicts conditional expansion not expansion before codex", () => {
    assert.equal(PR160_OPEN_CRITICAL_COUNT, 0);
    assert.equal(
      PR160_EXPANSION_VERDICTS.limitedBetaExpansion,
      "conditional_expansion",
    );
    assert.equal(
      PR160_EXPANSION_VERDICTS.overallUntilCodex,
      "conditional_expansion",
    );
    assert.equal(PR160_EXPANSION_VERDICTS.immediateExpansion, "maintain");
    assert.notEqual(PR160_EXPANSION_VERDICTS.limitedBetaExpansion, "expansion");
  });

  it("answer assistant expansion held not widened", () => {
    const aa = FEATURE_EXPANSION_FINAL.find((f) =>
      f.feature.includes("Answer Assistant"),
    );
    assert.ok(aa);
    assert.equal(aa?.expansion, "hold");
  });

  it("scope forbids expansion execution and operational db", () => {
    assert.match(PR160_SCOPE_NOTICE, /확대|판단/);
    assert.match(PR160_SCOPE_NOTICE, /beta user|allowlist|운영 DB/);
  });

  it("test files exist", () => {
    for (const rel of PR160_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
  });

  it("operating checklist links PR160 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-160-BETA-EXPANSION-DECISION-OPS/);
  });

  it("PR140 deferred roadmap marks PR160 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR160-A 완료/);
  });

  it("build script does not run migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
  });
});
