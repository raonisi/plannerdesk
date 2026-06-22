import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  buildClaimDocumentGovernanceList,
  computeClaimDocumentGovernancePriorityCounts,
  computeClaimDocumentGovernanceSummary,
} from "@/lib/claim-documents/governance-helpers";

const ROOT = process.cwd();

describe("PR-BS-26 admin claim documents summary board polish", () => {
  it("uses four-card summary without verified inflation", () => {
    const items = buildClaimDocumentGovernanceList();
    const summary = computeClaimDocumentGovernanceSummary(items);

    assert.ok("missingLastVerified" in summary);
    assert.equal("verifiedComplete" in summary, false);
    assert.equal(summary.total, items.length);
  });

  it("computes priority review counts", () => {
    const items = buildClaimDocumentGovernanceList();
    const counts = computeClaimDocumentGovernancePriorityCounts(items);

    assert.equal(typeof counts.missingOfficialUrl, "number");
    assert.equal(typeof counts.hiddenOrRestricted, "number");
  });

  it("wires hero, priority section, and filter reset into governance board", () => {
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
    const summary = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-summary.tsx",
      ),
      "utf8",
    );
    const priority = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-priority.tsx",
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

    assert.match(page, /CLAIM_DOCUMENT_GOVERNANCE_PAGE_TITLE/);
    assert.match(page, /운영 보드/);
    assert.match(board, /ClaimDocumentGovernancePriority/);
    assert.match(board, /ClaimDocumentGovernancePagination/);
    assert.match(board, /handlePriorityApply/);
    assert.match(board, /setPage\(1\)/);
    assert.match(summary, /missingLastVerified/);
    assert.match(summary, /공식 URL 누락/);
    assert.doesNotMatch(summary, /verifiedComplete/);
    assert.match(priority, /CLAIM_DOCUMENT_GOVERNANCE_PRIORITY_SECTION_TITLE/);
    assert.match(priority, /URL 미등록만 보기/);
    assert.match(filters, /필터 초기화/);
    assert.match(filters, /필터 결과/);
  });

  it("keeps PDF actions and read-only detail notice", () => {
    const detail = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-detail.tsx",
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

    assert.match(row, /PUBLIC_CTA_PDF_DOWNLOAD/);
    assert.match(row, /download=\{governance\.fileName\}/);
    assert.match(detail, /CLAIM_DOCUMENT_GOVERNANCE_ADMIN_SCOPE_NOTICE/);
    assert.match(detail, /검수 정보 저장/);
  });
});
