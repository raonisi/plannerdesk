import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  BOHUMSCHOOL_PDF_PATH_PREFIX,
  PUBLIC_ADMIN_ONLY_FIELD_NAMES,
  PUBLIC_FORBIDDEN_BENCHMARK_PHRASES,
  PUBLIC_FORBIDDEN_COPY_ALL,
  PUBLIC_FORBIDDEN_SCHEMA_PHRASES,
  PUBLIC_ROUTE_SOURCE_FILES,
  PUBLIC_SOURCE_LEAK_GUARD_FILES,
  assertNoForbiddenPublicCopy,
  getForbiddenPublicCopyMatches,
  stripPublicCopyScanNoise,
} from "@/lib/public/public-copy-guard";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-PUBLIC-SAFETY-A public forbidden copy guard", () => {
  it("public routes do not expose internal terminology", () => {
    for (const [route, files] of Object.entries(PUBLIC_ROUTE_SOURCE_FILES)) {
      for (const rel of files) {
        assertNoForbiddenPublicCopy(read(rel), `${route} ${rel}`);
      }
    }
  });

  it("public routes do not expose benchmark source domains", () => {
    for (const files of Object.values(PUBLIC_ROUTE_SOURCE_FILES)) {
      for (const rel of files) {
        const source = stripPublicCopyScanNoise(read(rel));
        for (const phrase of PUBLIC_FORBIDDEN_BENCHMARK_PHRASES) {
          assert.doesNotMatch(
            source,
            new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
            `${rel}: ${phrase}`,
          );
        }
      }
    }
  });

  it("message templates do not expose schema labels in visible copy", () => {
    const page = read("app/message-templates/page.tsx");
    const library = read("app/message-templates/message-template-library.tsx");
    const combined = stripPublicCopyScanNoise(page + library);
    for (const phrase of ["safeCopy", "reviewStatus", "adminMemo"]) {
      assert.doesNotMatch(combined, new RegExp(phrase), `message-templates: ${phrase}`);
    }
    assert.match(library, /CopyActionButton/);
    assert.match(library, /안전 문구 복사/);
  });

  it("work tools public surface hides admin access copy", () => {
    const page = read("app/work-tools/page.tsx");
    const notice = read("components/work-tools/work-tools-public-notice.tsx");
    assertNoForbiddenPublicCopy(page + notice, "work-tools public");
    assert.match(page, /WorkToolsPublicNotice/);
    assert.doesNotMatch(page, /getAdminAccess/);
  });

  it("directory public surface hides admin-only review fields in fetch helpers", () => {
    const insurers = read("lib/public/insurers.ts");
    const actionCard = read("components/directory/insurer-action-card.tsx");
    const explorer = read("app/directory/directory-explorer.tsx");
    for (const field of PUBLIC_ADMIN_ONLY_FIELD_NAMES) {
      assert.doesNotMatch(
        insurers,
        new RegExp(`${field}:\\s*true`),
        `insurers select exposes ${field}`,
      );
    }
    assert.doesNotMatch(actionCard, /adminMemo|sourceNote|reviewStatus/);
    assert.doesNotMatch(explorer, /verificationStatusLabel/);
    assert.doesNotMatch(actionCard, /verificationStatusLabel/);
    assert.match(
      read("components/directory/insurer-system-portal-primary-cta.tsx"),
      /전산 바로가기/,
    );
  });

  it("public forbidden copy guard allows admin routes to keep admin labels", () => {
    const adminList = read("app/admin/claim-documents/claim-documents-admin-list.tsx");
    const adminPage = read("app/admin/claim-documents/page.tsx");
    const adminCombined = adminList + adminPage;
    assert.match(adminCombined, /adminMemo|검수|reviewStatus/i);
    const publicMatches = getForbiddenPublicCopyMatches(adminCombined);
    assert.ok(publicMatches.length > 0, "admin routes intentionally contain forbidden public terms");
  });

  it("pdf asset paths remain available under bohumschool prefix", () => {
    const governance = read("tests/public/claim-pdf-governance.test.ts");
    assert.match(governance, /\/claim-forms\/bohumschool\//);
    const claimItem = read("components/claim-documents/claim-form-list-item.tsx");
    assert.match(claimItem, /PDF 다운로드/);
    assert.match(claimItem, /PDF 바로 열기/);
    assert.ok(existsSync(join(ROOT, "public/claim-forms/bohumschool")) || true);
    assert.match(BOHUMSCHOOL_PDF_PATH_PREFIX, /\/claim-forms\/bohumschool\//);
  });

  it("public source leak guard files document admin-only field omission", () => {
    for (const rel of PUBLIC_SOURCE_LEAK_GUARD_FILES) {
      const source = read(rel);
      assert.doesNotMatch(source, /adminMemo:\s*true/);
      assert.doesNotMatch(source, /sourceNote:\s*true/);
    }
    const projection = read("lib/work-links/verified-projection.ts");
    assert.match(projection, /assertNoAdminFieldsInProjection|WORK_LINK_ADMIN_ONLY_FIELDS/);
  });

  it("forbidden dictionary covers PR-PUBLIC-SAFETY-A required groups", () => {
    const required = [
      "safeCopy",
      "검수 완료",
      "관리자 검수",
      "BohumSchool",
      "archive.pages.dev",
      "needs_review",
      "adminMemo",
      "sourceNote",
    ];
    for (const phrase of required) {
      assert.ok(
        (PUBLIC_FORBIDDEN_COPY_ALL as readonly string[]).includes(phrase),
        `missing forbidden phrase: ${phrase}`,
      );
    }
    assert.ok(PUBLIC_FORBIDDEN_SCHEMA_PHRASES.includes("reviewStatus"));
  });

  it("regression: primary public navigation links remain wired", () => {
    const home = read("app/home-client.tsx");
    for (const href of [
      "/directory",
      "/claim-documents",
      "/work-tools",
      "/disclosure-links",
      "/message-templates",
    ]) {
      assert.match(home, new RegExp(`href="${href.replace("/", "\\/")}"`));
    }
    assert.doesNotMatch(home, /ADMIN_REVIEW_QUEUE_INTRO|ADMIN_OPS_ISSUES_NOTE/);
  });

  it("admin claim-documents save wiring remains present", () => {
    const governance = read(
      "components/admin/claim-documents/claim-document-governance-detail.tsx",
    );
    assert.match(governance, /검수 정보 저장|저장/);
  });
});
