import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ADMIN_OPS_REPORT_AA_NOTICE,
  ADMIN_OPS_REPORT_PUBLIC_BOUNDARY,
} from "@/lib/admin/operations-report-copy";

const ROOT = process.cwd();

const FORBIDDEN_IN_REPORT = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "고객명",
  "주민번호",
  "상담 원문",
];

describe("PR136 admin operations report (static)", () => {
  it("hub documents PR136-B separation and manual template", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-136-ADMIN-OPS-REPORT-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-136-B-DB-ANALYTICS-DESIGN/);
    assert.match(hub, /PR-136-REPORT-TEMPLATE/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);

    const plan = readFileSync(
      join(ROOT, "docs/PR-136-IMPLEMENTATION-PLAN.md"),
      "utf8",
    );
    assert.match(plan, /DB.*영향 없음|migration/i);
  });

  it("no OpsReport or AdminAnalytics model in schema", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model OpsReport\b/);
    assert.doesNotMatch(schema, /model AdminAnalytics\b/);
    assert.doesNotMatch(schema, /model OperationsReport\b/);
  });

  it("admin panel only on admin shell not public routes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminOperationsReportPanel/);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminOperationsReportPanel/);
    assert.doesNotMatch(home, /운영 리포트 기준/);

    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.doesNotMatch(page, /AdminOperationsReportPanel/);
  });

  it("admin page still uses getAdminAccess", () => {
    const admin = readFileSync(join(ROOT, "app/admin/page.tsx"), "utf8");
    assert.match(admin, /getAdminAccess/);
    assert.match(admin, /buildAdminDashboardSnapshot/);
  });

  it("report copy avoids PII and secrets", () => {
    const copy = [
      ADMIN_OPS_REPORT_PUBLIC_BOUNDARY,
      ADMIN_OPS_REPORT_AA_NOTICE,
      readFileSync(join(ROOT, "lib/admin/operations-report-copy.ts"), "utf8"),
    ].join(" ");
    for (const phrase of FORBIDDEN_IN_REPORT) {
      assert.doesNotMatch(copy, new RegExp(phrase));
    }
    assert.match(copy, /공개.*노출하지 않습니다/);
    assert.match(copy, /allowlist/);
  });

  it("panel uses existing snapshot not new prisma aggregates", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminOperationsReportPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.match(panel, /const \{ reviewQueue, summary \} = dashboard/);
    assert.match(panel, /summary\.active/);
    assert.match(panel, /overflow-x-auto/);
  });

  it("links PR129 PR133 PR134 in domain copy", () => {
    const lib = readFileSync(
      join(ROOT, "lib/admin/operations-report-copy.ts"),
      "utf8",
    );
    assert.match(lib, /PR-129/);
    assert.match(lib, /PR-133/);
    assert.match(lib, /PR-134/);
  });

  it("template forbids sensitive paste fields", () => {
    const template = readFileSync(
      join(ROOT, "docs/PR-136-REPORT-TEMPLATE.md"),
      "utf8",
    );
    assert.match(template, /고객정보/);
    assert.match(template, /secret/);
    assert.match(template, /수동/);
  });
});
