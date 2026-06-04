import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { getAdminPublicSurfaceLabel } from "@/lib/admin/public-surface-label";

const ROOT = process.cwd();

const FORBIDDEN_ADMIN_UI_PHRASES = [
  /즉시\s*공개/,
  /자동\s*승인/,
  /전체\s*일괄\s*처리/,
  /검수\s*없이\s*공개/,
  /무조건/,
];

describe("PR111 Admin UI QA (static)", () => {
  it("public surface label consolidates publish + visibility", () => {
    assert.deepEqual(
      getAdminPublicSurfaceLabel({ isPublished: true, publiclyVisible: true }),
      { label: "공개 중", tone: "green" },
    );
    assert.equal(
      getAdminPublicSurfaceLabel({ isPublished: true, publiclyVisible: false })
        .tone,
      "gold",
    );
    assert.equal(
      getAdminPublicSurfaceLabel({ isPublished: false, publiclyVisible: false })
        .label,
      "비공개",
    );
  });

  it("core admin list pages use AdminListEmptyState", () => {
    for (const file of [
      "app/admin/insurers/insurers-admin-list.tsx",
      "app/admin/claim-documents/claim-documents-admin-list.tsx",
      "app/admin/knowledge/knowledge-admin-list.tsx",
    ]) {
      const source = readFileSync(join(ROOT, file), "utf8");
      assert.match(source, /AdminListEmptyState/);
    }
  });

  it("bulk selection bar warns when items are selected", () => {
    const source = readFileSync(
      join(ROOT, "components/admin/bulk/AdminBulkSelectionBar.tsx"),
      "utf8",
    );
    assert.match(source, /일괄 작업이 적용됩니다/);
    assert.match(source, /현재 목록 선택/);
  });

  it("claim documents admin supports insurer filter", () => {
    const source = readFileSync(
      join(ROOT, "app/admin/claim-documents/page.tsx"),
      "utf8",
    );
    assert.match(source, /name="insurer"/);
    assert.match(source, /insurerId/);
  });

  it("admin list copy avoids risky bulk phrasing", () => {
    const files = [
      "app/admin/insurers/insurers-admin-list.tsx",
      "app/admin/claim-documents/claim-documents-admin-list.tsx",
      "app/admin/knowledge/knowledge-admin-list.tsx",
      "components/admin/bulk/AdminBulkSelectionBar.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const pattern of FORBIDDEN_ADMIN_UI_PHRASES) {
        assert.doesNotMatch(
          source,
          pattern,
          `${file} must not contain ${pattern}`,
        );
      }
    }
  });

  it("admin pages keep access guard components", () => {
    for (const file of [
      "app/admin/insurers/page.tsx",
      "app/admin/claim-documents/page.tsx",
      "app/admin/knowledge/page.tsx",
    ]) {
      const source = readFileSync(join(ROOT, file), "utf8");
      assert.match(source, /AdminLockedState/);
      assert.match(source, /AdminAccessDeniedState/);
    }
  });
});
