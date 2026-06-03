import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  AUDIT_EVENT_SELECT,
  assertUsageAuditDashboardSelectSafe,
  buildUsageAuditDashboardWhere,
  truncateUsageAuditUserId,
  USAGE_AUDIT_HIGH_BLOCK_THRESHOLD,
} from "@/lib/answer-assistant/usage-audit-dashboard";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";

const ROOT = process.cwd();

describe("Answer Assistant usage audit dashboard (PR-100)", () => {
  it("admin audit route is admin-only and noindex", () => {
    const page = readFileSync(
      join(ROOT, "app/admin/answer-assistant/audit/page.tsx"),
      "utf8",
    );
    assert.match(page, /getAdminAccess/);
    assert.match(page, /AdminLockedState/);
    assert.match(page, /AdminAccessDeniedState/);
    assert.match(page, /index:\s*false/);
    assert.doesNotMatch(page, /verified_planner/);
    assert.doesNotMatch(page, /GENERAL_USER/);
  });

  it("dashboard queries exclude forbidden audit payload fields", () => {
    assertUsageAuditDashboardSelectSafe(AUDIT_EVENT_SELECT);
    for (const field of FORBIDDEN_USAGE_AUDIT_FIELDS) {
      assert.equal(
        field in AUDIT_EVENT_SELECT,
        false,
        `forbidden field in select: ${field}`,
      );
    }
  });

  it("does not expose CSV export or raw prompt/output UI", () => {
    const view = readFileSync(
      join(ROOT, "components/admin/answer-assistant/UsageAuditDashboardView.tsx"),
      "utf8",
    );
    assert.doesNotMatch(view, /text\/csv|exportCsv|download=.*csv/i);
    assert.doesNotMatch(view, /rawPrompt/i);
    assert.doesNotMatch(view, /rawOutput/i);
    assert.doesNotMatch(view, /navigator\.clipboard/i);
    assert.match(view, /CSV보내기 없음/);
    assert.match(view, /userIdPrefix/);
  });

  it("truncates userId for display", () => {
    assert.equal(truncateUsageAuditUserId("abcdefghijklmnop"), "abcdefgh…");
    assert.equal(truncateUsageAuditUserId("short"), "short");
  });

  it("supports filter where for rate limit and output safety", () => {
    const where = buildUsageAuditDashboardWhere({
      rateLimitBlocked: "true",
      outputSafetyBlocked: "true",
      providerError: "true",
      outcome: "blocked",
    });
    assert.ok(Array.isArray(where.AND));
    assert.equal(where.AND.length, 4);
  });

  it("links from admin answer assistant page", () => {
    const adminPage = readFileSync(
      join(ROOT, "app/admin/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(adminPage, /\/admin\/answer-assistant\/audit/);
  });

  it("documents high block threshold", () => {
    assert.ok(USAGE_AUDIT_HIGH_BLOCK_THRESHOLD >= 5);
    const doc = readFileSync(
      join(ROOT, "docs/PR-100-ANSWER-ASSISTANT-USAGE-AUDIT-DASHBOARD.md"),
      "utf8",
    );
    assert.match(doc, /\/admin\/answer-assistant\/audit/);
    assert.match(doc, /ADMIN/);
  });
});
