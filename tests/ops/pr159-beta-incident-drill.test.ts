import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  CRITICAL_INCIDENT_SCENARIOS,
  INCIDENT_DRILL_CHECKLIST,
  INCIDENT_USER_NOTICE_DRAFT,
  PR159_ENTRY_CONDITIONS,
  PR159_INCIDENT_VERDICTS,
  PR159_OPEN_CRITICAL_COUNT,
  PR159_SCOPE_NOTICE,
  PR159_TEST_FILES,
} from "@/lib/ops/beta-incident-drill";
import { PR158_FEEDBACK_VERDICTS } from "@/lib/ops/beta-feedback-loop";

const ROOT = process.cwd();

describe("PR159 beta incident drill (static, no rollback or send)", () => {
  it("hub forbids rollback send and links PR158 PR143", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-159-BETA-INCIDENT-DRILL-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-158|PR158/);
    assert.match(hub, /PR-143|장애/);
    assert.match(hub, /Incident|장애|리허설/);
    assert.match(hub, /rollback|발송|실행 없음|metadata/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions met for PR158 conditional ready", () => {
    assert.notEqual(PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared, "not_ready");
    const unmet = PR159_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("incident panel admin only no rollback prisma or webhook", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaIncidentDrillPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaIncidentDrillPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaIncidentDrillPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(
      panel,
      /rollback|webhook|sendEmail|SMS|deploy|allowlist|updateRole/i,
    );
    assert.match(panel, /overflow-x-auto/);
  });

  it("verdicts conditional ready live drill not ready", () => {
    assert.equal(PR159_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR159_INCIDENT_VERDICTS.incidentDrillPrepared, "conditional");
    assert.equal(PR159_INCIDENT_VERDICTS.liveDrillExecution, "not_ready");
    assert.equal(PR159_INCIDENT_VERDICTS.recordSafety, "ready");
  });

  it("critical scenarios cover public admin aa secret", () => {
    const text = CRITICAL_INCIDENT_SCENARIOS.map((r) => r.scenario).join(" ");
    assert.match(text, /admin/);
    assert.match(text, /planner/);
    assert.match(text, /secret/);
    assert.match(text, /AI/);
    assert.ok(CRITICAL_INCIDENT_SCENARIOS.length >= 10);
  });

  it("checklist forbids rollback send and raw storage", () => {
    const ids = INCIDENT_DRILL_CHECKLIST.map((c) => c.id);
    assert.ok(ids.includes("noroll"));
    assert.ok(ids.includes("nosend"));
    assert.ok(ids.includes("pii"));
    assert.ok(ids.includes("record"));
    const met = INCIDENT_DRILL_CHECKLIST.filter((c) => c.status === "met").length;
    assert.ok(met >= 13);
  });

  it("user notice draft excludes internal errors and requests no PII", () => {
    assert.match(INCIDENT_USER_NOTICE_DRAFT.title, /점검/);
    assert.match(INCIDENT_USER_NOTICE_DRAFT.body, /개인정보/);
    assert.doesNotMatch(INCIDENT_USER_NOTICE_DRAFT.body, /stack trace|AUTH_SECRET/);
  });

  it("scope forbids rollback send and operational db", () => {
    assert.match(PR159_SCOPE_NOTICE, /장애|리허설/);
    assert.match(PR159_SCOPE_NOTICE, /rollback|발송|운영 DB/);
  });

  it("test files exist", () => {
    for (const rel of PR159_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
  });

  it("operating checklist links PR159 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-159-BETA-INCIDENT-DRILL-OPS/);
  });

  it("PR140 deferred roadmap marks PR159 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR159-A 완료/);
  });

  it("build script does not run migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
  });
});
