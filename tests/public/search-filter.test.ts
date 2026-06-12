import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  SEARCH_EMPTY_MESSAGE,
  SEARCH_EMPTY_PII_NOTICE,
  SEARCH_FORBIDDEN_PHRASES,
  SEARCH_FORM_FRESHNESS_NOTICE,
  SEARCH_FORM_PLACEHOLDER,
  SEARCH_IDLE_FRESHNESS_NOTICE,
  SEARCH_IDLE_PII_NOTICE,
} from "@/lib/search/constants";
import { SEARCH_DOMAIN_DISPLAY_ORDER } from "@/lib/search/labels";
import { normalizePublicSearchQuery } from "@/lib/search/query-validation";
import { SEARCH_VISIBILITY_SOURCES } from "@/lib/search/types";

const ROOT = process.cwd();

const SEARCH_UI_TARGETS = [
  "lib/search/constants.ts",
  "components/search/search-empty-panel.tsx",
  "components/search/search-idle-panel.tsx",
  "app/search/page.tsx",
  "app/search/search-results.tsx",
];

describe("PR-BS-11 public search filter UI (static, no DB)", () => {
  it("normalizes search query whitespace", () => {
    assert.equal(normalizePublicSearchQuery("  삼성  화재  "), "삼성 화재");
  });

  it("search page uses domain filter, idle panel, and public fetch only", () => {
    const page = readFileSync(join(ROOT, "app/search/page.tsx"), "utf8");
    assert.match(page, /SearchDomainFilter/);
    assert.match(page, /SearchIdlePanel/);
    assert.match(page, /searchPublicContent/);
    assert.match(page, /SEARCH_FORM_PLACEHOLDER/);
    assert.match(page, /SEARCH_FORM_FRESHNESS_NOTICE/);
    assert.doesNotMatch(page, /searchAdminContent/);
    assert.doesNotMatch(page, /AnswerAssistant|work-tools/i);
  });

  it("pre-search copy discourages PII and promotes official source check", () => {
    assert.match(SEARCH_IDLE_PII_NOTICE, /개인정보/);
    assert.match(SEARCH_IDLE_PII_NOTICE, /계약번호/);
    assert.match(SEARCH_FORM_FRESHNESS_NOTICE, /공식 출처/);
    assert.match(SEARCH_IDLE_FRESHNESS_NOTICE, /최신 확인일/);
    assert.match(SEARCH_FORM_PLACEHOLDER, /보험사명/);
  });

  it("empty state uses safe copy without payout or guarantee claims", () => {
    assert.equal(SEARCH_EMPTY_MESSAGE, "검색 결과가 없습니다.");
    assert.match(SEARCH_EMPTY_PII_NOTICE, /상담 원문/);
    for (const rel of SEARCH_UI_TARGETS) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      const withoutList = source.replace(
        /SEARCH_FORBIDDEN_PHRASES[\s\S]*?\] as const;/,
        "",
      );
      for (const phrase of SEARCH_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(withoutList, new RegExp(phrase));
      }
    }
  });

  it("domain filter tabs cover public-safe domains only", () => {
    const filter = readFileSync(
      join(ROOT, "components/search/search-domain-filter.tsx"),
      "utf8",
    );
    const labels = readFileSync(join(ROOT, "lib/search/labels.ts"), "utf8");
    assert.match(filter, /PUBLIC_SEARCH_FILTER_OPTIONS/);
    assert.match(labels, /label: "전체"/);
    assert.match(labels, /label: "보험사"/);
    assert.match(labels, /label: "청구서류"/);
    assert.match(labels, /label: "공시·약관"/);
    assert.match(labels, /label: "업무 링크"/);
    assert.doesNotMatch(filter, /Work Tools|Answer Assistant|상병코드|수술코드/i);
  });

  it("result cards show domain badges and reuse DataFreshnessMeta", () => {
    const results = readFileSync(
      join(ROOT, "app/search/search-results.tsx"),
      "utf8",
    );
    assert.match(results, /SEARCH_DOMAIN_BADGE_CLASS/);
    assert.ok(SEARCH_DOMAIN_DISPLAY_ORDER.includes("work_link"));
    assert.match(results, /DataFreshnessMeta/);
    assert.match(results, /officialSourceUrl/);
    assert.match(results, /Answer Assistant는 검색 대상이 아닙니다/);
    assert.doesNotMatch(results, /adminMemo|reviewNote|privateMemo/i);
  });

  it("public search excludes Work Tools, Answer Assistant, and Admin data", () => {
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.match(pub, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(pub, /PUBLIC_KNOWLEDGE_WHERE/);
    assert.match(pub, /PUBLIC_DISCLOSURE_LINK_WHERE/);
    assert.match(pub, /PUBLIC_MESSAGE_TEMPLATE_WHERE/);
    assert.doesNotMatch(
      pub,
      /prisma\.correctionRequest|getVerifiedAnswerAssistantAccess|usageAudit|canAccessWorkTools|getWorkToolsAccess|adminMemo|reviewNote/i,
    );
    assert.ok(Object.keys(SEARCH_VISIBILITY_SOURCES).length >= 6);
    assert.doesNotMatch(
      Object.keys(SEARCH_VISIBILITY_SOURCES).join(","),
      /work_tools|answer_assistant|admin/i,
    );
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

  it("claim search maps officialSourceUrl without non-official fallback", () => {
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.doesNotMatch(
      pub,
      /officialSourceUrl:\s*row\.officialSourceUrl \?\? row\.claimFormUrl/,
    );
  });
});
