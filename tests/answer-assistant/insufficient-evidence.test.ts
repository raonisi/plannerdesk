import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { describeInsufficientEvidenceReasons } from "@/lib/answer-assistant/insufficient-evidence";

describe("Insufficient evidence reasons", () => {
  it("reports zero candidates", () => {
    const reasons = describeInsufficientEvidenceReasons(
      [],
      "GENERAL_EXPLANATION",
      false,
    );
    assert.ok(reasons.some((reason) => reason.includes("0건")));
  });

  it("reports missing official source for disclosure guide", () => {
    const reasons = describeInsufficientEvidenceReasons(
      [
        {
          id: "t1",
          type: "message_template",
          title: "안내",
          safeText: "안내 문구",
          priority: 50,
        },
      ],
      "DISCLOSURE_GUIDE",
      false,
    );
    assert.ok(
      reasons.some((reason) =>
        reason.includes("공식"),
      ),
    );
  });
});
