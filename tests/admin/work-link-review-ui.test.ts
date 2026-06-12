import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  WORK_LINK_REVIEW_FORBIDDEN_UI_PHRASES,
  WORK_LINK_REVIEW_POLICY_LINES,
} from "@/lib/work-links/review-copy";
import { WORK_LINK_REVIEW_MOCK_CANDIDATES } from "@/lib/work-links/review-mock-candidates";
import { DEFAULT_WORK_LINK_VISIBILITY_SCOPE } from "@/lib/work-links/review-rules";
import { WORK_LINK_INFO_TYPE_DEFAULT_RISK } from "@/lib/work-links/review-rules";

const ROOT = process.cwd();

describe("PR-BS-14 work link admin review UI", () => {
  it("admin route uses getAdminAccess guard", () => {
    const page = readFileSync(join(ROOT, "app/admin/work-links/page.tsx"), "utf8");
    assert.match(page, /getAdminAccess/);
    assert.match(page, /AdminLockedState/);
    assert.match(page, /AdminAccessDeniedState/);
    assert.match(page, /robots:\s*\{\s*index:\s*false/);
  });

  it("panel shows policy notice and filters", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/work-links/WorkLinkReviewDraftPanel.tsx"),
      "utf8",
    );
    assert.match(panel, /WORK_LINK_REVIEW_POLICY_LINES/);
    assert.match(panel, /WORK_LINK_REVIEW_SCOPE_NOTICE/);
    assert.match(panel, /reviewNotePrivate/);
    assert.match(panel, /Admin-only/);
    assert.match(panel, /public 비대상/);

    const copy = readFileSync(join(ROOT, "lib/work-links/review-copy.ts"), "utf8");
    for (const line of WORK_LINK_REVIEW_POLICY_LINES) {
      assert.match(copy, new RegExp(line.slice(0, 12)));
    }
  });

  it("mock candidates default to admin visibility scope", () => {
    assert.ok(WORK_LINK_REVIEW_MOCK_CANDIDATES.length >= 1);
    for (const candidate of WORK_LINK_REVIEW_MOCK_CANDIDATES) {
      assert.equal(candidate.visibilityScope, DEFAULT_WORK_LINK_VISIBILITY_SCOPE);
      assert.match(candidate.id, /^mock-wl-/);
      assert.doesNotMatch(candidate.title, /010-/);
    }
  });

  it("high-risk info types are classified correctly", () => {
    for (const type of ["customerCenter", "fax", "paymentInfo", "insurerSystem"] as const) {
      assert.equal(WORK_LINK_INFO_TYPE_DEFAULT_RISK[type], "high");
    }
    assert.equal(WORK_LINK_INFO_TYPE_DEFAULT_RISK.claimGuide, "high");
    assert.equal(WORK_LINK_INFO_TYPE_DEFAULT_RISK.disclosure, "medium");
  });

  it("forbidden certainty phrases are absent from admin UI", () => {
    const sources = [
      "app/admin/work-links/page.tsx",
      "components/admin/work-links/WorkLinkReviewDraftPanel.tsx",
    ];
    for (const rel of sources) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of WORK_LINK_REVIEW_FORBIDDEN_UI_PHRASES) {
        assert.doesNotMatch(
          src,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${rel} must not contain: ${phrase}`,
        );
      }
    }
  });
});
