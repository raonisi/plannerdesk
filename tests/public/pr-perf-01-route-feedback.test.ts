import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  mobileQuickTabItems,
  publicMobileQuickTabsContentInset,
} from "@/lib/navigation/public-nav";

const ROOT = process.cwd();
const ROUTE_PROGRESS = "components/navigation/route-transition-progress.tsx";

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("PR-PERF-01 route feedback and mobile clipping guards", () => {
  it("keeps the route transition progress component accessible", () => {
    assert.equal(existsSync(join(ROOT, ROUTE_PROGRESS)), true);

    const source = read(ROUTE_PROGRESS);
    assert.match(source, /"use client"/);
    assert.match(source, /role="status"/);
    assert.match(source, /aria-live="polite"/);
    assert.match(source, /aria-busy=\{true\}/);
    assert.match(source, /setTimeout\(\(\) => \{[\s\S]*setIsPending\(false\);[\s\S]*\}, 8000\)/);
  });

  it("keeps non-standard link clicks out of the route pending handler", () => {
    const source = read(ROUTE_PROGRESS);

    assert.match(source, /target\.target === "_blank"/);
    assert.match(source, /target\.hasAttribute\("download"\)/);
    assert.match(source, /e\.ctrlKey/);
    assert.match(source, /e\.metaKey/);
    assert.match(source, /e\.altKey/);
    assert.match(source, /e\.shiftKey/);
    assert.match(source, /href\.startsWith\("#"\)/);
    assert.match(source, /href\.startsWith\("mailto:"\)/);
    assert.match(source, /href\.startsWith\("tel:"\)/);
  });

  it("mounts route transition progress through Suspense in the root layout", () => {
    const layout = read("app/layout.tsx");

    assert.match(layout, /import \{ Suspense \} from "react"/);
    assert.match(layout, /RouteTransitionProgress/);
    assert.match(layout, /<Suspense fallback=\{null\}>[\s\S]*<RouteTransitionProgress \/>[\s\S]*<\/Suspense>/);
  });

  it("keeps mobile quick tabs and dvh clipping guards in place", () => {
    assert.equal(mobileQuickTabItems.length, 5);
    assert.deepEqual(
      mobileQuickTabItems.map((item) => item.href),
      ["/", "/directory", "/claim-documents", "/work-tools", "/search"],
    );
    assert.match(publicMobileQuickTabsContentInset, /safe-area-inset-bottom/);

    assert.match(read("components/app-shell.tsx"), /min-h-\[100dvh\]/);
    assert.match(read("components/content-page.tsx"), /min-h-\[100dvh\]/);
    assert.match(read("components/admin/AdminLockedState.tsx"), /min-h-\[100dvh\]/);
  });
});
