import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  getPlannerSignInHref,
  isPlannerSignInAvailable,
} from "@/lib/auth/planner-sign-in";
import { safePublicReturnTo } from "@/lib/auth/safe-public-return-to";
import {
  PLANNER_FAVORITES_LOGIN_CTA,
  PLANNER_FAVORITES_UNAVAILABLE_TITLE,
} from "@/lib/planner-favorites/copy";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-UX-24 planner favorites auth boundary", () => {
  it("public favorites login prompt does not use admin sign-in helper", () => {
    const prompt = read("components/planner-favorites/planner-favorites-login-prompt.tsx");
    assert.doesNotMatch(prompt, /getAdminSignInHref/);
    assert.match(prompt, /getPlannerSignInHref/);
    assert.match(prompt, /isPlannerSignInAvailable/);
    assert.doesNotMatch(prompt, /\/admin/);
    assert.doesNotMatch(prompt, /관리자/);
    assert.doesNotMatch(prompt, /운영자/);
  });

  it("gated favorite button still routes unauthenticated users to planner login prompt", () => {
    const gated = read("components/planner-favorites/gated-favorite-button.tsx");
    assert.match(gated, /PlannerFavoritesLoginPrompt/);
    assert.doesNotMatch(gated, /getAdminSignInHref/);
  });

  it("safePublicReturnTo allows public MVP paths only", () => {
    assert.equal(safePublicReturnTo("/directory"), "/directory");
    assert.equal(safePublicReturnTo("/knowledge/slug"), "/knowledge/slug");
    assert.equal(safePublicReturnTo("/search"), "/search");
    assert.equal(safePublicReturnTo(""), "/");
  });

  it("safePublicReturnTo blocks external, admin, and script URLs", () => {
    assert.equal(safePublicReturnTo("https://example.com"), "/");
    assert.equal(safePublicReturnTo("http://example.com"), "/");
    assert.equal(safePublicReturnTo("//example.com"), "/");
    assert.equal(safePublicReturnTo("javascript:alert(1)"), "/");
    assert.equal(safePublicReturnTo("data:text/html,test"), "/");
    assert.equal(safePublicReturnTo("/admin"), "/");
    assert.equal(safePublicReturnTo("/admin/insurers"), "/");
    assert.equal(safePublicReturnTo("/community"), "/");
  });

  it("planner sign-in href never targets admin callback paths", () => {
    if (!isPlannerSignInAvailable()) {
      assert.equal(getPlannerSignInHref("/directory"), null);
      return;
    }

    const href = getPlannerSignInHref("/directory");
    assert.ok(href);
    assert.doesNotMatch(href!, /callbackUrl=%2Fadmin/);
    assert.doesNotMatch(href!, /\/admin/);
    assert.match(href!, /callbackUrl=%2Fdirectory/);
  });

  it("planner sign-in href sanitizes unsafe returnTo values", () => {
    if (!isPlannerSignInAvailable()) {
      return;
    }

    const href = getPlannerSignInHref("https://evil.test");
    assert.ok(href);
    assert.match(href!, /callbackUrl=%2F(?:%2F)?$/);
    assert.match(href!, /callbackUrl=%2F/);
    assert.doesNotMatch(href!, /evil/);
  });

  it("copy uses planner-facing labels without admin wording", () => {
    const copy = read("lib/planner-favorites/copy.ts");
    assert.match(copy, /PLANNER_FAVORITES_LOGIN_CTA/);
    assert.equal(PLANNER_FAVORITES_LOGIN_CTA, "설계사 로그인");
    assert.equal(
      PLANNER_FAVORITES_UNAVAILABLE_TITLE,
      "개인 즐겨찾기 로그인 연결 확인 필요",
    );
    assert.doesNotMatch(copy, /관리자 로그인/);
    assert.doesNotMatch(copy, /운영자 로그인/);
  });

  it("login prompt does not auto-save favorites after sign-in", () => {
    const prompt = read("components/planner-favorites/planner-favorites-login-prompt.tsx");
    assert.doesNotMatch(prompt, /auto.*save|자동.*저장/i);
    const gated = read("components/planner-favorites/gated-favorite-button.tsx");
    assert.doesNotMatch(gated, /signIn\(/);
  });

  it("admin locked state still uses admin sign-in helper", () => {
    const adminLocked = read("components/admin/AdminLockedState.tsx");
    assert.match(adminLocked, /getAdminSignInHref/);
    assert.match(adminLocked, /\/admin/);
  });
});
