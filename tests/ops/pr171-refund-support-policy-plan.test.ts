import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import { PG_SDK_FORBIDDEN } from "@/lib/ops/payment-architecture-plan";
import {
  PR171_ENTRY_CONDITIONS,
  PR171_FORBIDDEN_PHRASES,
  PR171_OPEN_CRITICAL_COUNT,
  PR171_POLICY_VERDICTS,
  PR171_SCOPE_NOTICE,
  PR171_TEST_FILES,
  REFUND_SUPPORT_NO_GO,
  REFUND_SUPPORT_POLICY_CHECKLIST,
  SUPPORT_RECORD_ALLOW_DENY,
} from "@/lib/ops/refund-support-policy-plan";

const ROOT = process.cwd();

const NOTIFY_FORBIDDEN = [
  "sendgrid",
  "nodemailer",
  "twilio",
  "slackWebhook",
  "kakao",
];

describe("PR171 refund support policy plan (static, no refund or inbox)", () => {
  it("hub is policy plan not refund implementation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-171-REFUND-SUPPORT-POLICY-PLAN-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Policy Plan|환불·고객지원/);
    assert.match(hub, /환불 기능|PG|인박스|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.match(hub, /검토 필요/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /무조건 환불됩니다/);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR171_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR171_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no prisma refund inbox webhook or notify", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminRefundSupportPolicyPlanPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminRefundSupportPolicyPlanPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|refund\(|createRefund|webhook|sendgrid/i);
    assert.match(panel, /PR171_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminRefundSupportPolicyPlanPanel/);
  });

  it("verdicts conditional ready refund and inbox blocked", () => {
    assert.equal(PR171_POLICY_VERDICTS.refundSupportPolicyPlan, "conditional");
    assert.equal(PR171_POLICY_VERDICTS.policyScopeDefined, "ready");
    assert.equal(PR171_POLICY_VERDICTS.refundImplementation, "blocked");
    assert.equal(PR171_POLICY_VERDICTS.supportSystemImplementation, "blocked");
  });

  it("support record denies pii payment raw and transcript", () => {
    const joined = SUPPORT_RECORD_ALLOW_DENY.map((r) => r.forbidden).join(" ");
    assert.match(joined, /상담 원문|카드|prompt/);
    assert.ok(SUPPORT_RECORD_ALLOW_DENY.length >= 10);
  });

  it("no-go blocks refund final pii storage inbox and billing", () => {
    const situations = REFUND_SUPPORT_NO_GO.map((r) => r.situation);
    assert.ok(situations.some((s) => s.includes("환불정책")));
    assert.ok(situations.some((s) => s.includes("인박스")));
    assert.ok(situations.some((s) => s.includes("PG")));
  });

  it("no refund billing inbox routes models or notify deps", () => {
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
    assert.equal(existsSync(join(ROOT, "app/billing")), false);
    assert.equal(existsSync(join(ROOT, "app/support/inbox")), false);
    assert.equal(existsSync(join(ROOT, "app/api/refund")), false);

    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Refund\b/);
    assert.doesNotMatch(schema, /model SupportTicket\b/);
    assert.doesNotMatch(schema, /model Payment\b/);

    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    for (const sdk of PG_SDK_FORBIDDEN) {
      assert.doesNotMatch(pkg, new RegExp(`"${sdk}"`));
    }
    for (const dep of NOTIFY_FORBIDDEN) {
      assert.doesNotMatch(pkg, new RegExp(`"${dep}"`));
    }
  });

  it("ssot has no prisma import metadata only aligned", () => {
    const ssot = readFileSync(
      join(ROOT, "lib/ops/refund-support-policy-plan.ts"),
      "utf8",
    );
    assert.doesNotMatch(ssot, /from ["']@\/lib\/prisma/);
    const audit = FORBIDDEN_USAGE_AUDIT_FIELDS.join(" ").toLowerCase();
    assert.match(audit, /prompt|response|원문/i);
  });

  it("checklist blocks live refund pending legal final gap", () => {
    assert.ok(
      REFUND_SUPPORT_POLICY_CHECKLIST.find((c) => c.id === "no-refund")?.status ===
        "met",
    );
    assert.ok(
      REFUND_SUPPORT_POLICY_CHECKLIST.find((c) => c.id === "legal-final")?.status ===
        "gap",
    );
    assert.ok(
      REFUND_SUPPORT_POLICY_CHECKLIST.find((c) => c.id === "live-refund")?.status ===
        "pending",
    );
  });

  it("public home has no forbidden refund or payout phrases", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    for (const phrase of PR171_FORBIDDEN_PHRASES.slice(0, 8)) {
      assert.doesNotMatch(home, new RegExp(phrase));
    }
  });

  it("operating checklist links PR171 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-171-REFUND-SUPPORT-POLICY-PLAN-OPS/);
  });

  it("test files exist", () => {
    for (const file of PR171_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });

  it("scope notice matches SSOT", () => {
    assert.match(PR171_SCOPE_NOTICE, /환불/);
    assert.match(PR171_SCOPE_NOTICE, /인박스/);
  });
});
