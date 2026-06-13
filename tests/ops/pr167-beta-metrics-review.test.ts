import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import {
  ANALYTICS_FORBIDDEN,
  CORE_METRICS,
  METRICS_CLASSIFICATION,
  METRICS_OPERATION_DECISIONS,
  METRICS_REVIEW_CHECKLIST,
  PR167_ENTRY_CONDITIONS,
  PR167_METRICS_VERDICTS,
  PR167_OPEN_CRITICAL_COUNT,
  PR167_SCOPE_NOTICE,
  PR167_TEST_FILES,
} from "@/lib/ops/beta-metrics-review";

const ROOT = process.cwd();

describe("PR167 beta metrics review (static, no analytics or DB)", () => {
  it("hub is metrics review not analytics implementation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-167-BETA-METRICS-REVIEW-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Metrics Review|지표/);
    assert.match(hub, /analytics|SDK|대시보드|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.match(hub, /metadata/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /mixpanel/i);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR167_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR167_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no analytics prisma or dashboard", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaMetricsReviewPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaMetricsReviewPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|mixpanel|posthog|gtag|amplitude/i);
    assert.doesNotMatch(panel, /createMetric|MetricDashboard/i);
    assert.match(panel, /PR167_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaMetricsReviewPanel/);
  });

  it("verdicts conditional ready analytics blocked", () => {
    assert.equal(PR167_METRICS_VERDICTS.metricsReviewPrepared, "conditional");
    assert.equal(PR167_METRICS_VERDICTS.metadataOnlyPolicy, "ready");
    assert.equal(PR167_METRICS_VERDICTS.analyticsImplementation, "blocked");
  });

  it("eight metric groups and twelve core metrics defined", () => {
    assert.equal(METRICS_CLASSIFICATION.length, 8);
    assert.equal(CORE_METRICS.length, 12);
    const aiGroup = METRICS_CLASSIFICATION.find((g) => g.id === "ai");
    assert.match(aiGroup?.forbidden ?? "", /prompt/);
  });

  it("operation decisions link critical to stop", () => {
    const stop = METRICS_OPERATION_DECISIONS.find((d) => d.decision === "중단");
    assert.ok(stop?.criteria.includes("Critical"));
    const expand = METRICS_OPERATION_DECISIONS.find(
      (d) => d.decision === "확대 가능",
    );
    assert.ok(expand?.criteria.includes("Critical 0"));
  });

  it("package.json has no analytics deps", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    for (const sdk of ANALYTICS_FORBIDDEN) {
      assert.doesNotMatch(pkg, new RegExp(`"${sdk}"`));
    }
  });

  it("prisma schema has no metric model", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model BetaMetric\b/);
    assert.doesNotMatch(schema, /model AnalyticsEvent\b/);
  });

  it("usage audit forbidden fields align with metadata-only", () => {
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.length >= 5);
    const joined = FORBIDDEN_USAGE_AUDIT_FIELDS.join(" ").toLowerCase();
    assert.match(joined, /prompt|response|query|원문/i);
  });

  it("checklist blocks live aggregation pending pr168", () => {
    const pending = METRICS_REVIEW_CHECKLIST.filter(
      (c) => c.status === "pending",
    );
    assert.ok(pending.some((c) => c.id === "live-data"));
    assert.ok(
      METRICS_REVIEW_CHECKLIST.find((c) => c.id === "no-sdk")?.status === "met",
    );
  });

  it("operating checklist links PR167 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-167-BETA-METRICS-REVIEW-OPS/);
  });

  it("test files exist", () => {
    for (const file of PR167_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });

  it("scope notice matches SSOT", () => {
    assert.match(PR167_SCOPE_NOTICE, /analytics/);
    assert.match(PR167_SCOPE_NOTICE, /metadata/);
  });
});
