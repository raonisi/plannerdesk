import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PUBLIC_FORBIDDEN_COPY_ALL,
  assertNoForbiddenPublicCopy,
  stripPublicCopyScanNoise,
} from "@/lib/public/public-copy-guard";

const ROOT = process.cwd();

const PUBLIC_DRAWER_ROUTES = [
  { label: "홈", href: "/" },
  { label: "보험사 전산", href: "/directory" },
  { label: "청구서류", href: "/claim-documents" },
  { label: "업무 도구", href: "/work-tools" },
  { label: "공시·약관", href: "/disclosure-links" },
  { label: "고객 문구", href: "/message-templates" },
  { label: "지식 아카이브", href: "/knowledge" },
  { label: "통합 검색", href: "/search" },
] as const;

const FORBIDDEN_DRAWER_PHRASES = [
  "관리자 검수",
  "검수 완료",
  "safeCopy",
  "확인일 정보 부족",
  "공식 확인 후 업데이트 예정",
  "mock",
  "예시 보험사",
  "BohumSchool",
  "보험학교",
  "archive.pages.dev",
] as const;

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-MOB-A global mobile nav drawer", () => {
  it("renders a mobile menu button with accessibility attributes", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /aria-label=\{uiLabels\.mobileMenuOpen\}/);
    assert.match(drawer, /aria-expanded=\{open\}/);
    assert.match(drawer, /aria-controls=\{DRAWER_ID\}/);
    assert.match(drawer, /lg:hidden/);
  });

  it("opens and closes the drawer via menu and close controls", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /setOpen\(true\)/);
    assert.match(drawer, /setOpen\(false\)|closeDrawer/);
    assert.match(drawer, /aria-label=\{uiLabels\.mobileMenuClose\}/);
    assert.match(drawer, /event\.key === "Escape"/);
    assert.match(drawer, /body\.style\.overflow = "hidden"/);
    assert.match(drawer, /role="dialog"/);
    assert.match(drawer, /aria-modal="true"/);
  });

  it("portals only the open drawer layer to document.body", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /import \{ createPortal \} from "react-dom"/);
    assert.match(drawer, /open\s*\? createPortal\(/);
    assert.match(drawer, /document\.body/);
    assert.match(drawer, /<div[\s\S]*aria-hidden="true"[\s\S]*<aside/);
    assert.doesNotMatch(drawer, /suppressHydrationWarning|ssr:\s*false/);
  });

  it("uses viewport-sized dialog layout with nav-only scrolling", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /h-\[100dvh\]/);
    assert.match(drawer, /max-h-\[100dvh\]/);
    assert.match(drawer, /w-\[min\(360px,100dvw\)\]/);
    assert.match(drawer, /min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain/);
    assert.match(drawer, /<footer className="shrink-0/);
  });

  it("traps focus and restores focus only for dismiss actions", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /const dialogRef = useRef<HTMLElement>/);
    assert.match(drawer, /event\.key !== "Tab"/);
    assert.match(drawer, /event\.shiftKey/);
    assert.match(drawer, /lastElement\.focus\(\)/);
    assert.match(drawer, /firstElement\.focus\(\)/);
    assert.match(drawer, /shouldRestoreFocusRef\.current/);
    assert.match(drawer, /closeDrawerForNavigation/);
    assert.match(drawer, /menuButtonRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  });

  it("restores the previous body overflow value during cleanup", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /const previousOverflow = document\.body\.style\.overflow/);
    assert.match(drawer, /const previousRootOverflow = root\.style\.overflow/);
    assert.match(drawer, /const previousPaddingRight = body\.style\.paddingRight/);
    assert.match(drawer, /body\.style\.overflow = "hidden"/);
    assert.match(drawer, /root\.style\.overflow = "hidden"/);
    assert.match(drawer, /body\.style\.position = "fixed"/);
    assert.match(drawer, /body\.style\.top = `-\$\{scrollY\}px`/);
    assert.match(drawer, /body\.style\.overflow = previousOverflow/);
    assert.match(drawer, /body\.style\.paddingRight = previousPaddingRight/);
    assert.match(drawer, /body\.style\.position = previousPosition/);
    assert.match(drawer, /body\.style\.top = previousTop/);
    assert.match(drawer, /root\.style\.overflow = previousRootOverflow/);
    assert.match(drawer, /window\.scrollTo\(scrollX, scrollY\)/);
    assert.match(drawer, /removeEventListener\("keydown", onKeyDown\)/);
  });

  it("lists required public routes in the mobile drawer config", () => {
    const config = read("lib/navigation/public-nav.ts");
    const labelPatterns: Record<string, RegExp> = {
      "/directory": /uiLabels\.insurerPortal/,
      "/work-tools": /uiLabels\.workTools/,
      "/disclosure-links": /uiLabels\.disclosure/,
      "/message-templates": /uiLabels\.customerMessages/,
      "/knowledge": /uiLabels\.knowledgeArchive/,
      "/search": /uiLabels\.unifiedSearch/,
    };
    for (const route of PUBLIC_DRAWER_ROUTES) {
      assert.match(config, new RegExp(`href:\\s*"${route.href.replace("/", "\\/")}"`));
      const labelPattern =
        labelPatterns[route.href] ??
        new RegExp(route.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      assert.match(config, labelPattern, `${route.href} label`);
    }
  });

  it("applies aria-current on active drawer links", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /aria-current=\{isActive \? "page" : undefined\}/);
    assert.match(drawer, /isNavItemActive/);
  });

  it("closes the drawer when a route link is selected", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /onNavigate=\{closeDrawerForNavigation\}/);
    assert.match(drawer, /onClick=\{onNavigate\}/);
  });

  it("does not expose forbidden copy or admin links in the public drawer", () => {
    const drawerSource = stripPublicCopyScanNoise(
      read("components/navigation/mobile-nav-drawer.tsx") +
        read("lib/navigation/public-nav.ts"),
    );
    assertNoForbiddenPublicCopy(drawerSource, "mobile drawer");
    assert.doesNotMatch(drawerSource, /href:\s*"\/admin"/);
    assert.doesNotMatch(drawerSource, /Admin/);
    for (const phrase of FORBIDDEN_DRAWER_PHRASES) {
      assert.doesNotMatch(
        drawerSource,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `drawer exposes forbidden phrase: ${phrase}`,
      );
    }
  });

  it("keeps desktop navigation visible from lg breakpoint", () => {
    const header = read("components/header.tsx");
    assert.match(header, /MainNavigation/);
    assert.match(header, /hidden items-center gap-1\.5 text-sm font-bold lg:flex/);
    assert.doesNotMatch(header, /overflow-x-auto/);
  });

  it("removes horizontal scroll-tab mobile navigation strip", () => {
    const header = read("components/header.tsx");
    assert.doesNotMatch(header, /scrollbar-none/);
    assert.doesNotMatch(header, /MobileNavLink/);
    assert.match(header, /MobileNavigation/);
  });

  it("drawer width and touch targets meet mobile usability baseline", () => {
    const drawer = read("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /w-\[min\(360px,100dvw\)\]/);
    assert.match(drawer, /min-h-11/);
  });

  it("directory and claim-documents regressions remain wired", () => {
    const directoryActions = read("components/directory/insurer-system-portal-primary-cta.tsx");
    assert.match(directoryActions, /전산 바로가기/);
    const claimItem = read("components/claim-documents/claim-form-list-item.tsx");
    assert.match(claimItem, /PDF 다운로드/);
    assert.match(claimItem, /PUBLIC_CTA_PDF_OPEN/);
  });

  it("forbidden dictionary still covers drawer guard phrases", () => {
    for (const phrase of FORBIDDEN_DRAWER_PHRASES) {
      if (phrase === "예시 보험사") continue;
      assert.ok(
        (PUBLIC_FORBIDDEN_COPY_ALL as readonly string[]).includes(phrase) ||
          phrase === "mock",
        `guard list should cover: ${phrase}`,
      );
    }
  });
});
