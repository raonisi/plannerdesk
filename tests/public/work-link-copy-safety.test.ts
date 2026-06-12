import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES } from "@/lib/work-links/verified-copy";

const ROOT = process.cwd();

describe("PR-BS-15 work link copy safety", () => {
  it("verified work link UI avoids forbidden certainty phrases", () => {
    for (const rel of [
      "components/work-links/VerifiedWorkLinkCard.tsx",
      "components/work-links/VerifiedWorkLinksSection.tsx",
      "app/directory/page.tsx",
      "app/search/page.tsx",
    ]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES) {
        assert.doesNotMatch(
          src,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${rel} must not contain: ${phrase}`,
        );
      }
    }
  });
});
