import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PLANNER_FAVORITES_FORBIDDEN_UI_PHRASES,
  PLANNER_FAVORITES_PII_NOTICE,
  PLANNER_FAVORITES_PROHIBITED_TYPES,
  containsProhibitedFavoriteText,
  isProhibitedFavoriteType,
} from "@/lib/planner-favorites/pii-guard";
import {
  isAllowedRecentWorkItem,
  pushRecentWorkItem,
  sanitizeRecentWorkItems,
} from "@/lib/planner-favorites/recent-work";
import { SEARCH_QUERY_FAVORITES_DEFERRED_REASON } from "@/lib/planner-favorites/copy";

const ROOT = process.cwd();

describe("PR-BS-06 planner favorites PII guard", () => {
  it("blocks PII-like labels and customer name patterns", () => {
    assert.equal(containsProhibitedFavoriteText("삼성화재 청구"), false);
    assert.equal(containsProhibitedFavoriteText("고객: 홍길동"), true);
    assert.equal(containsProhibitedFavoriteText("계약번호 12345"), true);
    assert.equal(containsProhibitedFavoriteText("진단명 당뇨"), true);
  });

  it("rejects answer assistant and audit favorite types", () => {
    assert.equal(isProhibitedFavoriteType("answer_assistant_prompt"), true);
    assert.equal(isProhibitedFavoriteType("answer_assistant_response"), true);
    assert.equal(isProhibitedFavoriteType("insurer"), false);
  });

  it("sanitizes recent work storage and blocks unsafe href", () => {
    const safe = {
      id: "ins-1",
      label: "삼성화재",
      href: "/directory?search=삼성화재",
      type: "insurer",
    };
    assert.equal(isAllowedRecentWorkItem(safe), true);

    const blocked = {
      id: "x",
      label: "고객: 김철수",
      href: "/directory",
      type: "insurer",
    };
    assert.equal(isAllowedRecentWorkItem(blocked), false);

    const external = {
      id: "y",
      label: "외부",
      href: "https://evil.example",
      type: "shortcut",
    };
    assert.equal(isAllowedRecentWorkItem(external), false);

    const sanitized = sanitizeRecentWorkItems([
      safe,
      blocked,
      { id: "aa", label: "AA", href: "/planner/answer-assistant", type: "tool" },
    ]);
    assert.equal(sanitized.length, 1);
    assert.equal(sanitized[0]?.id, safe.id);
    assert.equal(sanitized[0]?.kind, "directory");
  });

  it("pushRecentWorkItem ignores prohibited items", () => {
    const next = pushRecentWorkItem([], {
      id: "1",
      label: "주민번호 포함",
      href: "/directory",
      type: "insurer",
    });
    assert.equal(next.length, 0);
  });

  it("copy includes required PII notice and forbids risky UI phrases", () => {
    assert.match(PLANNER_FAVORITES_PII_NOTICE, /고객정보/);
    assert.match(PLANNER_FAVORITES_PII_NOTICE, /상담 원문/);
    assert.match(SEARCH_QUERY_FAVORITES_DEFERRED_REASON, /검색어/);

    const panel = readFileSync(
      join(ROOT, "components/dashboard/planner-work-favorites-panel.tsx"),
      "utf8",
    );
    for (const phrase of PLANNER_FAVORITES_FORBIDDEN_UI_PHRASES) {
      assert.doesNotMatch(panel, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("search toggle still excludes work_link and AA domains", () => {
    const toggle = readFileSync(
      join(ROOT, "components/search/search-result-favorite-toggle.tsx"),
      "utf8",
    );
    assert.doesNotMatch(toggle, /work_link/);
    assert.doesNotMatch(toggle, /answer_assistant/);
    for (const type of PLANNER_FAVORITES_PROHIBITED_TYPES) {
      assert.doesNotMatch(toggle, new RegExp(type));
    }
  });
});
