import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { SEARCH_VISIBILITY_SOURCES } from "@/lib/search/types";

const ROOT = process.cwd();

const FORBIDDEN_PUBLIC_PHRASES = [
  "미검수 데이터",
  "관리자 확인 필요",
  "무조건 지급",
  "보험금 확정",
  "DB 오류",
  "Prisma",
];

describe("PR132 advanced unified search (static)", () => {
  it("hub links structure and implementation plan", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-132-ADVANCED-SEARCH-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-132-SEARCH-STRUCTURE-ANALYSIS/);
    assert.match(hub, /work-links-search/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("public search includes work_link domain with published insurer guard", () => {
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    const work = readFileSync(
      join(ROOT, "lib/search/work-links-search.ts"),
      "utf8",
    );
    assert.match(pub, /work_link: searchWorkLinks/);
    assert.match(work, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(work, /isPublished:\s*true/);
    assert.ok(SEARCH_VISIBILITY_SOURCES.work_link);
  });

  it("admin search domain excludes public-only work_link", () => {
    const types = readFileSync(join(ROOT, "lib/search/types.ts"), "utf8");
    const admin = readFileSync(join(ROOT, "lib/search/admin.ts"), "utf8");
    assert.match(types, /Exclude<PublicSearchDomain, "work_link">/);
    assert.doesNotMatch(admin, /work_link:/);
  });

  it("search results group with preview limit and more link", () => {
    const results = readFileSync(
      join(ROOT, "app/search/search-results.tsx"),
      "utf8",
    );
    assert.match(results, /SEARCH_GROUP_PREVIEW_LIMIT/);
    assert.match(results, /SEARCH_GROUP_MORE_LABEL/);
    const labels = readFileSync(join(ROOT, "lib/search/labels.ts"), "utf8");
    assert.match(labels, /work_link/);
    assert.match(results, /groupSearchResults/);
  });

  it("filter options include work link pill", () => {
    const labels = readFileSync(join(ROOT, "lib/search/labels.ts"), "utf8");
    assert.match(labels, /workLink/);
    assert.match(labels, /업무 링크/);
  });

  it("empty and error copy avoid forbidden phrases", () => {
    const constants = readFileSync(
      join(ROOT, "lib/search/constants.ts"),
      "utf8",
    );
    assert.match(constants, /공개 전 검수 중인 항목/);
    assert.match(constants, /업무 링크는 공식 출처/);
    for (const phrase of FORBIDDEN_PUBLIC_PHRASES) {
      assert.doesNotMatch(constants, new RegExp(phrase));
    }
  });

  it("search page uses public fetch only and responsive filter row", () => {
    const page = readFileSync(join(ROOT, "app/search/page.tsx"), "utf8");
    assert.match(page, /searchPublicContent/);
    assert.doesNotMatch(page, /searchAdminContent/);
    assert.match(page, /overflow-x-auto/);
  });

  it("knowledge search adds tag match without schema change", () => {
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.match(pub, /tags: \{ has: query \}/);
  });
});
