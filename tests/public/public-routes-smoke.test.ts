import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PUBLIC_FORBIDDEN_PHRASES,
  PUBLIC_PHRASE_SCAN_FILES,
  REQUIRED_INLINE_NOTICE_VARIANTS,
} from "@/lib/ops/public-smoke-expansion";
import { PUBLIC_INLINE_NOTICE } from "@/lib/ops/data-responsibility-notice";

const ROOT = process.cwd();

/** Public routes that must have a matching app route page (PR110). */
const PUBLIC_ROUTE_PAGES: { path: string; file: string }[] = [
  { path: "/", file: "app/page.tsx" },
  { path: "/directory", file: "app/directory/page.tsx" },
  { path: "/claim-documents", file: "app/claim-documents/page.tsx" },
  { path: "/knowledge", file: "app/knowledge/page.tsx" },
  { path: "/search", file: "app/search/page.tsx" },
  { path: "/disclosure-links", file: "app/disclosure-links/page.tsx" },
  { path: "/message-templates", file: "app/message-templates/page.tsx" },
  { path: "/community", file: "app/community/page.tsx" },
];

const SMOKE_SCRIPT_ROUTES = [
  "/",
  "/directory",
  "/claim-documents",
  "/disclosure-links",
  "/message-templates",
  "/search",
  "/knowledge",
  "/community",
];

describe("Public route smoke (PR110, static)", () => {
  it("public route pages exist", () => {
    for (const route of PUBLIC_ROUTE_PAGES) {
      assert.doesNotThrow(
        () => readFileSync(join(ROOT, route.file), "utf8"),
        route.path,
      );
    }
  });

  it("smoke script includes PR110 public routes", () => {
    const script = readFileSync(
      join(ROOT, "scripts/smoke-public-routes.mjs"),
      "utf8",
    );
    for (const path of SMOKE_SCRIPT_ROUTES) {
      assert.ok(
        script.includes(`path: "${path}"`) || script.includes(`path: '${path}'`),
        `smoke script missing ${path}`,
      );
    }
  });

  it("search uses canonical public visibility filters", () => {
    const source = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.match(source, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(source, /PUBLIC_KNOWLEDGE_WHERE/);
    assert.match(source, /PUBLIC_DISCLOSURE_LINK_WHERE/);
    assert.match(source, /PUBLIC_MESSAGE_TEMPLATE_WHERE/);
  });

  it("public fetch helpers exclude admin-only fields from select", () => {
    const insurers = readFileSync(join(ROOT, "lib/public/insurers.ts"), "utf8");
    const claims = readFileSync(
      join(ROOT, "lib/public/claim-documents.ts"),
      "utf8",
    );
    assert.doesNotMatch(insurers, /createdById:\s*true/);
    assert.doesNotMatch(claims, /createdById:\s*true/);
    assert.match(insurers, /verificationStatus: \{ in:/);
    assert.match(claims, /verificationStatus: \{ in:/);
  });

  it("admin routes are not listed as public smoke targets", () => {
    const script = readFileSync(
      join(ROOT, "scripts/smoke-public-routes.mjs"),
      "utf8",
    );
    assert.doesNotMatch(script, /\/admin/);
    assert.doesNotMatch(script, /\/planner\/answer-assistant/);
  });

  it("directory and knowledge pages use public data helpers", () => {
    const directory = readFileSync(
      join(ROOT, "app/directory/page.tsx"),
      "utf8",
    );
    const knowledge = readFileSync(join(ROOT, "app/knowledge/page.tsx"), "utf8");
    assert.match(directory, /getPublicInsurers/);
    assert.match(directory, /getPublicClaimDocuments/);
    assert.match(knowledge, /getPublicKnowledgeArticles/);
  });

  it("key public pages include mobile-friendly layout primitives", () => {
    for (const file of [
      "app/page.tsx",
      "app/directory/page.tsx",
      "app/search/page.tsx",
    ]) {
      const source = readFileSync(join(ROOT, file), "utf8");
      assert.match(
        source,
        /AppShell|PageFrame|ContentSection/,
        `${file} layout`,
      );
    }
  });

  it("knowledge detail route exists for slug pages", () => {
    readFileSync(join(ROOT, "app/knowledge/[slug]/page.tsx"), "utf8");
  });
});

describe("PR154 public smoke expansion (static, no DB)", () => {
  it("public pages include data responsibility inline notices", () => {
    for (const file of [
      "app/directory/page.tsx",
      "app/claim-documents/page.tsx",
      "app/disclosure-links/page.tsx",
      "app/knowledge/page.tsx",
      "app/search/page.tsx",
    ]) {
      const src = readFileSync(join(ROOT, file), "utf8");
      assert.match(src, /DataResponsibilityInlineNotice/);
    }
    for (const variant of REQUIRED_INLINE_NOTICE_VARIANTS) {
      assert.ok(PUBLIC_INLINE_NOTICE[variant], `notice variant ${variant}`);
    }
  });

  it("claim and landing copy deny payout confirmation", () => {
    const notice = readFileSync(
      join(ROOT, "lib/ops/data-responsibility-notice.ts"),
      "utf8",
    );
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(notice, /claim[\s\S]*확정하지 않|보험금 지급 여부는 확정하지 않/);
    assert.match(home, /제한 베타|공식/);
    assert.doesNotMatch(home, /보험금 지급 확정|무조건 지급/);
  });

  it("public phrase scan files exclude forbidden expressions", () => {
    const combined = PUBLIC_PHRASE_SCAN_FILES.map((rel) =>
      readFileSync(join(ROOT, rel), "utf8"),
    ).join("\n");
    for (const phrase of PUBLIC_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(
        combined,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden in public UI: ${phrase}`,
      );
    }
  });

  it("admin and planner AA routes are not public smoke targets", () => {
    const script = readFileSync(
      join(ROOT, "scripts/smoke-public-routes.mjs"),
      "utf8",
    );
    assert.doesNotMatch(script, /\/admin/);
    assert.doesNotMatch(script, /\/planner/);
    assert.equal(existsSync(join(ROOT, "app/answer-assistant")), false);
    assert.equal(existsSync(join(ROOT, "app/planner/answer-assistant")), true);
  });

  it("admin layout enforces access gate", () => {
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
    assert.match(layout, /AdminAccessDeniedState/);
  });

  it("planner answer assistant uses verified access gate", () => {
    const page = readFileSync(
      join(ROOT, "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(page, /getVerifiedAnswerAssistantAccess/);
  });

  it("no payment or checkout public routes", () => {
    assert.equal(existsSync(join(ROOT, "app/payment")), false);
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
    assert.equal(existsSync(join(ROOT, "app/billing")), false);
  });

  it("landing includes limited beta and official source notices", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /PUBLIC_LANDING_LIMITED_BETA_NOTICE/);
    assert.match(home, /PUBLIC_LANDING_OFFICIAL_SOURCE_NOTICE/);
    assert.match(home, /개인정보/);
  });
});
