import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR140_TO_156_SYNTHESIS,
  PR157_ENTRY_CONDITIONS,
  PR157_LAUNCH_VERDICTS,
  PR157_OPEN_CRITICAL_COUNT,
  PR157_SCOPE_NOTICE,
  PR157_TEST_FILES,
} from "@/lib/ops/beta-launch-decision";

const ROOT = process.cwd();

describe("PR157 beta launch decision (static, no execution)", () => {
  it("hub forbids execution and links PR156 PR150", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-157-BETA-LAUNCH-DECISION-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-156/);
    assert.match(hub, /PR-150|PR140/);
    assert.match(hub, /실행|Launch|판단/);
    assert.match(hub, /실행 없음|배포/);
    assert.match(hub, /Conditional Launch/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("PR156 entry conditions met except codex", () => {
    const unmet = PR157_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 1);
    assert.equal(unmet[0]?.id, "codex");
  });

  it("synthesis covers PR140 through PR156", () => {
    assert.equal(PR140_TO_156_SYNTHESIS.length, 17);
    const prs = PR140_TO_156_SYNTHESIS.map((r) => r.pr).join(" ");
    assert.match(prs, /PR140/);
    assert.match(prs, /PR156/);
    assert.match(prs, /PR154/);
    assert.match(prs, /PR155/);
  });

  it("launch panel admin only no deploy or role writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaLaunchDecisionPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaLaunchDecisionPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaLaunchDecisionPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /deploy|allowlist|updateRole|beta user|발송/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("verdicts conditional launch not launch before codex", () => {
    assert.equal(PR157_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR157_LAUNCH_VERDICTS.limitedBetaLaunch, "conditional_launch");
    assert.equal(PR157_LAUNCH_VERDICTS.overallUntilCodex, "conditional_launch");
    assert.equal(PR157_LAUNCH_VERDICTS.immediateExecution, "hold");
    assert.notEqual(PR157_LAUNCH_VERDICTS.limitedBetaLaunch, "launch");
    assert.equal(PR157_LAUNCH_VERDICTS.publicBeta, "no_go");
    assert.equal(PR157_LAUNCH_VERDICTS.paidBeta, "no_go");
  });

  it("scope forbids execution and operational db", () => {
    assert.match(PR157_SCOPE_NOTICE, /판단|제한 베타/);
    assert.match(PR157_SCOPE_NOTICE, /배포|beta user|allowlist|운영 DB/);
  });

  it("test files exist", () => {
    for (const rel of PR157_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
  });

  it("operating checklist links PR157 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-157-BETA-LAUNCH-DECISION-OPS/);
  });

  it("PR140 deferred roadmap marks PR157 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR157-A 완료/);
  });

  it("build script does not run migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
  });
});
