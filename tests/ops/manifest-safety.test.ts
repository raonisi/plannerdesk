import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

const UNSAFE_START_URLS = [
  "/admin",
  "/planner",
  "/work-tools",
  "/planner/answer-assistant",
];

describe("PR-BS-07 manifest safety (pre-manifest)", () => {
  it("no committed manifest with unsafe start_url", () => {
    const candidates = [
      "app/manifest.ts",
      "public/manifest.json",
      "public/site.webmanifest",
    ];

    for (const rel of candidates) {
      if (!existsSync(join(ROOT, rel))) continue;
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const unsafe of UNSAFE_START_URLS) {
        assert.doesNotMatch(
          src,
          new RegExp(`start_url["']?\\s*[:=]\\s*["']${unsafe.replace(/\//g, "\\/")}`),
          `${rel} must not use ${unsafe} as start_url`,
        );
      }
    }
  });

  it("root layout metadata does not set manifest link to planner routes", () => {
    const layout = readFileSync(join(ROOT, "app/layout.tsx"), "utf8");
    assert.doesNotMatch(layout, /manifest:\s*["']\/planner/);
    assert.doesNotMatch(layout, /manifest:\s*["']\/work-tools/);
    assert.doesNotMatch(layout, /manifest:\s*["']\/admin/);
  });

  it("BS-07 doc records follow-up manifest criteria", () => {
    const doc = readFileSync(
      join(ROOT, "docs/PR-BS-07-PWA-INSTALL-UX-REVIEW.md"),
      "utf8",
    );
    assert.match(doc, /start_url/);
    assert.match(doc, /public 홈/);
    assert.match(doc, /icons/);
    assert.match(doc, /service worker.*금지|없음/i);
  });
});
