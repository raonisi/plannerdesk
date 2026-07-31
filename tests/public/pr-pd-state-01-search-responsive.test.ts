import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  SEARCH_EMPTY_DESCRIPTION,
  SEARCH_EMPTY_EYEBROW,
  SEARCH_EMPTY_MESSAGE,
  SEARCH_EMPTY_NEXT_STEP,
} from "@/lib/search/constants";
import { buildPublicSearchHref } from "@/lib/search/search-href";

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("PR-PD-STATE-01 mobile search empty state", () => {
  it("constrains the two affected flex items to the available width", () => {
    const home = read("app/home-client.tsx");
    const search = read("app/search/page.tsx");
    const contentPage = read("components/content-page.tsx");

    assert.match(home, /mx-auto w-full min-w-0 max-w-7xl/);
    assert.match(search, /<ContentSection className="w-full">/);
    assert.match(search, /mx-auto w-full min-w-0 max-w-3xl/);
    assert.match(contentPage, /className\?: string/);
  });

  it("uses the reviewed empty-state hierarchy and query context", () => {
    const panel = read("components/search/search-empty-panel.tsx");

    assert.equal(SEARCH_EMPTY_EYEBROW, "검색 결과 없음");
    assert.equal(SEARCH_EMPTY_MESSAGE, "검색 결과가 없습니다.");
    assert.equal(
      SEARCH_EMPTY_DESCRIPTION,
      "공개 정보에서 일치하는 항목을 찾지 못했습니다.",
    );
    assert.equal(
      SEARCH_EMPTY_NEXT_STEP,
      "검색어를 줄이거나 필터를 초기화해 주세요.",
    );
    assert.match(panel, /0건/);
    assert.match(panel, /&quot;\{query\}&quot;/);
    assert.match(panel, /max-w-full min-w-0 rounded-xl/);
    assert.doesNotMatch(panel, /overflow-x-(?:hidden|clip)/);
    assert.match(panel, /\[overflow-wrap:anywhere\]/);
  });

  it("offers distinct clear, reset, and browse actions", () => {
    const panel = read("components/search/search-empty-panel.tsx");

    assert.match(panel, /href="\/search\?focus=search"/);
    assert.match(panel, /검색어 지우기/);
    assert.match(panel, /buildPublicSearchHref\(query, "all"\)/);
    assert.match(panel, /필터 초기화/);
    assert.match(panel, /disabled/);
    assert.match(panel, /전체 자료 보기/);
    assert.equal(buildPublicSearchHref("가상의검색어987654", "all"), "/search?q=%EA%B0%80%EC%83%81%EC%9D%98%EA%B2%80%EC%83%89%EC%96%B4987654");
  });

  it("focuses the cleared query once without a timer or global autofocus", () => {
    const form = read("components/search/search-query-form.tsx");

    assert.match(form, /useLayoutEffect/);
    assert.match(form, /didFocusRef\.current/);
    assert.match(form, /focus\(\{ preventScroll: true \}\)/);
    assert.doesNotMatch(form, /setTimeout|autoFocus/);
  });

  it("keeps empty-state actions and filter chips at least 44px tall", () => {
    const panel = read("components/search/search-empty-panel.tsx");
    const filter = read("components/search/search-domain-filter.tsx");

    assert.ok((panel.match(/min-h-11/g) ?? []).length >= 4);
    assert.match(filter, /inline-flex min-h-11/);
  });
});
