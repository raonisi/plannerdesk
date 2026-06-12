import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { claimFormFiles } from "@/lib/content/claim-form-files";
import {
  CLAIM_PDF_CAUTION_TEXT,
  enrichStoredClaimPdfMetadata,
  isStoredClaimPdfPath,
  resolveOfficialSourceUrlForInsurerSlug,
} from "@/lib/claim-documents/claim-pdf-governance";
import { claimFormToLibraryItem } from "@/lib/claim-documents/library-items";

const ROOT = process.cwd();

describe("PR-BS-20 claim PDF governance", () => {
  it("preserves stored PDF paths under /claim-forms/bohumschool/", () => {
    assert.ok(claimFormFiles.length > 0);
    for (const form of claimFormFiles) {
      assert.match(form.href, /^\/claim-forms\/bohumschool\/.+\.pdf$/);
      assert.equal(isStoredClaimPdfPath(form.href), true);
    }
  });

  it("enriches PDF metadata with governance fields", () => {
    const sample = claimFormFiles.find((form) =>
      form.insurerSlug === "samsung-fire",
    );
    assert.ok(sample);
    const meta = enrichStoredClaimPdfMetadata(sample);
    assert.equal(meta.fileType, "pdf");
    assert.equal(meta.sourceType, "stored_pdf");
    assert.equal(meta.documentTitle, sample.label);
    assert.equal(meta.fileName, sample.href.split("/").pop());
    assert.equal(meta.cautionText, CLAIM_PDF_CAUTION_TEXT);
    assert.equal(meta.reviewStatus, "verified");
    assert.ok(meta.officialSourceUrl?.startsWith("https://"));
  });

  it("maps samsung-fire slug to insurer official URL", () => {
    const url = resolveOfficialSourceUrlForInsurerSlug("samsung-fire");
    assert.equal(url, "https://www.samsungfire.com/v2/html/claim/01/C_010_030_001.html");
  });

  it("library item keeps download href and metadata", () => {
    const sample = claimFormFiles[0];
    const item = claimFormToLibraryItem(sample);
    assert.equal(item.kind, "pdf");
    assert.equal(item.href, sample.href);
    assert.equal(item.sourceType, "stored_pdf");
    assert.ok(item.fileName.endsWith(".pdf"));
  });

  it("sample PDF file exists on disk (404 guard)", () => {
    const sample = claimFormFiles.find((form) => form.insurerSlug === "samsung-fire");
    assert.ok(sample);
    const diskPath = join(ROOT, "public", sample.href.replace(/^\//, ""));
    assert.equal(existsSync(diskPath), true, `missing ${diskPath}`);
  });

  it("claim list item exposes download and open actions", () => {
    const source = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.match(source, /PDF 다운로드/);
    assert.match(source, /PDF 바로 열기/);
    assert.match(source, /보험사 공식 안내 확인/);
    assert.match(source, /download=/);
    assert.match(source, /PDF 링크 복사/);
  });

  it("claim explorer shows governance notice", () => {
    const source = readFileSync(
      join(ROOT, "app/claim-documents/claim-document-explorer.tsx"),
      "utf8",
    );
    assert.match(source, /CLAIM_PDF_(GOVERNANCE|ACCORDION)_NOTICE/);
  });

  it("AGENTS.md uses git root C:\\work\\plannerdesk", () => {
    const agents = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
    assert.match(agents, /C:\\work\\plannerdesk/);
    assert.doesNotMatch(agents, /plannerdesk-main/);
  });
});
