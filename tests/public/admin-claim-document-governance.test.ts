import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-25 admin claim document governance board", () => {
  it("exposes admin governance route and board components", () => {
    const page = readFileSync(
      join(ROOT, "app/admin/claim-documents/governance/page.tsx"),
      "utf8",
    );
    const board = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-board.tsx",
      ),
      "utf8",
    );

    assert.match(page, /청구서류 검수 관리/);
    assert.match(page, /ClaimDocumentGovernanceBoard/);
    assert.match(page, /buildClaimDocumentGovernanceListWithDb/);
    assert.match(board, /ClaimDocumentGovernanceSummary/);
    assert.match(board, /ClaimDocumentGovernanceFilters/);
    assert.match(board, /ClaimDocumentGovernanceTable/);
    assert.match(board, /ClaimDocumentGovernanceMobileList/);
  });

  it("keeps PDF download and open actions in admin governance UI", () => {
    const table = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-table.tsx",
      ),
      "utf8",
    );
    const row = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-row.tsx",
      ),
      "utf8",
    );
    const detail = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-detail.tsx",
      ),
      "utf8",
    );

    assert.match(row, /PUBLIC_CTA_PDF_DOWNLOAD/);
    assert.match(row, /download=\{governance\.fileName\}/);
    assert.match(row, /PUBLIC_CTA_PDF_OPEN/);
    assert.match(table, /ClaimDocumentGovernancePdfActions/);
    assert.match(detail, /CLAIM_DOCUMENT_GOVERNANCE_ADMIN_SCOPE_NOTICE/);
    assert.match(detail, /상세 보기/);
    assert.match(detail, /saveClaimDocumentGovernanceAction/);
    assert.match(detail, /검수 정보 저장/);
  });

  it("does not expose adminMemo on public claim list item", () => {
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.doesNotMatch(listItem, /adminMemo/);
    assert.doesNotMatch(listItem, /updatedBy/);
    assert.doesNotMatch(listItem, /nextReviewDueAt/);
    assert.doesNotMatch(listItem, /reviewStatus.*unknown/);
  });

  it("links existing admin claim-documents library page to governance board", () => {
    const libraryPage = readFileSync(
      join(ROOT, "app/admin/claim-documents/page.tsx"),
      "utf8",
    );
    assert.match(libraryPage, /\/admin\/claim-documents\/governance/);
  });
});
