import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateGeneratedDraft } from "@/lib/answer-assistant/output-safety";
import {
  classifyBlockedQuestion,
  validateAnswerAssistantInput,
} from "@/lib/answer-assistant/validation";
import {
  PR164_INPUT_FIXTURES,
  PR164_OUTPUT_FIXTURES,
} from "@/lib/ops/ai-safety-hardening";
import { baseAnswerAssistantInput, padAnswerAssistantQuery } from "./fixtures";

describe("PR164 Answer Assistant safety hardening (mock/fixture)", () => {
  describe("input fixtures", () => {
    for (const fixture of PR164_INPUT_FIXTURES) {
      it(`${fixture.id} blocks as ${fixture.expectedReason}`, () => {
        const query = padAnswerAssistantQuery(fixture.queryCore);
        assert.equal(classifyBlockedQuestion(query), fixture.expectedReason);
        const validated = validateAnswerAssistantInput(
          baseAnswerAssistantInput(query),
        );
        assert.equal(validated.ok, false);
        assert.equal(validated.blockedReason, fixture.expectedReason);
      });
    }
  });

  describe("output fixtures", () => {
    for (const fixture of PR164_OUTPUT_FIXTURES) {
      it(`${fixture.id} blocks output phrase`, () => {
        const result = validateGeneratedDraft(
          `관리자 검수용 참고 초안입니다. ${fixture.phrase}`,
        );
        assert.equal(result.ok, false);
        assert.ok(result.matchedPhrase);
      });
    }
  });
});
