import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { countPublicClaimLibraryItems } from "@/lib/claim-documents/claim-library";
import { colors } from "@/lib/design-system";
import { resolveVisiblePublicClaimDocuments } from "@/lib/public/public-surface-resolvers";
import { PUBLIC_FORBIDDEN_PHRASES } from "@/lib/ops/public-smoke-expansion";

const ROOT = process.cwd();

const PUBLIC_SURFACE_FILES = [
  "app/globals.css",
  "lib/design-system.ts",
  "app/home-client.tsx",
  "app/page.tsx",
  "components/content-page.tsx",
  "components/content/freshness-badge.tsx",
  "components/content/data-freshness-meta.tsx",
  "components/launcher/category-pill-bar.tsx",
  "components/dashboard/home-public-stats-strip.tsx",
  "app/directory/page.tsx",
  "app/claim-documents/page.tsx",
  "app/disclosure-links/page.tsx",
  "app/work-tools/work-tools-client.tsx",
  "app/message-templates/message-template-library.tsx",
  "app/knowledge/knowledge-archive-list.tsx",
] as const;

describe("PR-UX-08 WCAG AA contrast tokens", () => {
  it("design system uses AA-oriented secondary text color", () => {
    assert.equal(colors.bodyGray, "#4A5565");
    assert.equal(colors.mutedGray, "#475569");
    assert.notEqual(colors.bodyGray, "#5B6470");

    const ds = readFileSync(join(ROOT, "lib/design-system.ts"), "utf8");
    assert.match(ds, /WCAG AA/);
    assert.match(ds, /text-\[#4A5565\]/);
    assert.match(ds, /focus-visible:ring-\[#0F1D2E\]\/35/);
  });

  it("globals.css exposes contrast-oriented CSS variables", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    assert.match(css, /--color-text-secondary:\s*#4a5565/);
    assert.match(css, /--color-text-muted:\s*#475569/);
    assert.match(css, /--color-focus-ring/);
    assert.doesNotMatch(css, /--gray:\s*#5b6470/);
  });

  it("public surfaces avoid legacy low-contrast #5B6470", () => {
    for (const rel of PUBLIC_SURFACE_FILES) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(
        src,
        /#5[Bb]6470/,
        `${rel} should not use legacy secondary gray`,
      );
    }
  });

  it("shared UI components keep focus-visible rings", () => {
    const pill = readFileSync(
      join(ROOT, "components/launcher/category-pill-bar.tsx"),
      "utf8",
    );
    const page = readFileSync(join(ROOT, "components/content-page.tsx"), "utf8");
    assert.match(pill, /focus-visible:ring-2/);
    assert.match(page, /focus-visible:ring-2/);
    assert.match(pill, /text-\[#4A5565\]/);
  });

  it("freshness badges use darker muted text on light backgrounds", () => {
    const badge = readFileSync(
      join(ROOT, "components/content/freshness-badge.tsx"),
      "utf8",
    );
    assert.match(badge, /text-\[#475569\]/);
    assert.doesNotMatch(badge, /#5[Bb]6470/);
  });

  it("home and claim routes still render primary navigation paths", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /href="\/directory"/);
    assert.match(home, /href="\/claim-documents"/);
    assert.match(home, /href="\/work-tools"/);

    const claim = readFileSync(join(ROOT, "app/claim-documents/page.tsx"), "utf8");
    assert.match(claim, /resolveVisiblePublicClaimDocuments/);
  });

  it("claim library SSOT count baseline preserved", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const libraryCount = countPublicClaimLibraryItems(guides, {});
    assert.ok(libraryCount >= 200);
  });

  it("contrast pass surfaces avoid forbidden sales phrases", () => {
    const combined = PUBLIC_SURFACE_FILES.map((rel) =>
      readFileSync(join(ROOT, rel), "utf8"),
    ).join("\n");
    for (const phrase of PUBLIC_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(
        combined,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden phrase: ${phrase}`,
      );
    }
  });
});
