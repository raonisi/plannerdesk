import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-14 work link admin fields public guard", () => {
  it("public app routes do not import work-link review mock candidates", () => {
    const publicPaths = [
      "app/page.tsx",
      "app/directory/page.tsx",
      "app/search/page.tsx",
      "app/claim-documents/page.tsx",
      "app/knowledge/page.tsx",
    ];
    for (const rel of publicPaths) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /WORK_LINK_REVIEW_MOCK_CANDIDATES/);
      assert.doesNotMatch(src, /reviewNotePrivate/);
      assert.doesNotMatch(src, /admin\/work-links/);
    }
  });

  it("work-tools guard files are unchanged by work-link review module", () => {
    const workToolsPage = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(workToolsPage, /work-links\/review/);

    const guard = readFileSync(
      join(ROOT, "lib/api/work-tools-route-guard.ts"),
      "utf8",
    );
    assert.match(guard, /workToolsPublicReadRouteGuard/);
    assert.match(guard, /workToolsRouteGuard/);
    assert.doesNotMatch(guard, /work-links\/review/);
  });

  it("no public work-link candidate list route exists", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /업무 링크 검수/);
    assert.doesNotMatch(home, /WorkLinkReviewDraftPanel/);
  });
});
