import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  SEARCH_EMPTY_MESSAGE,
  SEARCH_EMPTY_VISIBILITY_NOTE,
  SEARCH_ERROR_MESSAGE,
} from "@/lib/search/constants";
import { SEARCH_VISIBILITY_SOURCES } from "@/lib/search/types";

const ROOT = process.cwd();

const FORBIDDEN_EMPTY_PHRASES = [
  "없음",
  "데이터 없음",
  "관리자에게 문의",
  "무조건 등록",
  "전체 공개 필요",
  "미검수 데이터",
];

describe("PR127 search UX ops (static, no database)", () => {
  it("hub doc links structure, visibility, and implementation plan", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-127-SEARCH-UX-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-127-SEARCH-STRUCTURE-ANALYSIS/);
    assert.match(hub, /PR-127-PUBLIC-VISIBILITY-REVIEW/);
    assert.match(hub, /미접근/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("search copy constants follow PR127 empty and error guidance", () => {
    assert.match(SEARCH_EMPTY_MESSAGE, /공개 정보가 없습니다/);
    assert.match(SEARCH_EMPTY_VISIBILITY_NOTE, /검수 중인 항목/);
    assert.match(SEARCH_ERROR_MESSAGE, /불러오지 못했습니다/);
    for (const phrase of FORBIDDEN_EMPTY_PHRASES) {
      assert.doesNotMatch(SEARCH_EMPTY_MESSAGE, new RegExp(phrase));
    }
  });

  it("global search results group by domain and use contextual action labels", () => {
    const results = readFileSync(
      join(ROOT, "app/search/search-results.tsx"),
      "utf8",
    );
    const labels = readFileSync(join(ROOT, "lib/search/labels.ts"), "utf8");
    assert.match(results, /groupSearchResults/);
    assert.match(results, /SEARCH_DOMAIN_DISPLAY_ORDER/);
    assert.match(results, /SEARCH_RESULT_ACTION_LABEL/);
    assert.match(labels, /보험사 보기/);
    assert.match(labels, /필요서류 확인/);
    assert.doesNotMatch(results, />바로가기</);
  });

  it("search page uses SearchEmptyPanel and does not weaken public fetch", () => {
    const page = readFileSync(join(ROOT, "app/search/page.tsx"), "utf8");
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.match(page, /SearchEmptyPanel/);
    assert.match(page, /searchPublicContent/);
    assert.doesNotMatch(pub, /isPublished:\s*true[\s\S]*\/\/\s*PR-127 bypass/i);
    assert.ok(Object.keys(SEARCH_VISIBILITY_SOURCES).length >= 5);
  });

  it("browse next steps and empty states link to public hubs", () => {
    const browse = readFileSync(
      join(ROOT, "components/search/browse-next-steps.tsx"),
      "utf8",
    );
    assert.match(browse, /\/directory/);
    assert.match(browse, /\/claim-documents/);
    assert.match(browse, /\/knowledge/);
    assert.match(browse, /\/search/);

    const directory = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    const claim = readFileSync(
      join(ROOT, "app/claim-documents/claim-document-explorer.tsx"),
      "utf8",
    );
    const knowledge = readFileSync(
      join(ROOT, "app/knowledge/knowledge-archive-list.tsx"),
      "utf8",
    );
    assert.match(directory, /BrowseNextSteps/);
    assert.match(claim, /BrowseNextSteps/);
    assert.match(knowledge, /BrowseNextSteps/);
  });

  it("knowledge empty message mentions non-public review items", () => {
    const filter = readFileSync(
      join(ROOT, "lib/knowledge/archive-filter.ts"),
      "utf8",
    );
    assert.match(filter, /검수 전·비공개/);
  });

  it("public search imports canonical visibility WHERE helpers (PR127)", () => {
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.match(pub, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(pub, /PUBLIC_KNOWLEDGE_WHERE/);
    assert.match(pub, /PUBLIC_DISCLOSURE_LINK_WHERE/);
    assert.match(pub, /PUBLIC_MESSAGE_TEMPLATE_WHERE/);
  });
});
