import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  AA_COHORT_MANAGEMENT,
  COHORT_CLASSIFICATION,
  COHORT_CONTROL_CHECKLIST,
  COHORT_RECORD_RULES,
  PR166_COHORT_VERDICTS,
  PR166_ENTRY_CONDITIONS,
  PR166_FORBIDDEN_DOC_CONTENT,
  PR166_OPEN_CRITICAL_COUNT,
  PR166_SCOPE_NOTICE,
  PR166_TEST_FILES,
} from "@/lib/ops/beta-cohort-control";

const ROOT = process.cwd();

describe("PR166 beta cohort control (static, no user/allowlist changes)", () => {
  it("hub is cohort plan not expansion execution", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-166-BETA-COHORT-CONTROL-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Cohort Control|대상군/);
    assert.match(hub, /beta user|allowlist|role|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /allowlist.*push/i);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR166_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR166_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no prisma allowlist mutation or invite", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaCohortControlPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaCohortControlPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|updateMany|createUser|sendEmail|webhook/i);
    assert.doesNotMatch(panel, /allowlist.*push|grantRole|inviteLink/i);
    assert.match(panel, /PR166_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaCohortControlPanel/);
  });

  it("verdicts conditional ready expansion blocked", () => {
    assert.equal(PR166_COHORT_VERDICTS.cohortControlPrepared, "conditional");
    assert.equal(PR166_COHORT_VERDICTS.aaCohortSafety, "ready");
    assert.equal(PR166_COHORT_VERDICTS.actualExpansionExecution, "blocked");
  });

  it("six cohort types including candidate and aa allowlisted", () => {
    assert.equal(COHORT_CLASSIFICATION.length, 6);
    const ids = COHORT_CLASSIFICATION.map((c) => c.id);
    assert.ok(ids.includes("aa-allowlisted"));
    assert.ok(ids.includes("candidate"));
  });

  it("aa cohort management keeps verified plus allowlist", () => {
    const base = AA_COHORT_MANAGEMENT.find((r) => r.id === "base");
    assert.ok(base?.rule.includes("allowlist"));
    const verified = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(verified, /isUserOnVerifiedAnswerAssistantAllowlist/);
    assert.match(verified, /not_allowlisted/);
  });

  it("record rules forbid pii and transcript in cohort logs", () => {
    const joined = COHORT_RECORD_RULES.map((r) => r.forbidden).join(" ");
    assert.match(joined, /주민번호|연락처|상담 원문|PII|secret/i);
    assert.match(PR166_FORBIDDEN_DOC_CONTENT, /allowlist 실값/);
  });

  it("verified access and rbac unchanged no cohort expansion code", () => {
    const rbac = readFileSync(join(ROOT, "lib/auth/rbac.ts"), "utf8");
    assert.doesNotMatch(rbac, /ROLE_PAID|paidBeta|cohortExpand/i);
    const allowlist = readFileSync(
      join(ROOT, "lib/answer-assistant/allowlist.ts"),
      "utf8",
    );
    assert.doesNotMatch(allowlist, /addToAllowlist|bulkInvite/i);
  });

  it("checklist blocks live expansion pending metrics", () => {
    const pending = COHORT_CONTROL_CHECKLIST.filter(
      (c) => c.status === "pending",
    );
    assert.ok(pending.some((c) => c.id === "metrics"));
    assert.ok(
      COHORT_CONTROL_CHECKLIST.find((c) => c.id === "no-allowlist")?.status ===
        "met",
    );
  });

  it("operating checklist links PR166 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-166-BETA-COHORT-CONTROL-OPS/);
  });

  it("test files exist", () => {
    for (const file of PR166_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });
});
