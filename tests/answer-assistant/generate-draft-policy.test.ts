import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("Answer Assistant generate-draft policy (PR-97-A)", () => {
  const source = readFileSync(
    join(process.cwd(), "lib/answer-assistant/generate-draft.ts"),
    "utf8",
  );

  it("does not assemble rules-based draft when provider is missing", () => {
    assert.doesNotMatch(source, /buildRulesBasedDraft/);
    assert.match(source, /PROVIDER_NOT_CONFIGURED/);
    assert.match(source, /validateAnswerAssistantInput/);
    assert.match(source, /retrieveAnswerCandidates/);
  });

  it("validates before retrieval and provider", () => {
    const validateIndex = source.indexOf("validateAnswerAssistantInput");
    const retrievalIndex = source.indexOf("retrieveAnswerCandidates");
    const providerIndex = source.indexOf("isAnswerDraftProviderConfigured");
    assert.ok(validateIndex < retrievalIndex);
    assert.ok(retrievalIndex < providerIndex);
  });
});
