import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

const ADMIN_SURFACE_MARKERS = [
  "bulk",
  "allowlist",
  "adminMemo",
  "reviewNote",
  "beta readiness",
  "source/proxy",
  "role 관리",
] as const;

describe("PR-BS-19C admin-only hidden from work-tools", () => {
  it("work-tools client has no admin operation surfaces", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    for (const marker of [
      "/admin/",
      "bulk",
      "allowlist",
      "adminMemo",
      "reviewNote",
      "betaReadiness",
      "correction",
    ]) {
      assert.doesNotMatch(client, new RegExp(marker, "i"), marker);
    }
  });

  it("admin routes remain under /admin with layout guard", () => {
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
    const adminPage = readFileSync(join(ROOT, "app/admin/page.tsx"), "utf8");
    assert.doesNotMatch(adminPage, /work-tools/);
  });

  it("work-tools page links admin separately without mixing admin tools", () => {
    const notice = readFileSync(
      join(ROOT, "components/work-tools/work-tools-public-notice.tsx"),
      "utf8",
    );
    assert.match(notice, /href="\/admin"/);
    assert.doesNotMatch(notice, /bulk|allowlist|adminMemo/i);
    for (const marker of ADMIN_SURFACE_MARKERS) {
      assert.doesNotMatch(notice, new RegExp(marker, "i"));
    }
  });
});
