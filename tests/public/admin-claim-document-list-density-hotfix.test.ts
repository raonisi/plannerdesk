import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  computeClaimDocumentGovernancePaginationMeta,
  DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  MOBILE_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  paginateClaimDocumentGovernanceItems,
} from "@/lib/claim-documents/governance-helpers";

const ROOT = process.cwd();

describe("hotfix admin claim documents list density", () => {
  it("paginates filtered governance items instead of rendering all rows", () => {
    const items = Array.from({ length: 170 }, (_, index) => ({ id: index + 1 }));
    const pageOne = paginateClaimDocumentGovernanceItems(
      items,
      1,
      DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
    );
    const meta = computeClaimDocumentGovernancePaginationMeta(
      items.length,
      1,
      DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
    );

    assert.equal(pageOne.length, 25);
    assert.equal(meta.totalPages, 7);
    assert.equal(meta.rangeStart, 1);
    assert.equal(meta.rangeEnd, 25);
  });

  it("uses compact mobile page size default", () => {
    const items = Array.from({ length: 30 }, (_, index) => index);
    const mobilePage = paginateClaimDocumentGovernanceItems(
      items,
      1,
      MOBILE_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
    );

    assert.equal(mobilePage.length, 10);
  });

  it("wires pagination and compact list into governance board", () => {
    const board = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-board.tsx",
      ),
      "utf8",
    );
    const table = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-table.tsx",
      ),
      "utf8",
    );
    const mobile = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-mobile-list.tsx",
      ),
      "utf8",
    );
    const filters = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-filters.tsx",
      ),
      "utf8",
    );

    assert.match(board, /ClaimDocumentGovernancePagination/);
    assert.match(board, /paginateClaimDocumentGovernanceItems/);
    assert.match(board, /setPage\(1\)/);
    assert.match(board, /items={paginatedItems}/);
    assert.doesNotMatch(table, /<th[^>]*>노출<\/th>/);
    assert.doesNotMatch(table, /<th[^>]*>다운로드<\/th>/);
    assert.doesNotMatch(mobile, /ClaimDocumentGovernanceVisibilityCell/);
    assert.doesNotMatch(mobile, /ClaimDocumentGovernanceDownloadCell/);
    assert.match(filters, /고급 필터 열기/);
    assert.match(filters, /고급 필터 닫기/);
  });

  it("keeps PDF download and open actions in admin governance UI", () => {
    const row = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-row.tsx",
      ),
      "utf8",
    );
    const pagination = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-pagination.tsx",
      ),
      "utf8",
    );

    assert.match(row, /PDF 다운로드/);
    assert.match(row, /download=\{governance\.fileName\}/);
    assert.match(row, /PDF 바로 열기/);
    assert.match(pagination, /전체 .*개 중/);
    assert.match(pagination, /이전/);
    assert.match(pagination, /다음/);
    assert.match(pagination, /처음/);
    assert.match(pagination, /마지막/);
  });
});
