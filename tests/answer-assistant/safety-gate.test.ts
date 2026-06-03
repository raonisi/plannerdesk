import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyBlockedQuestion,
  validateAnswerAssistantInput,
} from "@/lib/answer-assistant/validation";
import {
  ALLOWED_REQUEST_CASES,
  BLOCKED_REQUEST_CASES,
  baseAnswerAssistantInput,
} from "./fixtures";

describe("Answer Assistant safety gate", () => {
  describe("allowed requests", () => {
    for (const query of ALLOWED_REQUEST_CASES) {
      it(`allows: ${query.slice(0, 24)}…`, () => {
        const result = validateAnswerAssistantInput(
          baseAnswerAssistantInput(query),
        );
        assert.equal(result.ok, true, result.message);
        assert.equal(classifyBlockedQuestion(query), null);
      });
    }
  });

  for (const [category, cases] of Object.entries(BLOCKED_REQUEST_CASES)) {
    describe(`blocked: ${category}`, () => {
      for (const testCase of cases) {
        it(`blocks ${testCase.reason}: ${testCase.query.slice(0, 28)}…`, () => {
          const classified = classifyBlockedQuestion(testCase.query);
          assert.equal(classified, testCase.reason);

          const validated = validateAnswerAssistantInput(
            baseAnswerAssistantInput(testCase.query),
          );
          assert.equal(validated.ok, false);
          assert.equal(validated.blockedReason, testCase.reason);
        });
      }
    });
  }

  it("blocks validation when query is too short", () => {
    const result = validateAnswerAssistantInput(
      baseAnswerAssistantInput("짧은 요청"),
    );
    assert.equal(result.ok, false);
    assert.equal(result.blockedReason, "VALIDATION");
  });

  it("blocks HTML/script injection patterns", () => {
    const result = validateAnswerAssistantInput(
      baseAnswerAssistantInput(
        "<script>alert(1)</script> 해지 전 고객 안내 일반 기준을 정리해줘",
      ),
    );
    assert.equal(result.ok, false);
    assert.equal(result.blockedReason, "VALIDATION");
  });
});
