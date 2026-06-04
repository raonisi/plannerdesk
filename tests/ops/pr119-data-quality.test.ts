import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { KNOWLEDGE_SEED_ITEMS } from "@/app/knowledge/knowledge-seed";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { insurerDirectoryEntries } from "@/lib/content/insurers";
import {
  isInsurerPubliclyVisible,
  PUBLIC_VERIFICATION_STATUSES,
} from "@/lib/public/insurers";

const ROOT = process.cwd();

describe("PR119 operational data quality (fixture static, no database)", () => {
  it("insurer fixture has 49 unique ids and official-source review notes", () => {
    assert.equal(insurerDirectoryEntries.length, 49);
    const ids = new Set(insurerDirectoryEntries.map((e) => e.id));
    assert.equal(ids.size, 49);

    for (const entry of insurerDirectoryEntries) {
      assert.ok(entry.sourceNote?.includes("재검수"), entry.id);
      assert.equal(entry.lastVerifiedAt, null, entry.id);
      assert.match(
        entry.notes,
        /공식 출처 검수 완료 전까지/,
        entry.id,
      );
    }
  });

  it("insurer fixture claimPageUrl missing but claimFormUrl mostly present", () => {
    const missingClaimPage = insurerDirectoryEntries.filter(
      (e) => !e.claimPageUrl?.trim(),
    ).length;
    assert.equal(missingClaimPage, 49);

    const withClaimForm = insurerDirectoryEntries.filter((e) =>
      e.claimFormUrl?.trim(),
    ).length;
    assert.ok(withClaimForm >= 40, `claimFormUrl present: ${withClaimForm}/49`);
  });

  it("flags non-HTTPS systemUrl in fixture", () => {
    const httpEntries = insurerDirectoryEntries.filter((e) =>
      e.systemUrl?.trim().startsWith("http://"),
    );
    assert.equal(httpEntries.length, 1);
    assert.equal(httpEntries[0]?.id, "hanwha-general");
  });

  it("published needs_review insurers are publicly visible per guard", () => {
    for (const entry of insurerDirectoryEntries) {
      if (!entry.isPublished) continue;
      assert.ok(
        PUBLIC_VERIFICATION_STATUSES.includes(
          entry.verificationStatus as (typeof PUBLIC_VERIFICATION_STATUSES)[number],
        ),
        entry.id,
      );
      assert.equal(
        isInsurerPubliclyVisible({
          isPublished: entry.isPublished,
          verificationStatus: entry.verificationStatus as never,
        }),
        true,
        entry.id,
      );
    }
  });

  it("claim document candidates have unique slugs and no insurer link", () => {
    assert.equal(claimDocumentCandidateFallback.length, 35);
    const slugs = new Set(
      claimDocumentCandidateFallback.map((row) => row.slug),
    );
    assert.equal(slugs.size, 35);
    assert.ok(
      claimDocumentCandidateFallback.every((row) => row.insurerId === null),
    );
    assert.ok(
      claimDocumentCandidateFallback.every((row) =>
        row.cautionNote?.includes("보험금 지급"),
      ),
    );
  });

  it("knowledge seed items are needs_review only", () => {
    assert.equal(KNOWLEDGE_SEED_ITEMS.length, 10);
    assert.ok(
      KNOWLEDGE_SEED_ITEMS.every((item) => item.status === "needs_review"),
    );
  });

  it("PR119 docs exist and forbid operational DB mutation language", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-119-OPERATIONAL-DATA-QUALITY-OPS.md"),
      "utf8",
    );
    assert.match(hub, /운영 DB/);
    assert.match(hub, /대량 수정 없음/);
    assert.match(hub, /PR-120/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);

    const issues = readFileSync(
      join(ROOT, "docs/PR-119-DATA-ISSUES-AND-SOURCES.md"),
      "utf8",
    );
    assert.match(issues, /공식 출처 확인 필요/);
    assert.match(issues, /Critical/);
  });
});
