import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PLANNER_FAVORITES_FORBIDDEN_STORAGE_FIELDS,
  isPlannerFavoriteAllowed,
  isSensitiveFavoriteLabel,
  isUnsafeFavoriteHref,
  sanitizePlannerFavorite,
} from "@/lib/planner-favorites/favorite-safety";

describe("PR-BS-13 planner favorites safety helpers", () => {
  it("blocks admin and answer-assistant href paths", () => {
    assert.equal(isUnsafeFavoriteHref("/admin"), true);
    assert.equal(isUnsafeFavoriteHref("/admin/insurers"), true);
    assert.equal(isUnsafeFavoriteHref("/planner/answer-assistant"), true);
    assert.equal(isUnsafeFavoriteHref("/answer-assistant"), true);
    assert.equal(isUnsafeFavoriteHref("/directory"), false);
    assert.equal(isUnsafeFavoriteHref("/work-tools?tool=bmi-calculator"), false);
  });

  it("blocks sensitive query parameters in href", () => {
    assert.equal(isUnsafeFavoriteHref("/directory?contractNumber=123"), true);
    assert.equal(isUnsafeFavoriteHref("/search?customer=abc"), true);
    assert.equal(isUnsafeFavoriteHref("/directory?search=삼성화재"), false);
    assert.equal(isUnsafeFavoriteHref("/directory?resident=900101-1234567"), true);
  });

  it("blocks external and arbitrary internal paths", () => {
    assert.equal(isUnsafeFavoriteHref("https://evil.example"), true);
    assert.equal(isUnsafeFavoriteHref("//evil.example/path"), true);
    assert.equal(isUnsafeFavoriteHref("/planner/dashboard"), true);
  });

  it("isSensitiveFavoriteLabel mirrors PII guard", () => {
    assert.equal(isSensitiveFavoriteLabel("삼성화재"), false);
    assert.equal(isSensitiveFavoriteLabel("계약번호 12345"), true);
    assert.equal(isSensitiveFavoriteLabel("고객: 홍길동"), true);
  });

  it("isPlannerFavoriteAllowed rejects prohibited types and fields", () => {
    const allowed = {
      type: "claimDocument",
      targetId: "insurer-claim-docs",
      href: "/claim-documents?insurer=samsung",
      label: "청구서류",
    };
    assert.equal(isPlannerFavoriteAllowed(allowed), true);
    assert.deepEqual(sanitizePlannerFavorite(allowed), allowed);

    assert.equal(
      isPlannerFavoriteAllowed({
        ...allowed,
        type: "answer_assistant_prompt",
      }),
      false,
    );
    assert.equal(
      isPlannerFavoriteAllowed({
        ...allowed,
        href: "/admin/claim-documents",
      }),
      false,
    );
    assert.equal(
      isPlannerFavoriteAllowed({
        ...allowed,
        label: "고객: 김철수",
      }),
      false,
    );
    assert.equal(sanitizePlannerFavorite({ ...allowed, label: "고객: 김철수" }), null);
  });

  it("forbidden storage field list covers PR-BS-13 blocklist", () => {
    for (const field of [
      "customerName",
      "contractNumber",
      "answerAssistantPrompt",
      "adminMemo",
      "token",
    ]) {
      assert.ok(
        (PLANNER_FAVORITES_FORBIDDEN_STORAGE_FIELDS as readonly string[]).includes(
          field,
        ),
      );
    }
  });
});
