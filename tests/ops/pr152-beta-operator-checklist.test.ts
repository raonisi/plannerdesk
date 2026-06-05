import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  CRITICAL_HALT_CRITERIA,
  DURING_LAUNCH_CHECKLIST,
  OPERATION_RECORD_RULES,
  PRE_LAUNCH_CHECKLIST,
  PR152_ENTRY_CONDITIONS,
  PR152_OPERATOR_VERDICTS,
  PR152_OPEN_CRITICAL_COUNT,
  PR152_SCOPE_NOTICE,
} from "@/lib/ops/beta-operator-checklist";
import { PR151_DRY_RUN_VERDICTS } from "@/lib/ops/external-beta-dry-run";

const ROOT = process.cwd();

describe("PR152 beta operator checklist (static, no launch)", () => {
  it("hub forbids launch and links PR151 PR150", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-152-BETA-OPERATOR-CHECKLIST-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-151/);
    assert.match(hub, /PR-150/);
    assert.match(hub, /체크리스트|Checklist/i);
    assert.match(hub, /실행 없음|실행 판단은 PR157/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("PR151 entry allows operator checklist", () => {
    assert.equal(PR151_DRY_RUN_VERDICTS.externalBetaDryRun, "conditional_go");
    assert.equal(PR151_DRY_RUN_VERDICTS.pr152Entry, "conditional_go");
    const unmet = PR152_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("checklist panel admin only no deploy or role writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaOperatorChecklistPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaOperatorChecklistPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaOperatorChecklistPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /deploy|push|allowlist|updateRole|beta user/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("pre during post and halt matrices populated", () => {
    assert.ok(PRE_LAUNCH_CHECKLIST.length >= 15);
    assert.ok(DURING_LAUNCH_CHECKLIST.length >= 10);
    assert.ok(CRITICAL_HALT_CRITERIA.length >= 10);
    assert.ok(OPERATION_RECORD_RULES.length >= 8);
    const blocked = PRE_LAUNCH_CHECKLIST.filter((c) => c.status === "blocked");
    assert.equal(blocked.length, 0);
  });

  it("operator verdicts conditional ready pr157 not ready", () => {
    assert.equal(PR152_OPERATOR_VERDICTS.checklistPrepared, "conditional_ready");
    assert.equal(PR152_OPERATOR_VERDICTS.preLaunchReady, "conditional_ready");
    assert.equal(PR152_OPERATOR_VERDICTS.pr157Execution, "not_ready");
    assert.equal(PR152_OPEN_CRITICAL_COUNT, 0);
  });

  it("scope forbids launch and pii in records", () => {
    assert.match(PR152_SCOPE_NOTICE, /체크리스트/);
    assert.match(PR152_SCOPE_NOTICE, /allowlist|beta user/);
    const forbidden = readFileSync(
      join(ROOT, "lib/ops/beta-operator-checklist.ts"),
      "utf8",
    );
    assert.match(forbidden, /고객정보/);
    assert.match(forbidden, /prompt\/response 원문/);
  });

  it("during launch has critical halt conditions", () => {
    const text = DURING_LAUNCH_CHECKLIST.map((r) => r.haltCondition).join(" ");
    assert.match(text, /Critical/);
  });

  it("operating checklist links PR152 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-152-BETA-OPERATOR-CHECKLIST-OPS/);
  });

  it("PR140 deferred roadmap marks PR152 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR152-A 완료/);
  });
});
