import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  CLAIM_DOCUMENT_WORKFLOW,
  CORRECTION_ERROR_GRADES,
  CORRECTION_FOLLOW_UP_PRS,
  CORRECTION_WORKFLOW_CHECKLIST,
  CORRECTION_CODE_REFERENCES,
  PR168_CORRECTION_VERDICTS,
  PR168_ENTRY_CONDITIONS,
  PR168_OPEN_CRITICAL_COUNT,
  PR168_SCOPE_NOTICE,
  PR168_TEST_FILES,
} from "@/lib/ops/data-correction-workflow";

const ROOT = process.cwd();

const CRAWL_FORBIDDEN = [
  "puppeteer",
  "playwright",
  "cheerio",
  "scrapy",
  "bulkUpdate",
  "updateMany",
];

describe("PR168 data correction workflow (static, no DB or crawl)", () => {
  it("hub is workflow not data modification", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-168-DATA-CORRECTION-WORKFLOW-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Correction Workflow|수정 workflow/);
    assert.match(hub, /운영 DB|크롤|bulk|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.match(hub, /공식 출처/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR168_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR168_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no prisma crawl bulk or dashboard", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminDataCorrectionWorkflowPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminDataCorrectionWorkflowPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|crawl|scrape|bulkUpdate/i);
    assert.match(panel, /PR168_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminDataCorrectionWorkflowPanel/);
  });

  it("verdicts conditional ready actual modification blocked", () => {
    assert.equal(PR168_CORRECTION_VERDICTS.correctionWorkflowPrepared, "conditional");
    assert.equal(PR168_CORRECTION_VERDICTS.officialSourcePolicy, "ready");
    assert.equal(PR168_CORRECTION_VERDICTS.actualDataModification, "blocked");
  });

  it("claim workflow blocks payout certainty and doc-only phrases", () => {
    const joined = CLAIM_DOCUMENT_WORKFLOW.map((s) => s.detail).join(" ");
    assert.match(joined, /지급 확정/);
    assert.match(joined, /이 서류만/);
    assert.match(joined, /Claim Correction PR/);
  });

  it("error grades classify public exposure and payout as critical", () => {
    const critical = CORRECTION_ERROR_GRADES.find((g) => g.grade === "critical");
    assert.ok(critical?.criteria.includes("지급"));
    const visibility = CORRECTION_FOLLOW_UP_PRS.find((f) =>
      f.issueType.includes("public"),
    );
    assert.equal(visibility?.risk, "critical");
  });

  it("no crawl deps and PR168-A adds no workflow DB models", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    for (const term of CRAWL_FORBIDDEN) {
      assert.doesNotMatch(pkg, new RegExp(`"${term}"`));
    }
    const ssot = readFileSync(
      join(ROOT, "lib/ops/data-correction-workflow.ts"),
      "utf8",
    );
    assert.doesNotMatch(ssot, /from ["']@\/lib\/prisma|prisma\./i);
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model DataCorrection\b/);
    assert.doesNotMatch(schema, /model DataCorrectionWorkflow\b/);
  });

  it("visibility helper referenced no guard weakening", () => {
    const visibility = readFileSync(
      join(ROOT, "lib/public/visibility.ts"),
      "utf8",
    );
    assert.match(visibility, /isPublishedContentPubliclyVisible|published/i);
    assert.match(CORRECTION_CODE_REFERENCES.publicVisibility, /visibility/);
  });

  it("checklist blocks live data fix pending follow-up PR only", () => {
    assert.ok(
      CORRECTION_WORKFLOW_CHECKLIST.find((c) => c.id === "nodb")?.status ===
        "met",
    );
    assert.ok(
      CORRECTION_WORKFLOW_CHECKLIST.find((c) => c.id === "live-fix")?.status ===
        "pending",
    );
  });

  it("operating checklist links PR168 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-168-DATA-CORRECTION-WORKFLOW-OPS/);
  });

  it("test files exist", () => {
    for (const file of PR168_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });

  it("scope notice matches SSOT", () => {
    assert.match(PR168_SCOPE_NOTICE, /운영 DB/);
    assert.match(PR168_SCOPE_NOTICE, /크롤링/);
  });
});
