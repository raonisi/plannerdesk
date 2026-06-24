import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { uiLabels } from "@/lib/ui-labels";
import {
  desktopNavItems,
  mobileDrawerGroups,
  mobileDrawerQuickActions,
  mobileQuickTabItems,
  publicMobileQuickTabsContentInset,
} from "@/lib/navigation/public-nav";

const ROOT = process.cwd();

const EXPECTED_QUICK_TAB_ROUTES = [
  { label: "홈", href: "/" },
  { label: "보험사 전산", href: "/directory" },
  { label: "청구서류", href: "/claim-documents" },
  { label: "업무 도구", href: "/work-tools" },
  { label: "통합 검색", href: "/search" },
] as const;

const QUICK_TAB_EXCLUDED_HREFS = [
  "/disclosure-links",
  "/message-templates",
  "/knowledge",
  "/admin",
] as const;

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

function collectDrawerHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const item of mobileDrawerQuickActions) hrefs.add(item.href);
  for (const group of mobileDrawerGroups) {
    for (const item of group.items) hrefs.add(item.href);
  }
  return [...hrefs];
}

describe("PR-UX-17 mobile quick tabs", () => {
  it("defines exactly five core-work quick tab items with SSOT labels", () => {
    assert.equal(mobileQuickTabItems.length, 5);
    assert.deepEqual(
      mobileQuickTabItems.map((item) => item.href),
      EXPECTED_QUICK_TAB_ROUTES.map((route) => route.href),
    );
    assert.equal(mobileQuickTabItems[0]?.label, "홈");
    assert.equal(
      mobileQuickTabItems.find((item) => item.href === "/directory")?.label,
      uiLabels.insurerPortal,
    );
    assert.equal(
      mobileQuickTabItems.find((item) => item.href === "/work-tools")?.label,
      uiLabels.workTools,
    );
    assert.equal(
      mobileQuickTabItems.find((item) => item.href === "/search")?.label,
      uiLabels.unifiedSearch,
    );
  });

  it("does not include admin or secondary drawer-only routes in quick tabs", () => {
    const hrefs = mobileQuickTabItems.map((item) => item.href);
    for (const excluded of QUICK_TAB_EXCLUDED_HREFS) {
      assert.ok(!hrefs.includes(excluded), `quick tabs must not include ${excluded}`);
    }
    const nav = read("lib/navigation/public-nav.ts");
    assert.doesNotMatch(nav, /mobileQuickTabItems[\s\S]*href:\s*"\/admin"/);
  });

  it("renders quick tabs only on mobile and tablet (lg:hidden)", () => {
    const tabs = read("components/navigation/mobile-quick-tabs.tsx");
    assert.match(tabs, /lg:hidden/);
    assert.match(tabs, /fixed inset-x-0 bottom-0/);
  });

  it("places quick tabs below drawer and modal layers", () => {
    const tabs = read("components/navigation/mobile-quick-tabs.tsx");
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(tabs, /z-30/);
    assert.match(drawer, /z-40/);
    assert.match(drawer, /z-50/);
  });

  it("applies aria-current and visible labels with icons on each tab", () => {
    const tabs = read("components/navigation/mobile-quick-tabs.tsx");
    assert.match(tabs, /aria-current=\{isActive \? "page" : undefined\}/);
    assert.match(tabs, /isNavItemActive/);
    assert.match(tabs, /aria-hidden="true"/);
    assert.match(tabs, /\{item\.label\}/);
    assert.match(tabs, /focus-visible:ring/);
  });

  it("adds bottom content inset on public shell only at mobile breakpoints", () => {
    assert.match(publicMobileQuickTabsContentInset, /lg:pb-0/);
    assert.match(publicMobileQuickTabsContentInset, /safe-area-inset-bottom/);

    const appShell = read("components/app-shell.tsx");
    assert.match(appShell, /publicMobileQuickTabsContentInset/);
    assert.match(appShell, /PublicMobileQuickTabs/);
    assert.doesNotMatch(read("app/admin/layout.tsx"), /PublicMobileQuickTabs/);
    assert.doesNotMatch(read("app/admin/layout.tsx"), /publicMobileQuickTabsContentInset/);
  });

  it("wires quick tabs into public pages outside AppShell that use Header", () => {
    for (const page of [
      "app/search/page.tsx",
      "app/knowledge/page.tsx",
      "app/knowledge/[slug]/page.tsx",
    ]) {
      const source = read(page);
      assert.match(source, /PublicMobileQuickTabs/);
      assert.match(source, /publicMobileQuickTabsContentInset/);
    }
  });

  it("keeps existing mobile drawer and desktop header navigation intact", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    const header = read("components/header.tsx");
    assert.match(drawer, /mobileDrawerQuickActions/);
    assert.match(drawer, /mobileDrawerGroups/);
    assert.match(header, /desktopNavItems/);
    assert.match(header, /MobileNavigation/);
    assert.match(header, /hidden[\s\S]*lg:flex/);

    const drawerHrefs = collectDrawerHrefs();
    assert.ok(drawerHrefs.includes("/disclosure-links"));
    assert.ok(drawerHrefs.includes("/message-templates"));
    assert.ok(drawerHrefs.includes("/knowledge"));
    assert.equal(desktopNavItems.length, 7);
  });
});
