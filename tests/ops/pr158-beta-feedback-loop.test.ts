import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  FEEDBACK_LOOP_CHECKLIST,
  PR158_ENTRY_CONDITIONS,
  PR158_FEEDBACK_VERDICTS,
  PR158_OPEN_CRITICAL_COUNT,
  PR158_SCOPE_NOTICE,
  PR158_TEST_FILES,
} from "@/lib/ops/beta-feedback-loop";
import { PR157_LAUNCH_VERDICTS } from "@/lib/ops/beta-launch-decision";

const ROOT = process.cwd();

describe("PR158 beta feedback loop (static, no form or send)", () => {
  it("hub forbids form send and links PR157 PR153", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-158-BETA-FEEDBACK-LOOP-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-157|PR157/);
    assert.match(hub, /PR-153|오류 제보/);
    assert.match(hub, /피드백|Feedback/);
    assert.match(hub, /폼|발송|구현 없음|metadata/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions met for PR157 conditional launch", () => {
    assert.notEqual(PR157_LAUNCH_VERDICTS.limitedBetaLaunch, "no_go");
    const unmet = PR158_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("feedback panel admin only no form prisma or send", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaFeedbackLoopPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaFeedbackLoopPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaFeedbackLoopPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(
      panel,
      /webhook|sendEmail|SMS|카카오|feedback form|allowlist|updateRole/i,
    );
    assert.match(panel, /overflow-x-auto/);
  });

  it("verdicts conditional ready not full inbox", () => {
    assert.equal(PR158_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared, "conditional");
    assert.equal(PR158_FEEDBACK_VERDICTS.collectionChannel, "not_ready");
    assert.equal(PR158_FEEDBACK_VERDICTS.deidentificationSafety, "ready");
  });

  it("checklist forbids raw prompt response and PII", () => {
    const ids = FEEDBACK_LOOP_CHECKLIST.map((c) => c.id);
    assert.ok(ids.includes("pii"));
    assert.ok(ids.includes("no-raw"));
    assert.ok(ids.includes("noform"));
    assert.ok(ids.includes("nodb"));
    const met = FEEDBACK_LOOP_CHECKLIST.filter((c) => c.status === "met").length;
    assert.ok(met >= 14);
  });

  it("scope forbids form send and operational db", () => {
    assert.match(PR158_SCOPE_NOTICE, /피드백|metadata/);
    assert.match(PR158_SCOPE_NOTICE, /폼|발송|운영 DB|allowlist/);
  });

  it("test files exist", () => {
    for (const rel of PR158_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
  });

  it("operating checklist links PR158 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-158-BETA-FEEDBACK-LOOP-OPS/);
  });

  it("PR140 deferred roadmap marks PR158 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR158-A 완료/);
  });

  it("build script does not run migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
  });
});
