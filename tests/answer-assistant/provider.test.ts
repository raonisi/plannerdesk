import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAnswerAssistantPrompt,
  isAnswerDraftProviderConfigured,
  runAnswerDraftProvider,
} from "@/lib/answer-assistant/provider";
import { baseAnswerAssistantInput } from "./fixtures";

describe("Answer Assistant provider safety", () => {
  it("reports provider as not configured", () => {
    assert.equal(isAnswerDraftProviderConfigured(), false);
  });

  it("returns PROVIDER_NOT_CONFIGURED without draft", async () => {
    const result = await runAnswerDraftProvider({
      input: baseAnswerAssistantInput(
        "해지 전 고객에게 안내할 일반 기준을 정리해줘",
      ),
      normalizedQuery: "해지 전 고객에게 안내할 일반 기준을 정리해줘",
      candidates: [],
      needsOfficialCheck: false,
    });
    assert.equal(result.ok, false);
    assert.equal(result.errorMessage, "PROVIDER_NOT_CONFIGURED");
    assert.equal(result.draft, undefined);
  });

  it("buildAnswerAssistantPrompt excludes forbidden context keys", () => {
    const prompt = buildAnswerAssistantPrompt({
      input: baseAnswerAssistantInput(
        "공시·약관 확인 경로를 안내해줘",
        { purpose: "DISCLOSURE_GUIDE" },
      ),
      normalizedQuery: "공시·약관 확인 경로를 안내해줘",
      candidates: [
        {
          id: "tmpl-1",
          type: "message_template",
          title: "안내 문구",
          safeText: "공식 약관을 확인해 주세요.",
          priority: 50,
        },
      ],
      needsOfficialCheck: true,
    });

    const combined = `${prompt.system}\n${prompt.user}`.toLowerCase();
    assert.doesNotMatch(combined, /adminmemo/);
    assert.doesNotMatch(combined, /forbiddenclaims/);
    assert.doesNotMatch(combined, /compliancenote/);
    assert.doesNotMatch(combined, /message_template\.body/);
    assert.match(combined, /관리자 검수용/);
    assert.match(combined, /공식 약관을 확인/);
  });
});
