import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR131 integrated work dashboard (static)", () => {
  it("hub doc links structure, role matrix, and entry gate reference", () => {
    const hub = readFileSync(join(ROOT, "docs/PR-131-DASHBOARD-OPS.md"), "utf8");
    assert.match(hub, /PR-131-DASHBOARD-STRUCTURE-ANALYSIS/);
    assert.match(hub, /PR-130-PR131-ENTRY-GATE/);
    assert.match(hub, /visibility guard/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("public home does not expose admin review queue or ops registry paths", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /knowledgeArticles/);
    assert.match(home, /PUBLIC_WORK_HUB_VISIBILITY_NOTICE|work-hub-copy/);
    assert.match(home, /HomeCompactWorkTile|오늘 바로 쓰는 업무/);
    assert.doesNotMatch(home, /reviewQueue/);
    assert.doesNotMatch(home, /correctionNew/);
    assert.doesNotMatch(home, /plannerVerificationPending/);
    assert.doesNotMatch(home, /PR-129-ISSUE-INTAKE/);
    assert.doesNotMatch(home, /verificationStatusLabel/);
  });

  it("public home uses allowlist-safe Answer Assistant notice only", () => {
    const copy = readFileSync(
      join(ROOT, "lib/dashboard/work-hub-copy.ts"),
      "utf8",
    );
    assert.match(copy, /허용 목록/);
    assert.match(copy, /자동으로 확대되지 않습니다/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /planner\/answer-assistant/);
    assert.doesNotMatch(home, /allowlist.*push|expandAllowlist/i);
  });

  it("admin shell includes review queue panel and getAdminAccess path unchanged", () => {
    const adminPage = readFileSync(join(ROOT, "app/admin/page.tsx"), "utf8");
    assert.match(adminPage, /getAdminAccess/);
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminReviewQueuePanel/);
    assert.doesNotMatch(shell, /correctionNew.*public/i);
  });

  it("dashboard snapshot adds reviewQueue without new migration files", () => {
    const status = readFileSync(
      join(ROOT, "lib/admin/dashboard-status.ts"),
      "utf8",
    );
    assert.match(status, /reviewQueue: AdminReviewQueueSummary/);
    assert.match(status, /buildReviewQueueSummary/);
    assert.match(status, /probeCorrectionRequestTable/);
  });

  it("page fetches knowledge through public API only", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.match(page, /getPublicKnowledgeArticles/);
    assert.doesNotMatch(page, /prisma\.knowledgeArticle/);
  });

  it("role matrix forbids admin stats on public dashboard", () => {
    const matrix = readFileSync(
      join(ROOT, "docs/PR-131-DASHBOARD-ROLE-MATRIX.md"),
      "utf8",
    );
    assert.match(matrix, /검수 대기/);
    assert.match(matrix, /표시 금지/);
  });

  it("home grid uses responsive classes for narrow screens", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /min-\[420px\]:grid-cols-2/);
    assert.match(home, /min-w-0/);
  });
});
