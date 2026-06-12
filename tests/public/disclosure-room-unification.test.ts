import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { disclosureLinkEntries } from "@/lib/content/disclosure-links";
import {
  buildDisclosureRoomCopy,
  DISCLOSURE_ROOM_CATEGORY_LABEL,
  DISCLOSURE_ROOM_SEARCH_ALIASES,
  hasMojibakeText,
  matchesDisclosureRoomSearchQuery,
  unifyStaticDisclosureRoomEntries,
} from "@/lib/content/disclosure-room";
import { getPublicDisclosureLinks } from "@/lib/public/disclosure-links";
import {
  publicDisclosureCategoryLabels,
  publicDisclosureFilterTabs,
} from "@/lib/public/disclosure-display";

const ROOT = process.cwd();

describe("PR-BS-19D disclosure room unification", () => {
  it("merges product_disclosure and policy_terms static entries per insurer URL", () => {
    assert.equal(disclosureLinkEntries.length, 43);
    assert.ok(
      disclosureLinkEntries.every((entry) => entry.category === "product_disclosure"),
    );
    assert.ok(
      disclosureLinkEntries.every((entry) => entry.id.startsWith("disclosure-room-")),
    );
  });

  it("uses standard disclosure room copy without mojibake", () => {
    const samsung = disclosureLinkEntries.find((entry) =>
      entry.id.includes("samsung-fire"),
    );
    assert.ok(samsung);
    assert.equal(samsung.title, "삼성화재 공시실");
    assert.equal(
      samsung.description,
      buildDisclosureRoomCopy("삼성화재").description,
    );
    assert.equal(hasMojibakeText(samsung.title), false);
    assert.equal(hasMojibakeText(samsung.description), false);
  });

  it("does not expose separate 약관 or 상품공시 category labels on public UI", () => {
    assert.equal(
      publicDisclosureCategoryLabels.product_disclosure,
      DISCLOSURE_ROOM_CATEGORY_LABEL,
    );
    assert.equal(
      publicDisclosureCategoryLabels.policy_terms,
      DISCLOSURE_ROOM_CATEGORY_LABEL,
    );
    assert.ok(
      publicDisclosureFilterTabs.some((tab) => tab.id === "disclosure_room"),
    );
    const tabIds = publicDisclosureFilterTabs.map((tab) => String(tab.id));
    assert.ok(!tabIds.includes("product_disclosure"));
    assert.ok(!tabIds.includes("policy_terms"));
  });

  it("maps 약관 and 상품공시 search aliases to disclosure room entries", () => {
    const samsung = disclosureLinkEntries.find((entry) =>
      entry.id.includes("samsung-fire"),
    );
    assert.ok(samsung);
    assert.equal(
      matchesDisclosureRoomSearchQuery("약관", "삼성화재", [samsung.title]),
      true,
    );
    assert.equal(
      matchesDisclosureRoomSearchQuery("상품공시", "삼성화재", [samsung.title]),
      true,
    );
    assert.equal(
      matchesDisclosureRoomSearchQuery("공시실", "삼성화재", [samsung.title]),
      true,
    );
    assert.ok(DISCLOSURE_ROOM_SEARCH_ALIASES.includes("약관"));
  });

  it("falls back to unified disclosure rooms without database access", async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      const result = await getPublicDisclosureLinks();
      assert.equal(result.status, "ok");
      assert.equal(result.data.length, 43);
      assert.ok(
        result.data.some(
          (entry) =>
            entry.id === "disclosure-room-samsung-fire" &&
            entry.title === "삼성화재 공시실" &&
            entry.sourceName === "삼성화재 공식 공시실" &&
            entry.url === "https://www.samsungfire.com/page/VH.REIF0011.do",
        ),
      );
      assert.ok(result.data.every((entry) => !hasMojibakeText(entry.title)));
      assert.ok(result.data.every((entry) => !hasMojibakeText(entry.description)));
      assert.ok(
        result.data.every(
          (entry) => publicDisclosureCategoryLabels[entry.category] === "공시실",
        ),
      );
    } finally {
      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    }
  });

  it("dedupes duplicate insurer disclosure URLs in unify helper", () => {
    const unified = unifyStaticDisclosureRoomEntries([
      {
        id: "disclosure-product-demo",
        title: "데모보험 ?????",
        category: "product_disclosure",
        sourceUrl: "https://example.com/disclosure",
        description: "broken",
        lastVerifiedAt: "2026-06-12",
        verificationStatus: "verified",
      },
      {
        id: "disclosure-terms-demo",
        title: "데모보험 ?? ??",
        category: "policy_terms",
        sourceUrl: "https://example.com/disclosure",
        description: "broken",
        lastVerifiedAt: "2026-06-12",
        verificationStatus: "verified",
      },
    ]);

    assert.equal(unified.length, 1);
    assert.equal(unified[0]?.title, "데모보험 공시실");
  });

  it("public disclosure UI strings do not contain mojibake placeholders", () => {
    const targets = [
      "app/disclosure-links/disclosure-link-center.tsx",
      "components/disclosure/disclosure-card.tsx",
      "lib/public/disclosure-display.ts",
    ];

    for (const rel of targets) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(source, /\?{3,}/);
      assert.doesNotMatch(source, /�/);
    }
  });
});
