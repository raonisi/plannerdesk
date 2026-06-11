import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  SEARCH_FORBIDDEN_PHRASES,
  SEARCH_IDLE_PII_NOTICE,
} from "@/lib/search/constants";
import { SEARCH_DOMAIN_DISPLAY_ORDER } from "@/lib/search/labels";
import { normalizePublicSearchQuery } from "@/lib/search/query-validation";
import { SEARCH_VISIBILITY_SOURCES } from "@/lib/search/types";

const ROOT = process.cwd();

describe("PR-BS-03 search filter refinement (static, no DB)", () => {
  it("normalizes search query whitespace", () => {
    assert.equal(normalizePublicSearchQuery("  삼성  화재  "), "삼성 화재");
  });

  it("search page uses domain filter, idle panel, and public fetch only", () => {
    const page = readFileSync(join(ROOT, "app/search/page.tsx"), "utf8");
    assert.match(page, /SearchDomainFilter/);
    assert.match(page, /SearchIdlePanel/);
    assert.match(page, /searchPublicContent/);
    assert.doesNotMatch(page, /searchAdminContent/);
    assert.doesNotMatch(page, /AnswerAssistant|work-tools/i);
  });

  it("domain filter is always visible and links to hubs when idle", () => {
    const filter = readFileSync(
      join(ROOT, "components/search/search-domain-filter.tsx"),
      "utf8",
    );
    assert.match(filter, /PUBLIC_SEARCH_FILTER_OPTIONS/);
    assert.match(filter, /\/directory/);
    assert.match(filter, /\/claim-documents/);
  });

  it("result badges are domain-specific and work_link is grouped", () => {
    const results = readFileSync(
      join(ROOT, "app/search/search-results.tsx"),
      "utf8",
    );
    assert.match(results, /SEARCH_DOMAIN_BADGE_CLASS/);
    assert.ok(SEARCH_DOMAIN_DISPLAY_ORDER.includes("work_link"));
    assert.match(results, /DataFreshnessMeta/);
    assert.match(results, /Answer Assistant는 검색 대상이 아닙니다/);
  });

  it("empty and idle copy avoid forbidden payout and guarantee phrases", () => {
    const targets = [
      "lib/search/constants.ts",
      "components/search/search-empty-panel.tsx",
      "components/search/search-idle-panel.tsx",
      "app/search/page.tsx",
    ];
    for (const rel of targets) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      const withoutList = source.replace(
        /SEARCH_FORBIDDEN_PHRASES[\s\S]*?\] as const;/,
        "",
      );
      for (const phrase of SEARCH_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(withoutList, new RegExp(phrase));
      }
    }
    assert.match(SEARCH_IDLE_PII_NOTICE, /개인정보/);
  });

  it("public search uses canonical visibility helpers", () => {
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.match(pub, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(pub, /PUBLIC_KNOWLEDGE_WHERE/);
    assert.match(pub, /PUBLIC_DISCLOSURE_LINK_WHERE/);
    assert.match(pub, /PUBLIC_MESSAGE_TEMPLATE_WHERE/);
    assert.doesNotMatch(pub, /prisma\.correctionRequest|getVerifiedAnswerAssistantAccess|usageAudit/i);
    assert.ok(Object.keys(SEARCH_VISIBILITY_SOURCES).length >= 6);
  });

  it("admin search and work tools internals stay out of public search", () => {
    const admin = readFileSync(join(ROOT, "lib/search/admin.ts"), "utf8");
    const types = readFileSync(join(ROOT, "lib/search/types.ts"), "utf8");
    assert.doesNotMatch(admin, /work_link:/);
    assert.match(types, /Exclude<PublicSearchDomain, "work_link">/);
    const work = readFileSync(
      join(ROOT, "lib/search/work-links-search.ts"),
      "utf8",
    );
    assert.match(work, /isPublished:\s*true/);
    assert.doesNotMatch(work, /canAccessWorkTools|getWorkToolsAccess/);
  });
});
