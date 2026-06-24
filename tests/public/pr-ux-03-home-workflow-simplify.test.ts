import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildHomePublicStats,
  resolveHomeLoadState,
} from "@/lib/dashboard/home-data-state";
import { countPublicClaimLibraryItems } from "@/lib/claim-documents/claim-library";
import { resolveVisiblePublicClaimDocuments } from "@/lib/public/public-surface-resolvers";
import { PUBLIC_FORBIDDEN_PHRASES } from "@/lib/ops/public-smoke-expansion";

const ROOT = process.cwd();

const REQUIRED_HOME_ROUTES = [
  "/directory",
  "/claim-documents",
  "/work-tools",
  "/message-templates",
  "/disclosure-links",
  "/knowledge",
] as const;

function countRouteLinks(source: string, href: string): number {
  const pattern = new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g");
  return (source.match(pattern) ?? []).length;
}

describe("PR-UX-03 home workflow simplify", () => {
  it("home client compresses legacy section titles", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /오늘 바로 쓰는 업무/);
    assert.match(home, /HomePublicStatsStrip/);
    assert.match(home, /HomeDataStatusNotice/);
    assert.doesNotMatch(home, /오늘의 업무 시작/);
    assert.doesNotMatch(home, /청구 흐름 바로가기/);
    assert.doesNotMatch(home, /업무 흐름별 바로가기/);
    assert.doesNotMatch(home, /자주 쓰는 업무/);
    assert.doesNotMatch(home, /WorkHubNextSteps/);
    assert.doesNotMatch(home, /HomeQuickLaunchCard/);
    assert.doesNotMatch(home, /HomeMiniToolCard/);
  });

  it("hero exposes three primary CTAs and required route links", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /보험사 전산 찾기/);
    assert.match(home, /청구서류 찾기/);
    assert.match(home, /업무 도구 열기/);
    for (const href of REQUIRED_HOME_ROUTES) {
      assert.match(home, new RegExp(`href="${href.replace(/\//g, "\\/")}"`));
    }
  });

  it("does not repeat the same route CTA excessively on home", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    for (const href of ["/directory", "/claim-documents", "/work-tools"] as const) {
      const count = countRouteLinks(home, href);
      assert.ok(
        count <= 4,
        `${href} appears ${count} times as href on home — expected at most 4`,
      );
    }
  });

  it("preserves safety boundary copy and avoids forbidden sales phrases", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /보험금 지급 판단/);
    assert.match(home, /개인정보/);
    assert.match(home, /PUBLIC_LANDING_LIMITED_BETA_NOTICE/);
    assert.match(home, /PUBLIC_LANDING_OFFICIAL_SOURCE_NOTICE/);
    for (const phrase of PUBLIC_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(
        home,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden phrase on home: ${phrase}`,
      );
    }
  });

  it("home public stats resolver path unchanged", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.match(page, /buildHomePublicStats/);
    assert.match(page, /resolveHomeLoadState/);

    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const libraryCount = countPublicClaimLibraryItems(guides, {});
    const stats = buildHomePublicStats({
      fetch: {
        insurers: "ok",
        claimDocuments: "ok",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 10,
      claimDocumentCount: libraryCount,
      disclosureLinkCount: 5,
      messageTemplateCount: 3,
      workToolCount: 50,
      knowledgeArticleCount: 2,
    });
    assert.equal(stats.claimDocuments.kind, "count");
    if (stats.claimDocuments.kind === "count") {
      assert.ok(stats.claimDocuments.value >= 200);
    }
    assert.equal(
      resolveHomeLoadState({
        fetch: {
          insurers: "ok",
          claimDocuments: "ok",
          disclosureLinks: "ok",
          messageTemplates: "ok",
          workTools: "ok",
          knowledge: "ok",
        },
        insurerCount: 0,
        claimDocumentCount: 0,
        disclosureLinkCount: 0,
        messageTemplateCount: 0,
        workToolCount: 0,
        knowledgeArticleCount: 0,
      }),
      "empty",
    );
  });

  it("uses responsive mobile-friendly layout classes", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /min-\[420px\]:grid-cols-2/);
    assert.match(home, /min-w-0/);
    assert.match(home, /HomeCompactWorkTile/);
  });
});
