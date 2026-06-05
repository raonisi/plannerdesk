import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  AI_LIMITED_BETA_CHECKLIST,
  PR148_SCOPE_NOTICE,
  PR148_USER_NOTICE_FORBIDDEN,
} from "@/lib/ops/ai-limited-beta-policy";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";

const ROOT = process.cwd();

describe("PR148 AI limited beta policy (static, no access expansion)", () => {
  it("hub forbids expansion and links PR146 PR137", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-148-AI-LIMITED-BETA-POLICY-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-146/);
    assert.match(hub, /PR-137/);
    assert.match(hub, /allowlist/);
    assert.match(hub, /metadata-only/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /OPENAI_API_KEY=/);
  });

  it("panel admin only no prisma allowlist writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminAiLimitedBetaPolicyPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminAiLimitedBetaPolicyPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminAiLimitedBetaPolicyPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /updateAllowlist|grantAllowlist|bulkAllowlist/i);
    assert.match(panel, /베타 접근 ≠ Answer Assistant|AA 별도/);
    assert.match(panel, /overflow-x-auto/);
  });

  it("answer assistant only under planner route with access guard", () => {
    assert.equal(existsSync(join(ROOT, "app/answer-assistant")), false);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    if (home.includes("answer-assistant")) {
      assert.match(home, /\/planner\/answer-assistant/);
      assert.doesNotMatch(home, /누구나.*answer-assistant|공개.*답변 보조/i);
    }

    const planner = readFileSync(
      join(ROOT, "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(planner, /getVerifiedAnswerAssistantAccess/);
    assert.match(planner, /robots/);
  });

  it("usage audit schema has no query or draft fields", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    const auditBlock = schema.slice(
      schema.indexOf("model AnswerAssistantUsageAudit"),
      schema.indexOf("model AnswerAssistantBetaFeedback"),
    );
    assert.doesNotMatch(auditBlock, /\bquery\b/);
    assert.doesNotMatch(auditBlock, /\bdraft\b/);
    assert.doesNotMatch(auditBlock, /rawPrompt/);
    assert.doesNotMatch(auditBlock, /rawOutput/);
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.includes("query"));
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.includes("draft"));
  });

  it("verified access requires verified_planner and allowlist", () => {
    const access = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(access, /verified_planner/);
    assert.match(access, /isUserOnVerifiedAnswerAssistantAllowlist/);
    assert.match(access, /not_allowlisted/);
  });

  it("checklist has no gap and beta auto allow is met", () => {
    const betaAuto = AI_LIMITED_BETA_CHECKLIST.find((c) => c.id === "beta-auto");
    assert.equal(betaAuto?.status, "met");
    const gaps = AI_LIMITED_BETA_CHECKLIST.filter((c) => c.status === "gap");
    assert.equal(gaps.length, 0);
  });

  it("forbidden user notices block expansion phrases", () => {
    const joined = PR148_USER_NOTICE_FORBIDDEN.join(" ");
    assert.match(joined, /누구나|AI가 최종|무조건 지급/);
    assert.match(PR148_SCOPE_NOTICE, /접근 확대/);
    assert.match(PR148_SCOPE_NOTICE, /allowlist/);
  });

  it("output safety file still blocks claim certainty", () => {
    const safety = readFileSync(
      join(ROOT, "lib/answer-assistant/output-safety.ts"),
      "utf8",
    );
    assert.match(safety, /지급 확정/);
    assert.match(safety, /무조건 지급/);
  });

  it("operating checklist links PR148 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-148-AI-LIMITED-BETA-POLICY-OPS/);
  });

  it("PR147 aa notice references PR148", () => {
    const aa = readFileSync(
      join(ROOT, "docs/PR-147-ANSWER-ASSISTANT-NOTICE.md"),
      "utf8",
    );
    assert.match(aa, /PR-148/);
  });
});
