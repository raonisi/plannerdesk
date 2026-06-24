import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { uiLabels } from "@/lib/ui-labels";
import {
  desktopNavItems,
  mobileDrawerGroups,
  mobileDrawerQuickActions,
} from "@/lib/navigation/public-nav";

const ROOT = process.cwd();

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

describe("PR-UX-16 global navigation IA", () => {
  it("uses SSOT labels for insurer portal and customer messages", () => {
    assert.equal(uiLabels.insurerPortal, "보험사 전산");
    assert.equal(uiLabels.customerMessages, "고객 문구");
    assert.equal(uiLabels.knowledgeArchive, "지식 아카이브");
    assert.equal(uiLabels.unifiedSearch, "통합 검색");
  });

  it("desktop nav lists knowledge archive and unified search with standard order", () => {
    const hrefs = desktopNavItems.map((item) => item.href);
    assert.deepEqual(hrefs, [
      "/directory",
      "/claim-documents",
      "/work-tools",
      "/disclosure-links",
      "/message-templates",
      "/knowledge",
      "/search",
    ]);
    assert.equal(
      desktopNavItems.find((item) => item.href === "/knowledge")?.label,
      uiLabels.knowledgeArchive,
    );
    assert.equal(
      desktopNavItems.find((item) => item.href === "/directory")?.label,
      uiLabels.insurerPortal,
    );
  });

  it("mobile drawer exposes knowledge and unified search entry points", () => {
    const hrefs = collectDrawerHrefs();
    assert.ok(hrefs.includes("/knowledge"));
    assert.ok(hrefs.includes("/search"));
    assert.ok(
      mobileDrawerQuickActions.some(
        (item) => item.href === "/knowledge" && item.label === uiLabels.knowledgeArchive,
      ),
    );
    assert.ok(
      mobileDrawerQuickActions.some(
        (item) => item.href === "/search" && item.label === uiLabels.unifiedSearch,
      ),
    );
  });

  it("header CTA uses customer messages label", () => {
    const header = read("components/header.tsx");
    assert.match(header, /uiLabels\.customerMessages/);
    assert.doesNotMatch(header, /uiLabels\.findMessage/);
  });

  it("directory page title uses insurer portal standard name", () => {
    const page = read("app/directory/page.tsx");
    assert.match(page, /title:\s*"보험사 전산"/);
    assert.match(page, /eyebrow:\s*"보험사 전산"/);
    assert.doesNotMatch(page, /title:\s*"보험사 디렉터리"/);
  });

  it("does not add admin links to public navigation config", () => {
    const nav = read("lib/navigation/public-nav.ts");
    assert.doesNotMatch(nav, /href:\s*"\/admin"/);
  });
});
