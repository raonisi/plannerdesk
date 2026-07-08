import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  mobileQuickTabItems,
  publicMobileQuickTabsContentInset,
} from "@/lib/navigation/public-nav";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("PR-PERF-02 mobile bottom inset and hydration guards", () => {
  it("keeps a central mobile content inset larger than the fixed quick tabs", () => {
    assert.match(
      publicMobileQuickTabsContentInset,
      /pb-\[calc\(8rem\+env\(safe-area-inset-bottom,0px\)\)\]/,
    );
    assert.match(publicMobileQuickTabsContentInset, /safe-area-inset-bottom/);
    assert.match(publicMobileQuickTabsContentInset, /lg:pb-0/);

    const appShell = read("components/app-shell.tsx");
    assert.match(appShell, /publicMobileQuickTabsContentInset/);
    assert.match(appShell, /<PublicMobileQuickTabs \/>/);
  });

  it("keeps the mobile quick tabs stable and safe-area aware", () => {
    assert.equal(mobileQuickTabItems.length, 5);
    assert.deepEqual(
      mobileQuickTabItems.map((item) => item.href),
      ["/", "/directory", "/claim-documents", "/work-tools", "/search"],
    );

    const quickTabs = read("components/navigation/mobile-quick-tabs.tsx");
    assert.match(quickTabs, /grid-cols-5/);
    assert.match(quickTabs, /env\(safe-area-inset-bottom, 0px\)/);
    assert.doesNotMatch(quickTabs, /pointer-events-none/);
  });

  it("keeps route progress accessible without broad hydration suppression", () => {
    const progress = read("components/navigation/route-transition-progress.tsx");
    const layout = read("app/layout.tsx");

    assert.match(progress, /if \(!isPending\) return null/);
    assert.match(progress, /role="status"/);
    assert.match(progress, /aria-live="polite"/);
    assert.match(progress, /aria-busy=\{true\}/);
    assert.match(layout, /<Suspense fallback=\{null\}>[\s\S]*<RouteTransitionProgress \/>[\s\S]*<\/Suspense>/);
    assert.doesNotMatch(layout, /suppressHydrationWarning/);
  });

  it("keeps affected public routes on the AppShell inset path", () => {
    for (const route of [
      "app/favorites/page.tsx",
      "app/knowledge/page.tsx",
      "app/work-tools/page.tsx",
      "app/search/page.tsx",
      "app/not-found.tsx",
    ]) {
      assert.match(read(route), /<AppShell>/, `${route} should render inside AppShell`);
    }
  });
});
