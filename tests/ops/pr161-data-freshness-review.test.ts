import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  CLAIM_DOCUMENT_CHECK,
  FRESHNESS_CODE_REFERENCES,
  FRESHNESS_REVIEW_CHECKLIST,
  INSURER_DIRECTORY_CHECK,
  PR161_ENTRY_CONDITIONS,
  PR161_FRESHNESS_VERDICTS,
  PR161_OPEN_CRITICAL_COUNT,
  PR161_SCOPE_NOTICE,
  PR161_TEST_FILES,
  PUBLIC_HOLD_CRITERIA,
} from "@/lib/ops/data-freshness-review";

const ROOT = process.cwd();

describe("PR161 data freshness review (static, no DB or crawl)", () => {
  it("hub forbids db crawl and links PR160 PR147", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-161-DATA-FRESHNESS-REVIEW-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-160|PR160/);
    assert.match(hub, /Freshness|최신성/);
    assert.match(hub, /운영 DB|크롤|수정 없음|metadata/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions all met for PR161 doc phase", () => {
    const unmet = PR161_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("freshness panel admin only no prisma crawl or bulk", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminDataFreshnessReviewPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminDataFreshnessReviewPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminDataFreshnessReviewPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|crawl|scrape|bulk\.|updateMany/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("verdicts conditional ready live audit not ready", () => {
    assert.equal(PR161_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared, "conditional");
    assert.equal(PR161_FRESHNESS_VERDICTS.liveDataAudit, "not_ready");
    assert.equal(PR161_FRESHNESS_VERDICTS.officialSourcePolicy, "ready");
  });

  it("claim and directory checks mark payout and draft as critical", () => {
    const claimCrit = CLAIM_DOCUMENT_CHECK.filter((r) => r.errorGrade === "critical");
    assert.ok(claimCrit.some((r) => r.item.includes("지급")));
    const dirCrit = INSURER_DIRECTORY_CHECK.filter((r) => r.errorGrade === "critical");
    assert.ok(dirCrit.some((r) => r.item.includes("비공개")));
  });

  it("checklist forbids db crawl sync and pii", () => {
    const ids = FRESHNESS_REVIEW_CHECKLIST.map((c) => c.id);
    assert.ok(ids.includes("nodb"));
    assert.ok(ids.includes("nocrawl"));
    assert.ok(ids.includes("nosync"));
    assert.ok(ids.includes("nopii"));
    const met = FRESHNESS_REVIEW_CHECKLIST.filter((c) => c.status === "met").length;
    assert.ok(met >= 12);
  });

  it("public hold includes unreviewed and payout wording", () => {
    const text = PUBLIC_HOLD_CRITERIA.map((r) => r.situation).join(" ");
    assert.match(text, /미검수|비공개/);
    assert.match(text, /지급 확정/);
  });

  it("code references visibility helper without db query", () => {
    assert.match(FRESHNESS_CODE_REFERENCES.publicVisibility, /visibility\.ts/);
    readFileSync(join(ROOT, "lib/public/visibility.ts"), "utf8");
  });

  it("scope forbids db modification and crawl", () => {
    assert.match(PR161_SCOPE_NOTICE, /최신성|점검/);
    assert.match(PR161_SCOPE_NOTICE, /운영 DB|크롤|동기화/);
  });

  it("test files exist", () => {
    for (const rel of PR161_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
  });

  it("operating checklist links PR161 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-161-DATA-FRESHNESS-REVIEW-OPS/);
  });

  it("PR140 deferred roadmap marks PR161 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR161-A 완료/);
  });

  it("build script does not run migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
  });
});
