import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DATA_FRESHNESS_COPY,
  DATA_FRESHNESS_FORBIDDEN_PHRASES,
  formatVerifiedDate,
  formatVerifiedDateShort,
  getFreshnessDateLabel,
  getOfficialSourceLabel,
  resolveOfficialSourceUrl,
} from "@/lib/public/data-freshness";

const ROOT = process.cwd();

describe("PR-BS-10 data freshness UI (static, no DB)", () => {
  it("formats verified dates without fabricating missing values", () => {
    assert.equal(formatVerifiedDate("2024-03-15"), "2024.03.15");
    assert.equal(formatVerifiedDate(null), DATA_FRESHNESS_COPY.publicMissingDateLabel);
    assert.equal(formatVerifiedDate(undefined), DATA_FRESHNESS_COPY.publicMissingDateLabel);
    assert.equal(getFreshnessDateLabel(null).hasDate, false);
    assert.match(getFreshnessDateLabel("2024-01-02").label, /2024\.01\.02/);
  });

  it("treats invalid dates as missing without broken UI text", () => {
    assert.equal(formatVerifiedDateShort("not-a-date"), null);
    assert.equal(formatVerifiedDate("not-a-date"), DATA_FRESHNESS_COPY.publicMissingDateLabel);
    assert.equal(getFreshnessDateLabel("not-a-date").hasDate, false);
    assert.equal(getFreshnessDateLabel("not-a-date").label, DATA_FRESHNESS_COPY.publicMissingDateLabel);
  });

  it("prefers lastVerifiedAt over reviewedAt", () => {
    const label = getFreshnessDateLabel("2024-05-01", "2024-06-01");
    assert.match(label.label, /2024\.05\.01/);
  });

  it("shows official source link only when officialSourceUrl exists", () => {
    const withUrl = getOfficialSourceLabel("https://example.com/official");
    assert.equal(withUrl.kind, "link");
    assert.equal(withUrl.label, DATA_FRESHNESS_COPY.officialSourceConfirm);

    const missingOfficial = getOfficialSourceLabel(null);
    assert.equal(missingOfficial.kind, "missing");
    assert.equal(missingOfficial.label, DATA_FRESHNESS_COPY.missingSource);

    assert.equal(resolveOfficialSourceUrl("https://example.com/official"), "https://example.com/official");
    assert.equal(resolveOfficialSourceUrl(null), null);
    assert.equal(resolveOfficialSourceUrl("  "), null);
  });

  it("does not treat non-official URLs as official source confirmation", () => {
    const label = getOfficialSourceLabel(undefined);
    assert.equal(label.kind, "missing");
    assert.doesNotMatch(
      readFileSync(join(ROOT, "lib/public/data-freshness.ts"), "utf8"),
      /sourceUrl\?\./,
    );
  });

  it("forbids payout guarantee and always-fresh wording in public freshness UI", () => {
    const targets = [
      "components/content/data-freshness-meta.tsx",
      "lib/public/data-freshness.ts",
      "components/claim-documents/claim-form-list-item.tsx",
      "app/search/search-results.tsx",
    ];
    for (const rel of targets) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      const withoutForbiddenList = source.replace(
        /DATA_FRESHNESS_FORBIDDEN_PHRASES[\s\S]*?\] as const;/,
        "",
      );
      for (const phrase of DATA_FRESHNESS_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(withoutForbiddenList, new RegExp(phrase));
      }
    }
  });

  it("DataFreshnessMeta does not expose admin-only fields", () => {
    const meta = readFileSync(
      join(ROOT, "components/content/data-freshness-meta.tsx"),
      "utf8",
    );
    assert.doesNotMatch(meta, /adminMemo|internalNote|reviewNote|sourceNote/i);
    assert.doesNotMatch(meta, /verificationStatus|reviewStatus/);
    assert.doesNotMatch(meta, /freshnessUncertain|확인일 정보 부족|최신성 확인 필요/);
  });

  it("public directory, claim list, and search integrate freshness meta", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    const item = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    const search = readFileSync(join(ROOT, "app/search/search-results.tsx"), "utf8");
    assert.doesNotMatch(card, /DataFreshnessMeta/);
    assert.match(explorer, /DIRECTORY_PUBLIC_GLOBAL_NOTICE/);
    assert.match(item, /DataFreshnessMeta/);
    assert.match(search, /DataFreshnessMeta/);
    assert.doesNotMatch(item, /StatusBadge/);
    assert.match(item, /kind === "pdf"[\s\S]*DataFreshnessMeta/);
  });

  it("public fetch visibility guards remain unchanged", () => {
    const insurers = readFileSync(join(ROOT, "lib/public/insurers.ts"), "utf8");
    const claims = readFileSync(
      join(ROOT, "lib/public/claim-documents.ts"),
      "utf8",
    );
    assert.match(insurers, /isPublished:\s*true/);
    assert.match(claims, /isPublished:\s*true/);
    assert.match(insurers, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(claims, /PUBLIC_VERIFICATION_STATUSES/);
  });

  it("search does not expose raw db queries", () => {
    const search = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.doesNotMatch(search, /prisma\.\$executeRaw|migrate|createMany/i);
  });
});
