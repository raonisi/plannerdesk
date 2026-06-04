import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

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
