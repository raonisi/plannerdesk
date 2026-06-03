import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { retrieveAnswerCandidates } from "@/lib/answer-assistant/retrieval";
import {
  RETRIEVAL_EXCLUDED_DOMAINS,
  type RetrievalCandidate,
} from "@/lib/answer-assistant/retrieval-types";

const RETRIEVAL_SOURCE = readFileSync(
  join(process.cwd(), "lib/answer-assistant/retrieval.ts"),
  "utf8",
);

describe("Answer Assistant retrieval policy", () => {
  it("rejects non-admin audience before DB access", async () => {
    const result = await retrieveAnswerCandidates({
      query: "해지 전 고객에게 안내할 일반 기준을 정리해줘",
      audience: "verified_planner",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.blockedReason, "unauthorized");
      assert.equal(result.candidates.length, 0);
    }
  });

  it("documents excluded domains including CorrectionRequest", () => {
    assert.ok(RETRIEVAL_EXCLUDED_DOMAINS.includes("correction_request"));
    assert.ok(RETRIEVAL_EXCLUDED_DOMAINS.includes("community_report"));
    assert.ok(RETRIEVAL_EXCLUDED_DOMAINS.includes("community_post"));
  });

  it("retrieval source does not query excluded or internal fields", () => {
    const forbiddenSnippets = [
      "adminMemo",
      "forbiddenClaims",
      "complianceNote",
      "correctionRequest",
      "communityReport",
      "ocrText",
      "fileUrl",
    ];

    for (const snippet of forbiddenSnippets) {
      assert.doesNotMatch(
        RETRIEVAL_SOURCE,
        new RegExp(snippet, "i"),
        `retrieval.ts must not reference ${snippet}`,
      );
    }

    assert.doesNotMatch(RETRIEVAL_SOURCE, /\bbody:\s*true/);
    assert.match(RETRIEVAL_SOURCE, /safeCopy/);
    assert.match(RETRIEVAL_SOURCE, /ANSWER_ASSIST_KNOWLEDGE_WHERE/);
    assert.match(RETRIEVAL_SOURCE, /PUBLIC_DISCLOSURE_LINK_WHERE/);
    assert.match(RETRIEVAL_SOURCE, /PUBLIC_MESSAGE_TEMPLATE_WHERE/);
  });

  it("toEvidenceItems shape excludes internal governance fields", async () => {
    const sample: RetrievalCandidate = {
      id: "sample",
      type: "knowledge_article",
      title: "샘플",
      summary: "요약",
      safeText: "안전 텍스트",
      priority: 40,
    };

    const keys = Object.keys(sample);
    for (const forbidden of [
      "adminMemo",
      "body",
      "forbiddenClaims",
      "complianceNote",
      "reviewedById",
    ]) {
      assert.ok(!keys.includes(forbidden));
    }
  });
});
