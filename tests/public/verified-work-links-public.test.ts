import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { getPublicVerifiedWorkLinks } from "@/lib/work-links/verified-catalog";

const ROOT = process.cwd();

describe("PR-BS-15 verified work links public surfaces", () => {
  it("directory page includes verified work links section", () => {
    const page = readFileSync(join(ROOT, "app/directory/page.tsx"), "utf8");
    assert.match(page, /VerifiedWorkLinksSection/);
    assert.match(page, /getPublicVerifiedWorkLinks/);
    assert.match(page, /mode="public"/);
  });

  it("search page shows verified links for work_link domain", () => {
    const page = readFileSync(join(ROOT, "app/search/page.tsx"), "utf8");
    assert.match(page, /getPublicVerifiedWorkLinks/);
    assert.match(page, /VerifiedWorkLinksSection/);
  });

  it("home passes planner verified links only when planner session", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.match(page, /getPlannerVerifiedWorkLinks/);
    assert.match(page, /plannerVerifiedWorkLinks/);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /plannerVerifiedWorkLinks/);
    assert.match(home, /mode="planner"/);
  });

  it("public catalog excludes draft and paymentInfo published rows", () => {
    const links = getPublicVerifiedWorkLinks();
    for (const link of links) {
      assert.notEqual(link.infoType, "paymentInfo");
      assert.notEqual(link.infoType, "insurerSystem");
      assert.ok(link.officialSourceUrl);
      assert.ok(link.lastVerifiedAt);
    }
    const ids = links.map((l) => l.id);
    assert.ok(ids.includes("mock-wl-pub-claim-005"));
    assert.ok(!ids.includes("mock-wl-pub-payment-blocked-009"));
    assert.ok(!ids.includes("mock-wl-draft-001"));
  });

  it("does not expose admin work-links mock on public home without planner gate misuse", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /WORK_LINK_REVIEW_MOCK_CANDIDATES/);
    assert.doesNotMatch(home, /admin\/work-links/);
  });
});
