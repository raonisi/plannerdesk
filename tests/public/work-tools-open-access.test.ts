import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-19C work-tools open access", () => {
  it("work-tools page does not require login", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(page, /getWorkToolsAccess/);
    assert.doesNotMatch(page, /AccessRestrictedPanel/);
    assert.match(page, /WorkToolsPublicNotice/);
    assert.match(page, /WorkToolsClient/);
  });

  it("work-tools metadata allows public indexing", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.match(page, /index:\s*true/);
    assert.doesNotMatch(page, /검증 설계사 전용/);
  });

  it("public read APIs use registry-backed public read guard", () => {
    for (const route of [
      "app/api/work-tools/disease-codes/route.ts",
      "app/api/work-tools/surgery-codes/route.ts",
      "app/api/work-tools/diseases/route.ts",
      "app/api/work-tools/storage/route.ts",
    ]) {
      const src = readFileSync(join(ROOT, route), "utf8");
      assert.match(src, /workToolsPublicReadRouteGuard\("/, route);
    }
  });

  it("admin layout still requires admin access", () => {
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
  });
});
