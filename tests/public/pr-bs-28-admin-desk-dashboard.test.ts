import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES,
  VERIFIED_WORK_LINK_PUBLIC_SECTION_TITLE,
} from "@/lib/work-links/verified-copy";
import { getPublicVerifiedWorkLinks } from "@/lib/work-links/verified-catalog";

const ROOT = process.cwd();

describe("PR-BS-28 admin desk dashboard UX refactor", () => {
  it("admin home uses operational dashboard instead of unlimited list rendering", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    const operational = readFileSync(
      join(ROOT, "components/admin/AdminOperationalDashboard.tsx"),
      "utf8",
    );
    const page = readFileSync(join(ROOT, "app/admin/page.tsx"), "utf8");

    assert.match(page, /buildAdminOperationalDashboardSnapshot/);
    assert.match(shell, /AdminOperationalDashboard/);
    assert.match(shell, /AdminPlanningPanels/);
    assert.match(operational, /운영 요약/);
    assert.match(operational, /오늘 처리할 일/);
    assert.match(operational, /관리 메뉴/);
    assert.doesNotMatch(shell, /AdminExternalReleaseReadinessPanel/);
    assert.match(shell, /<details/);
  });

  it("operational dashboard exposes four summary metric cards", () => {
    const operational = readFileSync(
      join(ROOT, "components/admin/AdminOperationalDashboard.tsx"),
      "utf8",
    );
    const lib = readFileSync(
      join(ROOT, "lib/admin/operational-dashboard.ts"),
      "utf8",
    );

    assert.match(operational, /metricCards/);
    assert.match(lib, /정보 수정 요청/);
    assert.match(lib, /검수 필요 링크/);
    assert.match(lib, /공식 URL 미등록 청구서류/);
    assert.match(lib, /최근 변경 이력/);
  });

  it("operational dashboard includes required admin menu cards", () => {
    const lib = readFileSync(
      join(ROOT, "lib/admin/operational-dashboard.ts"),
      "utf8",
    );

    assert.match(lib, /청구서류 검수 관리/);
    assert.match(lib, /보험사 링크 관리/);
    assert.match(lib, /정보 수정 요청 관리/);
    assert.match(lib, /업무 링크 검수 관리/);
    assert.match(lib, /변경 이력 확인/);
    assert.match(lib, /TASK_LIMIT = 5/);
  });

  it("keeps claim documents governance pagination on admin page", () => {
    const board = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-board.tsx",
      ),
      "utf8",
    );
    assert.match(board, /ClaimDocumentGovernancePagination/);
    assert.match(board, /DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE/);
  });

  it("directory public copy avoids mock and admin review titles", () => {
    const directoryPage = readFileSync(
      join(ROOT, "app/directory/page.tsx"),
      "utf8",
    );
    const verifiedSection = readFileSync(
      join(ROOT, "components/work-links/VerifiedWorkLinksSection.tsx"),
      "utf8",
    );
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );

    assert.equal(VERIFIED_WORK_LINK_PUBLIC_SECTION_TITLE, "확인된 업무 링크");
    assert.match(verifiedSection, /VERIFIED_WORK_LINK_PUBLIC_SECTION_TITLE/);

    for (const phrase of VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES.slice(0, 2)) {
      assert.doesNotMatch(directoryPage, new RegExp(phrase));
      assert.doesNotMatch(verifiedSection, new RegExp(phrase));
    }

    assert.doesNotMatch(listItem, /adminMemo/);
    assert.doesNotMatch(listItem, /audit log/);
    assert.doesNotMatch(listItem, /changeReason/);
  });

  it("public verified link titles use user-facing wording", () => {
    const links = getPublicVerifiedWorkLinks();
    assert.ok(links.length > 0);
    for (const link of links) {
      assert.doesNotMatch(link.title, /mock 공개/i);
      assert.doesNotMatch(link.title, /mock/i);
    }
  });

  it("keeps PDF download on directory and claim-documents surfaces", () => {
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /PDF 바로 열기/);
  });

  it("compact insurer card keeps claim documents collapsed by default", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const claimSection = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );
    assert.match(card, /claimDocumentsOpen, setClaimDocumentsOpen\] = useState\(false\)/);
    assert.match(claimSection, /hidden=\{!isOpen\}/);
  });

  it("has no PDF delete diff in git", () => {
    const diff = execSync("git diff --name-status", {
      cwd: ROOT,
      encoding: "utf8",
    });
    const pdfDeletes = diff
      .split("\n")
      .filter((line) => line.startsWith("D") && line.includes(".pdf"));
    assert.equal(pdfDeletes.length, 0);
  });
});
