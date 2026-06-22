import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claimFormFiles } from "@/lib/content/claim-form-files";
import { buildClaimDocumentKey } from "@/lib/claim-documents/document-key";
import { DEFAULT_CLAIM_DOCUMENT_REVIEW_STATUS } from "@/lib/claim-documents/governance-defaults";
import {
  applyClaimPdfGovernanceOverlay,
  buildClaimLibraryItemsWithGovernance,
} from "@/lib/claim-documents/governance-public";
import {
  buildClaimDocumentGovernanceList,
  mergeClaimFormWithGovernance,
  mergeGovernanceDbRecord,
} from "@/lib/claim-documents/governance-helpers";
import type { ClaimDocumentGovernanceRecord } from "@/lib/claim-documents/governance-repository";
import {
  rejectImmutableGovernanceFields,
  validateClaimDocumentGovernanceSave,
} from "@/lib/claim-documents/governance-validation";

const ROOT = process.cwd();

describe("PR-BS-27 DB-backed claim document governance", () => {
  it("builds stable documentKey from filePath", () => {
    const sample = claimFormFiles[0];
    const keyA = buildClaimDocumentKey({ filePath: sample.href });
    const keyB = buildClaimDocumentKey({ href: sample.href });
    assert.equal(keyA, keyB);
    assert.match(keyA, /^[a-f0-9]{32}$/);
  });

  it("falls back to unknown governance when DB record is missing", () => {
    const merged = mergeClaimFormWithGovernance(claimFormFiles[0]);
    assert.equal(merged.governance.reviewStatus, DEFAULT_CLAIM_DOCUMENT_REVIEW_STATUS);
    assert.equal(merged.governance.documentKey.length, 32);
  });

  it("merges DB governance record without changing href or filePath", () => {
    const base = mergeClaimFormWithGovernance(claimFormFiles[0]);
    const record: ClaimDocumentGovernanceRecord = {
      id: "gov-1",
      documentKey: base.governance.documentKey,
      insurerName: base.governance.insurerName,
      documentTitle: base.governance.documentTitle,
      fileName: base.governance.fileName,
      filePath: "/should-not-replace.pdf",
      reviewStatus: "needs_review",
      isVisible: false,
      isDownloadEnabled: false,
      officialSourceUrl: "https://example.com/official",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      adminMemo: "internal only",
    };

    const merged = mergeGovernanceDbRecord(base, record);
    assert.equal(merged.href, base.href);
    assert.equal(merged.governance.filePath, base.governance.filePath);
    assert.equal(merged.governance.reviewStatus, "needs_review");
    assert.equal(merged.governance.adminMemo, "internal only");
  });

  it("validates officialSourceUrl and rejects invalid URLs", () => {
    const valid = validateClaimDocumentGovernanceSave({
      documentKey: "abc123",
      reviewStatus: "unknown",
      isVisible: "true",
      isDownloadEnabled: "true",
      officialSourceUrl: "https://insurer.example/claim",
    });
    assert.equal(valid.ok, true);

    const invalid = validateClaimDocumentGovernanceSave({
      documentKey: "abc123",
      reviewStatus: "unknown",
      isVisible: "true",
      isDownloadEnabled: "true",
      officialSourceUrl: "not-a-url",
    });
    assert.equal(invalid.ok, false);
  });

  it("documents immutable governance identity fields", () => {
    const message = rejectImmutableGovernanceFields({ filePath: "/changed.pdf" });
    assert.match(message ?? "", /filePath/);
  });

  it("validates reviewStatus enum and lastVerifiedAt date format", () => {
    const ok = validateClaimDocumentGovernanceSave({
      documentKey: "abc123",
      reviewStatus: "verified",
      isVisible: "true",
      isDownloadEnabled: "true",
      lastVerifiedAt: "2026-05-01",
    });
    assert.equal(ok.ok, true);

    const badStatus = validateClaimDocumentGovernanceSave({
      documentKey: "abc123",
      reviewStatus: "auto_verified",
      isVisible: "true",
      isDownloadEnabled: "true",
    });
    assert.equal(badStatus.ok, false);

    const badDate = validateClaimDocumentGovernanceSave({
      documentKey: "abc123",
      reviewStatus: "unknown",
      isVisible: "true",
      isDownloadEnabled: "true",
      lastVerifiedAt: "2026/05/01",
    });
    assert.equal(badDate.ok, false);
  });

  it("does not bulk-mark all PDFs as verified", () => {
    const items = buildClaimDocumentGovernanceList();
    assert.equal(
      items.every((item) => item.governance.reviewStatus === "verified"),
      false,
    );
  });

  it("hides isVisible false documents on public overlay", () => {
    const sample = claimFormFiles.find((form) => form.insurerSlug === "samsung-fire");
    assert.ok(sample);
    const items = buildClaimLibraryItemsWithGovernance([], {});
    const pdfItem = items.find((item) => item.kind === "pdf" && item.id === sample.id);
    assert.ok(pdfItem && pdfItem.kind === "pdf");

    const key = pdfItem.governanceDocumentKey;

    const filtered = applyClaimPdfGovernanceOverlay(items, {
      [key]: {
        isVisible: false,
        isDownloadEnabled: true,
      },
    });

    assert.equal(
      filtered.some((item) => item.kind === "pdf" && item.id === sample.id),
      false,
    );
  });

  it("disables download when isDownloadEnabled is false", () => {
    const sample = claimFormFiles.find((form) => form.insurerSlug === "samsung-fire");
    assert.ok(sample);
    const items = buildClaimLibraryItemsWithGovernance([], {});
    const pdfItem = items.find((item) => item.kind === "pdf" && item.id === sample.id);
    assert.ok(pdfItem && pdfItem.kind === "pdf");

    const key = pdfItem.governanceDocumentKey;

    const overlaid = applyClaimPdfGovernanceOverlay(items, {
      [key]: {
        isVisible: true,
        isDownloadEnabled: false,
      },
    });
    const updated = overlaid.find(
      (item) => item.kind === "pdf" && item.id === sample.id,
    );
    assert.ok(updated && updated.kind === "pdf");
    assert.equal(updated.downloadEnabled, false);
  });

  it("keeps asset-policy PDF actions on public list item", () => {
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.match(listItem, /renderPdfAssetActions/);
    assert.match(listItem, /publicAssetView/);
    assert.doesNotMatch(listItem, /adminMemo/);
  });

  it("wires admin save action and editable governance detail", () => {
    const detail = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-detail.tsx",
      ),
      "utf8",
    );
    const actions = readFileSync(
      join(ROOT, "app/admin/claim-documents/governance/actions.ts"),
      "utf8",
    );
    const page = readFileSync(
      join(ROOT, "app/admin/claim-documents/governance/page.tsx"),
      "utf8",
    );

    assert.match(detail, /saveClaimDocumentGovernanceAction/);
    assert.match(detail, /검수 정보 저장/);
    assert.match(detail, /최근 변경 이력/);
    assert.match(actions, /검수 정보가 저장되었습니다/);
    assert.match(page, /buildClaimDocumentGovernanceListWithDb/);
  });

  it("records audit log fields in repository implementation", () => {
    const repository = readFileSync(
      join(ROOT, "lib/claim-documents/governance-repository.ts"),
      "utf8",
    );
    assert.match(repository, /createClaimDocumentGovernanceAuditLog/);
    assert.match(repository, /previousValue/);
    assert.match(repository, /nextValue/);
  });

  it("preserves pagination defaults in governance board", () => {
    const board = readFileSync(
      join(
        ROOT,
        "components/admin/claim-documents/claim-document-governance-board.tsx",
      ),
      "utf8",
    );
    assert.match(board, /DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE/);
    assert.match(board, /ClaimDocumentGovernancePagination/);
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

  it("preserves legacy PDF copies under private review storage", () => {
    for (const form of claimFormFiles.slice(0, 5)) {
      const diskPath = join(ROOT, "private-asset-review", form.href.replace(/^\//, ""));
      assert.equal(existsSync(diskPath), true, `missing ${diskPath}`);
    }
  });
});
