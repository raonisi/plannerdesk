import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { formatVerifiedDateShort } from "@/lib/public/data-freshness";
import { rankSearchResults } from "@/lib/search/ranking";
import {
  getSearchVerificationPresentation,
  resolveSearchVerificationState,
  withSearchVerification,
} from "@/lib/search/search-verification-status";
import { dedupeSearchResultsByLinkIdentity } from "@/lib/search/search-url-canonicalization";
import {
  getPlannerVerifiedWorkLinks,
  getPublicVerifiedWorkLinks,
} from "@/lib/work-links/verified-catalog";

const ROOT = process.cwd();
const NOW = new Date("2026-07-10T12:00:00.000Z");

const CLAIM_BASELINE = [
  ["samsung-fire:claim_form", "https://www.samsungfire.com/v2/html/claim/01/C_010_030_001.html"],
  ["hanwha-general:claim_form", "https://www.hwgeneralins.com/fplaza/compensation/receipt01.do"],
  ["hyundai-marine:claim_form", "https://www.hi.co.kr/serviceAction.do?menuId=100631"],
  ["meritz-fire:claim_form", "https://www.meritzfire.com/compensation/longterm-insurance/request-document.do#!/"],
  ["db-general:claim_form", "https://www.idbins.com/pc/bizxpress/ct/dc/FWCUSV1301.shtm"],
  ["kb-insurance:claim_form", "https://www.kbinsure.co.kr/CG205020001.ec"],
  ["heungkuk-fire:claim_form", "https://www.heungkukfire.co.kr/FRW/compensation/accidentDocInfo.do"],
  ["nh-general:claim_form", "https://www.nhfire.co.kr/customer/bilgdcm/retrieveBilgDcmList.nhfire"],
] as const;

function result(id: string, verificationDate: string | null) {
  return withSearchVerification(
    {
      id,
      type: "work_link" as const,
      title: `${id} · 청구양식 열기`,
      summary: "청구 업무",
      url: "/directory",
      externalHref: `https://example.com/${encodeURIComponent(id)}`,
    },
    verificationDate,
    { now: NOW },
  );
}

describe("PR-WC-03 search freshness gate", () => {
  it("formats a valid date as an explicit verified label", () => {
    const state = resolveSearchVerificationState("2026-07-10", { now: NOW });

    assert.equal(state.status, "verified");
    assert.equal(state.verificationDate, "2026-07-10");
    assert.equal(state.label, "2026.07.10 확인");
  });

  it("classifies null, undefined, empty, and whitespace as missing", () => {
    for (const value of [null, undefined, "", "   "]) {
      const state = resolveSearchVerificationState(value, { now: NOW });
      assert.equal(state.status, "missing");
      assert.equal(state.verificationDate, null);
      assert.equal(state.label, "확인일 미등록");
    }
  });

  it("classifies unsupported and impossible dates as invalid", () => {
    for (const value of ["not-a-date", "2026-02-30", "2025-02-29"]) {
      const state = resolveSearchVerificationState(value, { now: NOW });
      assert.equal(state.status, "invalid");
      assert.equal(state.verificationDate, null);
      assert.equal(state.label, "확인일 미등록");
    }
  });

  it("accepts leap day only in a leap year", () => {
    assert.equal(
      resolveSearchVerificationState("2024-02-29", { now: NOW }).verificationDate,
      "2024-02-29",
    );
    assert.equal(formatVerifiedDateShort("2024-02-29"), "2024.02.29");
    assert.equal(formatVerifiedDateShort("2025-02-29"), null);
  });

  it("supports timezone-qualified ISO datetime without shifting its calendar date", () => {
    const positiveOffset = resolveSearchVerificationState(
      "2026-07-10T00:30:00+09:00",
      { now: NOW },
    );
    const utc = resolveSearchVerificationState("2026-07-10T23:30:00.000Z", {
      now: NOW,
    });

    assert.equal(positiveOffset.verificationDate, "2026-07-10");
    assert.equal(positiveOffset.label, "2026.07.10 확인");
    assert.equal(utc.verificationDate, "2026-07-10");
    assert.equal(
      resolveSearchVerificationState("2026-07-10T12:00:00", { now: NOW }).status,
      "invalid",
    );
  });

  it("reuses the existing freshness policy without changing the date", () => {
    const needsCheck = resolveSearchVerificationState("2026-05-15", { now: NOW });
    const stale = resolveSearchVerificationState("2026-01-01", { now: NOW });

    assert.equal(needsCheck.status, "needs_check");
    assert.equal(needsCheck.label, "2026.05.15 확인 · 재확인 권장");
    assert.equal(stale.status, "stale");
    assert.equal(stale.label, "2026.01.01 확인 · 확인 필요");
  });

  it("maps every result to an explicit verification state without hiding missing dates", () => {
    const missing = result("missing", null);
    const verified = result("verified", "2026-07-10");

    assert.equal(missing.verification.status, "missing");
    assert.equal(verified.verification.status, "verified");
    assert.equal([missing, verified].length, 2);
  });

  it("keeps the eight claim baseline results in the same order", () => {
    const results = CLAIM_BASELINE.map(([id, href]) =>
      withSearchVerification(
        {
          id,
          type: "work_link" as const,
          title: `${id} · 청구양식 열기`,
          summary: "청구 업무",
          url: "/directory",
          externalHref: href,
        },
        null,
        { now: NOW },
      ),
    );

    assert.equal(results.length, 8);
    assert.deepEqual(
      results.map((entry) => entry.id),
      CLAIM_BASELINE.map(([id]) => id),
    );
    assert.deepEqual(
      results.map((entry) => entry.externalHref),
      CLAIM_BASELINE.map(([, href]) => href),
    );
  });

  it("does not rank a verified result ahead of an earlier missing result", () => {
    const missing = result("first-missing", null);
    const verified = result("second-verified", "2026-07-10");

    assert.deepEqual(
      rankSearchResults([missing, verified], "not-present").map((entry) => entry.id),
      ["first-missing", "second-verified"],
    );
  });

  it("keeps DB and KB canonical claim dedupe behavior", () => {
    const samples = [
      { id: "db-general", insurerKey: "db-general", href: "https://db.example/claim" },
      { id: "db-alias", insurerKey: "db-general", href: "https://db.example/claim" },
      { id: "kb-general", insurerKey: "kb-general", href: "https://kb.example/claim" },
      { id: "kb-alias", insurerKey: "kb-general", href: "https://kb.example/claim" },
    ];
    const deduped = dedupeSearchResultsByLinkIdentity(samples, (sample) => ({
      insurerKey: sample.insurerKey,
      action: "claim",
      url: sample.href,
    }));

    assert.deepEqual(deduped.map((sample) => sample.id), ["db-general", "kb-general"]);
  });

  it("preserves result links and actions while adding verification metadata", () => {
    const before = {
      id: "db-general:claim_form",
      type: "work_link" as const,
      title: "DB손해보험 · 청구양식 열기",
      url: "/directory?search=DB손해보험",
      externalHref: "https://www.idbins.com/claim",
      linkTypeLabel: "청구양식 열기",
    };
    const after = withSearchVerification(before, null, { now: NOW });

    assert.equal(after.url, before.url);
    assert.equal(after.externalHref, before.externalHref);
    assert.equal(after.linkTypeLabel, before.linkTypeLabel);
  });

  it("keeps fixture markers out of runtime catalogs", () => {
    const runtime = JSON.stringify({
      planner: getPlannerVerifiedWorkLinks(),
      public: getPublicVerifiedWorkLinks(),
    });

    assert.doesNotMatch(runtime, /example\.invalid|예시 보험사 E|mock-wl-pub-claim-005/);
  });

  it("provides visible and screen-reader verification text in search cards", () => {
    const resultCards = readFileSync(
      join(ROOT, "app/search/search-results.tsx"),
      "utf8",
    );
    const freshnessBadge = readFileSync(
      join(ROOT, "components/content/freshness-badge.tsx"),
      "utf8",
    );
    const presentation = getSearchVerificationPresentation(
      resolveSearchVerificationState(null, { now: NOW }),
    );

    assert.equal(presentation.label, "확인일 미등록");
    assert.match(resultCards, /getSearchVerificationPresentation/);
    assert.match(freshnessBadge, /aria-label=.*확인 상태/);
  });
});
