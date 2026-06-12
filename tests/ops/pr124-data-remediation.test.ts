import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { insurerDirectoryEntries } from "@/lib/content/insurers";
import {
  isInsurerPubliclyVisible,
  PUBLIC_VERIFICATION_STATUSES,
} from "@/lib/public/insurers";

const ROOT = process.cwd();

describe("PR124 data remediation (fixture static, no database)", () => {
  it("hub links classification, change log, and visibility review", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-124-DATA-REMEDIATION-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-124-DATA-REMEDIATION-CLASSIFICATION/);
    assert.match(hub, /PR-124-DATA-CHANGE-LOG/);
    assert.match(hub, /미접근/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("hanwha-general systemUrl is HTTPS after PR124", () => {
    const hanwha = insurerDirectoryEntries.find((e) => e.id === "hanwha-general");
    assert.ok(hanwha);
    assert.equal(hanwha.systemUrl, "https://portal.hwgeneralins.com/");
    const httpAny = insurerDirectoryEntries.filter((e) =>
      e.systemUrl?.trim().startsWith("http://"),
    );
    assert.equal(httpAny.length, 0);
  });

  it("change log records hanwha fix with verification note", () => {
    const log = readFileSync(
      join(ROOT, "docs/PR-124-DATA-CHANGE-LOG.md"),
      "utf8",
    );
    assert.match(log, /hanwha-general/);
    assert.match(log, /https:\/\/portal\.hwgeneralins\.com/);
    assert.match(log, /HEAD/);
  });

  it("classification defers unverified fax, claimPageUrl, and duplicate insurers", () => {
    const classification = readFileSync(
      join(ROOT, "docs/PR-124-DATA-REMEDIATION-CLASSIFICATION.md"),
      "utf8",
    );
    assert.match(classification, /보류/);
    assert.match(classification, /claimPageUrl/);
    assert.match(classification, /db-general/);
    assert.match(classification, /insurerId.*null/);
  });

  it("visibility unchanged for published needs_review insurers", () => {
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

  it("claim candidates remain disabled until official-source review", () => {
    assert.equal(claimDocumentCandidateFallback.length, 0);
  });
});
