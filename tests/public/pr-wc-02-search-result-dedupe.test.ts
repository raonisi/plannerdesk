import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getCanonicalPublicInsurerId } from "@/lib/public/insurers";
import {
  canonicalizeSearchResultUrl,
  dedupeSearchResultsByLinkIdentity,
} from "@/lib/search/search-url-canonicalization";
import {
  getPlannerVerifiedWorkLinks,
  getPublicVerifiedWorkLinks,
} from "@/lib/work-links/verified-catalog";

type LinkSample = {
  id: string;
  insurerId: string;
  action: string;
  href: string;
};

function dedupe(samples: readonly LinkSample[]): LinkSample[] {
  return dedupeSearchResultsByLinkIdentity(samples, (sample) => ({
    insurerKey: getCanonicalPublicInsurerId(sample.insurerId),
    action: sample.action,
    url: sample.href,
  }));
}

describe("PR-WC-02 public search result dedupe", () => {
  it("keeps one result for the same insurer, action, and canonical URL", () => {
    const results = dedupe([
      {
        id: "first",
        insurerId: "db-general",
        action: "claim",
        href: "HTTPS://WWW.IDBINS.COM:443/claim/",
      },
      {
        id: "duplicate",
        insurerId: "db-general",
        action: "claim",
        href: "https://www.idbins.com/claim",
      },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["first"]);
  });

  it("dedupes different source fields normalized to the same claim action", () => {
    const href = "https://www.kbinsure.co.kr/claim";
    const results = dedupe([
      { id: "claimPageUrl", insurerId: "kb-general", action: "claim", href },
      { id: "claimFormUrl", insurerId: "kb-general", action: "claim", href },
    ]);

    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, "claimPageUrl");
  });

  it("preserves different URLs for the same insurer and action", () => {
    const results = dedupe([
      {
        id: "guide",
        insurerId: "db-general",
        action: "claim",
        href: "https://www.idbins.com/claim/guide",
      },
      {
        id: "download",
        insurerId: "db-general",
        action: "claim",
        href: "https://www.idbins.com/claim/download",
      },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["guide", "download"]);
  });

  it("preserves the same URL for different insurers", () => {
    const href = "https://shared.example.com/claim";
    const results = dedupe([
      { id: "insurer-a", insurerId: "insurer-a", action: "claim", href },
      { id: "insurer-b", insurerId: "insurer-b", action: "claim", href },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["insurer-a", "insurer-b"]);
  });

  it("preserves different user actions that share a URL", () => {
    const href = "https://www.example.com/common";
    const results = dedupe([
      { id: "homepage", insurerId: "insurer-a", action: "homepage", href },
      { id: "claim", insurerId: "insurer-a", action: "claim", href },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["homepage", "claim"]);
  });

  it("dedupes trailing slash and hash-only URL differences", () => {
    const results = dedupe([
      {
        id: "first",
        insurerId: "insurer-a",
        action: "claim",
        href: "https://www.example.com/claim/#documents",
      },
      {
        id: "duplicate",
        insurerId: "insurer-a",
        action: "claim",
        href: "https://www.example.com/claim",
      },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["first"]);
  });

  it("keeps different query values but normalizes query ordering", () => {
    const differentQueries = dedupe([
      {
        id: "pc",
        insurerId: "insurer-a",
        action: "claim",
        href: "https://www.example.com/claim?channel=pc",
      },
      {
        id: "mobile",
        insurerId: "insurer-a",
        action: "claim",
        href: "https://www.example.com/claim?channel=mobile",
      },
    ]);
    const reorderedQuery = dedupe([
      {
        id: "first",
        insurerId: "insurer-a",
        action: "claim",
        href: "https://www.example.com/claim?b=2&a=1",
      },
      {
        id: "duplicate",
        insurerId: "insurer-a",
        action: "claim",
        href: "https://www.example.com/claim?a=1&b=2",
      },
    ]);

    assert.equal(differentQueries.length, 2);
    assert.deepEqual(reorderedQuery.map((result) => result.id), ["first"]);
  });

  it("handles malformed URLs without dropping results", () => {
    const results = dedupe([
      { id: "first", insurerId: "insurer-a", action: "claim", href: "not a url" },
      { id: "duplicate", insurerId: "insurer-a", action: "claim", href: "not a url" },
      { id: "other", insurerId: "insurer-a", action: "claim", href: "still not a url" },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["first", "other"]);
    assert.match(canonicalizeSearchResultUrl("not a url"), /^raw:/);
  });

  it("keeps the first result from the existing ranked order", () => {
    const results = dedupe([
      {
        id: "higher-ranked",
        insurerId: "db-general",
        action: "claim",
        href: "https://www.idbins.com/claim",
      },
      {
        id: "later",
        insurerId: "db-insurance",
        action: "claim",
        href: "https://www.idbins.com/claim",
      },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["higher-ranked"]);
  });

  it("maps known DB and KB duplicate records to canonical insurer identities", () => {
    assert.equal(getCanonicalPublicInsurerId("db-insurance"), "db-general");
    assert.equal(getCanonicalPublicInsurerId("kb-insurance"), "kb-general");
    assert.equal(getCanonicalPublicInsurerId("db-life"), "db-life");
    assert.equal(getCanonicalPublicInsurerId("kb-life"), "kb-life");
  });

  it("dedupes canonical insurer aliases only when their result URL also matches", () => {
    const sameResult = dedupe([
      {
        id: "db-general",
        insurerId: "db-general",
        action: "insurer",
        href: "/directory?search=DB손해보험",
      },
      {
        id: "db-insurance",
        insurerId: "db-insurance",
        action: "insurer",
        href: "/directory?search=DB손해보험",
      },
    ]);
    const differentResultUrl = dedupe([
      {
        id: "db-general",
        insurerId: "db-general",
        action: "insurer",
        href: "/directory?search=DB손해보험",
      },
      {
        id: "db-insurance",
        insurerId: "db-insurance",
        action: "insurer",
        href: "/directory?search=DB손보",
      },
    ]);

    assert.deepEqual(sameResult.map((result) => result.id), ["db-general"]);
    assert.equal(differentResultUrl.length, 2);
  });

  it("keeps representative operational DB and KB claim samples", () => {
    const results = dedupe([
      {
        id: "db-general",
        insurerId: "db-general",
        action: "claim",
        href: "https://www.idbins.com/pc/bizxpress/ct/dc/FWCUSV1301.shtm",
      },
      {
        id: "db-insurance",
        insurerId: "db-insurance",
        action: "claim",
        href: "https://www.idbins.com/pc/bizxpress/ct/dc/FWCUSV1301.shtm",
      },
      {
        id: "kb-general",
        insurerId: "kb-general",
        action: "claim",
        href: "https://www.kbinsure.co.kr/CG205020001.ec",
      },
      {
        id: "kb-insurance",
        insurerId: "kb-insurance",
        action: "claim",
        href: "https://www.kbinsure.co.kr/CG205020001.ec",
      },
    ]);

    assert.deepEqual(results.map((result) => result.id), ["db-general", "kb-general"]);
  });

  it("does not reintroduce public work-link fixtures", () => {
    const runtimeCatalog = JSON.stringify({
      planner: getPlannerVerifiedWorkLinks(),
      public: getPublicVerifiedWorkLinks(),
    });

    assert.doesNotMatch(runtimeCatalog, /example\.invalid|예시 보험사 E|mock-wl-pub-claim-005/);
  });
});
