import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DATA_FRESHNESS_COPY,
  DATA_FRESHNESS_FORBIDDEN_PHRASES,
  formatVerifiedDate,
  getFreshnessDateLabel,
  getOfficialSourceLabel,
  resolveOfficialSourceUrl,
} from "@/lib/public/data-freshness";

const ROOT = process.cwd();

describe("PR-BS-02 data freshness UX (static, no DB)", () => {
  it("formats verified dates without fabricating missing values", () => {
    assert.equal(formatVerifiedDate("2024-03-15"), "2024.03.15");
    assert.equal(formatVerifiedDate(null), DATA_FRESHNESS_COPY.missingDate);
    assert.equal(formatVerifiedDate(undefined), DATA_FRESHNESS_COPY.missingDate);
    assert.equal(getFreshnessDateLabel(null).hasDate, false);
    assert.match(getFreshnessDateLabel("2024-01-02").label, /2024\.01\.02/);
  });

  it("prefers lastVerifiedAt over reviewedAt", () => {
    const label = getFreshnessDateLabel("2024-05-01", "2024-06-01");
    assert.match(label.label, /2024\.05\.01/);
  });

  it("shows official source link only when URL exists", () => {
    const withUrl = getOfficialSourceLabel("https://example.com/official");
    assert.equal(withUrl.kind, "link");
    assert.equal(withUrl.label, DATA_FRESHNESS_COPY.officialSourceConfirm);

    const missing = getOfficialSourceLabel(null, "  ");
    assert.equal(missing.kind, "missing");
    assert.equal(missing.label, DATA_FRESHNESS_COPY.missingSource);

    assert.equal(
      resolveOfficialSourceUrl(null, "https://fallback.example"),
      "https://fallback.example",
    );
  });

  it("forbids payout guarantee and always-fresh wording in public freshness UI", () => {
    const targets = [
      "components/content/data-freshness-meta.tsx",
      "lib/public/data-freshness.ts",
      "components/directory/insurer-action-card.tsx",
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
  });

  it("public directory and claim list integrate freshness meta", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const item = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    const search = readFileSync(join(ROOT, "app/search/search-results.tsx"), "utf8");
    assert.match(card, /DataFreshnessMeta/);
    assert.match(item, /DataFreshnessMeta/);
    assert.match(search, /DataFreshnessMeta/);
    assert.doesNotMatch(item, /StatusBadge/);
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

  it("search maps existing freshness fields without schema change", () => {
    const search = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.match(search, /lastVerifiedAt/);
    assert.match(search, /officialSourceUrl/);
    assert.doesNotMatch(search, /prisma\.\$executeRaw|migrate|createMany/i);
  });
});
