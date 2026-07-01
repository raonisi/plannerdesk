import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-UX-23 Korean 404 Page (static)", () => {
  it("app/not-found.tsx exists", () => {
    assert.ok(existsSync(join(ROOT, "app/not-found.tsx")), "app/not-found.tsx is missing");
  });

  it("not-found.tsx uses Korean phrases and avoids default English", () => {
    const src = readFileSync(join(ROOT, "app/not-found.tsx"), "utf8");
    assert.match(src, /페이지를 찾을 수 없습니다/);
    assert.match(src, /주소가 바뀌었거나 삭제된 페이지입니다/);
    assert.match(src, /필요한 자료를 찾지 못했다면/);

    assert.doesNotMatch(src, /This page could not be found/);
  });

  it("not-found.tsx includes all required CTAs", () => {
    const src = readFileSync(join(ROOT, "app/not-found.tsx"), "utf8");
    assert.match(src, /href="\/"/);
    assert.match(src, /href="\/directory"/);
    assert.match(src, /href="\/claim-documents"/);
    assert.match(src, /href="\/work-tools"/);
    assert.match(src, /href="\/search"/);
    assert.match(src, /href="\/favorites"/);
  });

  it("not-found.tsx strictly excludes admin access points", () => {
    const src = readFileSync(join(ROOT, "app/not-found.tsx"), "utf8");
    assert.doesNotMatch(src, /href="\/admin"/);
    assert.doesNotMatch(src, /관리자/);
    assert.doesNotMatch(src, /Admin/);
  });

  it("admin layout retains access denied/locked state components", () => {
    const src = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(src, /AdminLockedState/);
    assert.match(src, /AdminAccessDeniedState/);
  });
});
