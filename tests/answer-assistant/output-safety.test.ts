import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateGeneratedDraft } from "@/lib/answer-assistant/output-safety";

const BLOCKED_OUTPUT_PHRASES = [
  "지급됩니다",
  "받을 수 있습니다",
  "보장됩니다",
  "청구 가능합니다",
  "면책입니다",
  "부지급입니다",
  "받을 가능성이 높습니다",
  "지급 가능성이 높습니다",
  "얼마 받을 수 있습니다",
  "진단서상 가능합니다",
  "이 진단이면 해당됩니다",
  "손해사정 결과가 맞습니다",
  "부지급이 타당합니다",
  "무조건 가입",
  "반드시 가입",
  "100% 보장",
  "확정 지급",
  "지금 안 하면 손해",
  "해지하면 큰일",
] as const;

describe("Answer Assistant output safety", () => {
  for (const phrase of BLOCKED_OUTPUT_PHRASES) {
    it(`blocks phrase: ${phrase}`, () => {
      const result = validateGeneratedDraft(
        `관리자 검수용 참고 초안입니다. ${phrase}`,
      );
      assert.equal(result.ok, false);
      assert.ok(result.matchedPhrase);
    });
  }

  it("allows neutral admin draft wording", () => {
    const result = validateGeneratedDraft(
      [
        "관리자 검수 전 초안입니다.",
        "공식 약관과 보험사 안내를 확인한 뒤 활용하세요.",
        "개별 지급 여부는 판단하지 않습니다.",
      ].join("\n"),
    );
    assert.equal(result.ok, true);
  });

  it("blocks re-output of phone numbers", () => {
    const result = validateGeneratedDraft(
      "고객 연락처 010-1234-5678 기준으로 안내합니다.",
    );
    assert.equal(result.ok, false);
  });
});
