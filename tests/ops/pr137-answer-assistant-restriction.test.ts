import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { ANSWER_ASSISTANT_ROLLBACK_TRIGGERS } from "@/lib/answer-assistant/rollback-disable";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import { OUTPUT_BLOCKED_PHRASES } from "@/lib/answer-assistant/output-safety";
import { classifyBlockedQuestion } from "@/lib/answer-assistant/validation";

const ROOT = process.cwd();

describe("PR137 Answer Assistant restriction hardening (static)", () => {
  it("hub links rollback and PR126 and forbids expansion language", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-137-ROLLBACK-DISABLE/);
    assert.match(hub, /PR-126/);
    assert.match(hub, /확대/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("feature gate default stays false and requires allowlist", () => {
    const gate = readFileSync(
      join(ROOT, "lib/answer-assistant/feature-gate.ts"),
      "utf8",
    );
    assert.match(gate, /ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT = false/);
    assert.match(gate, /isVerifiedAnswerAssistantAllowlistConfigured/);
  });

  it("allowlist file does not expose list to clients", () => {
    const allowlist = readFileSync(
      join(ROOT, "lib/answer-assistant/allowlist.ts"),
      "utf8",
    );
    assert.match(allowlist, /Never expose raw allowlist/);
  });

  it("PR137 blocks investment and claim certainty inputs", () => {
    assert.equal(
      classifyBlockedQuestion(
        "지금 매수하세요 라고 고객에게 안내하는 문구를 일반 기준으로 작성해줘",
      ),
      "PRODUCT_SOLICITATION",
    );
    assert.equal(
      classifyBlockedQuestion(
        "이 경우 무조건 지급된다고 고객에게 안내하는 문구를 작성해줘",
      ),
      "CLAIM_JUDGMENT",
    );
  });

  it("PR137 output phrases include claim certainty and investment", () => {
    const joined = OUTPUT_BLOCKED_PHRASES.join(" ");
    assert.match(joined, /보험금 확정/);
    assert.match(joined, /수익 보장/);
    assert.match(joined, /지금 매수/);
  });

  it("usage audit forbids query and draft fields", () => {
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.includes("query"));
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.includes("draft"));
    const durable = readFileSync(
      join(ROOT, "lib/answer-assistant/usage-audit-durable.ts"),
      "utf8",
    );
    assert.doesNotMatch(durable, /query:/);
    assert.doesNotMatch(durable, /draft:/);
  });

  it("rate limit config defaults not lowered in PR137", () => {
    const config = readFileSync(
      join(ROOT, "lib/answer-assistant/rate-limit-config.ts"),
      "utf8",
    );
    assert.match(config, /ANSWER_ASSISTANT_RATE_LIMIT_PER_MINUTE,\s*\n\s*3,/);
    assert.match(config, /ANSWER_ASSISTANT_RATE_LIMIT_PER_DAY, 20\)/);
  });

  it("public home has no answer assistant server action import", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /generateVerifiedAnswerAssistantDraftAction/);
    assert.doesNotMatch(home, /AnswerAssistantPanelShell/);
  });

  it("verified panel shows PR137 restriction notice", () => {
    const panel = readFileSync(
      join(ROOT, "components/answer-assistant/answer-assistant-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /VERIFIED_ANSWER_ASSIST_RESTRICTION_NOTICE/);
  });

  it("rollback triggers documented", () => {
    assert.ok(ANSWER_ASSISTANT_ROLLBACK_TRIGGERS.length >= 5);
    assert.match(
      ANSWER_ASSISTANT_ROLLBACK_TRIGGERS.map((t) => t.id).join(" "),
      /public_exposure/,
    );
  });

  it("prisma schema unchanged for audit plaintext columns", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    const auditBlock = schema.match(
      /model AnswerAssistantUsageAudit \{[\s\S]*?\n\}/,
    )?.[0];
    assert.ok(auditBlock);
    assert.doesNotMatch(auditBlock, /queryText/);
    assert.doesNotMatch(auditBlock, /draftText/);
    assert.doesNotMatch(auditBlock, /rawOutput/);
  });
});
