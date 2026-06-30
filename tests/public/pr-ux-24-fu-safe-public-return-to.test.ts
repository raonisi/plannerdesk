import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  safeAuthRedirectUrl,
  sanitizeAuthCallbackUrl,
  sanitizeOAuthCallbackPath,
} from "../../lib/auth/oauth-callback-guard";
import { safePublicReturnTo } from "../../lib/auth/safe-public-return-to";

describe("PR-UX-24-FU: safePublicReturnTo sanitize", () => {
  it("allows standard public paths", () => {
    assert.equal(safePublicReturnTo("/directory"), "/directory");
    assert.equal(safePublicReturnTo("/search"), "/search");
  });

  it("preserves query strings for valid paths", () => {
    assert.equal(safePublicReturnTo("/search?q=test"), "/search?q=test");
    assert.equal(safePublicReturnTo("/directory?foo=bar"), "/directory?foo=bar");
  });

  it("preserves hash fragments for valid paths", () => {
    assert.equal(safePublicReturnTo("/search#top"), "/search#top");
    assert.equal(safePublicReturnTo("/directory?q=1#section"), "/directory?q=1#section");
  });

  it("blocks admin paths", () => {
    assert.equal(safePublicReturnTo("/admin"), "/");
    assert.equal(safePublicReturnTo("/admin/dashboard"), "/");
    assert.equal(safePublicReturnTo("/admin?q=test"), "/");
  });

  it("blocks external URLs and javascript/data schemas", () => {
    assert.equal(safePublicReturnTo("https://evil.test"), "/");
    assert.equal(safePublicReturnTo("http://evil.test/search"), "/");
    assert.equal(safePublicReturnTo("//evil.test"), "/");
    assert.equal(safePublicReturnTo("javascript:alert(1)"), "/");
    assert.equal(safePublicReturnTo("data:text/html,test"), "/");
    assert.equal(safePublicReturnTo("ftp://evil.test"), "/");
  });

  it("blocks non-public paths", () => {
    assert.equal(safePublicReturnTo("/some-unknown-path"), "/");
    assert.equal(safePublicReturnTo("/api/auth/signin"), "/");
  });

  it("handles empty or missing input", () => {
    assert.equal(safePublicReturnTo(""), "/");
    assert.equal(safePublicReturnTo(null), "/");
    assert.equal(safePublicReturnTo(undefined), "/");
  });
});

describe("PR-UX-24-FU: OAuth callback guard", () => {
  it("sanitizes decoded and encoded callback paths", () => {
    assert.equal(sanitizeOAuthCallbackPath("/"), "/");
    assert.equal(sanitizeOAuthCallbackPath("/directory"), "/directory");
    assert.equal(sanitizeOAuthCallbackPath("/search?q=test"), "/search?q=test");
    assert.equal(
      sanitizeOAuthCallbackPath("/directory?query=일성"),
      "/directory?query=일성",
    );

    assert.equal(sanitizeOAuthCallbackPath("/admin"), "/");
    assert.equal(sanitizeOAuthCallbackPath("/admin/users"), "/");
    assert.equal(sanitizeOAuthCallbackPath("https://evil.test"), "/");
    assert.equal(sanitizeOAuthCallbackPath("http://evil.test"), "/");
    assert.equal(sanitizeOAuthCallbackPath("//evil.test"), "/");
    assert.equal(sanitizeOAuthCallbackPath("javascript:alert(1)"), "/");
    assert.equal(sanitizeOAuthCallbackPath("data:text/html,test"), "/");
    assert.equal(sanitizeOAuthCallbackPath("ftp://evil.test"), "/");
    assert.equal(sanitizeOAuthCallbackPath("%2Fadmin"), "/");
    assert.equal(sanitizeOAuthCallbackPath("%2Fadmin%2Fusers"), "/");
    assert.equal(sanitizeOAuthCallbackPath("https%3A%2F%2Fevil.test"), "/");
    assert.equal(sanitizeOAuthCallbackPath("%"), "/");
  });

  it("builds safe Auth.js redirect callback URLs", () => {
    const baseUrl = "https://plannerdesk.test";

    assert.equal(
      safeAuthRedirectUrl("/directory", baseUrl),
      "https://plannerdesk.test/directory",
    );
    assert.equal(
      safeAuthRedirectUrl("/search?q=test", baseUrl),
      "https://plannerdesk.test/search?q=test",
    );
    assert.equal(safeAuthRedirectUrl("/admin", baseUrl), "https://plannerdesk.test");
    assert.equal(
      safeAuthRedirectUrl("/admin/users", baseUrl),
      "https://plannerdesk.test",
    );
    assert.equal(
      safeAuthRedirectUrl("https://evil.test", baseUrl),
      "https://plannerdesk.test",
    );
    assert.equal(safeAuthRedirectUrl("//evil.test", baseUrl), "https://plannerdesk.test");
    assert.equal(
      safeAuthRedirectUrl("javascript:alert(1)", baseUrl),
      "https://plannerdesk.test",
    );
    assert.equal(
      safeAuthRedirectUrl("data:text/html,test", baseUrl),
      "https://plannerdesk.test",
    );
    assert.equal(safeAuthRedirectUrl("%", baseUrl), "https://plannerdesk.test");
  });

  it("normalizes direct signin callbackUrl query before Auth.js receives it", () => {
    const cases = [
      ["/api/auth/signin?callbackUrl=%2Fadmin", "/"],
      ["/api/auth/signin?callbackUrl=%2Fadmin%2Fusers", "/"],
      ["/api/auth/signin?callbackUrl=https%3A%2F%2Fevil.test", "/"],
      ["/api/auth/signin?callbackUrl=javascript%3Aalert(1)", "/"],
      ["/api/auth/signin?callbackUrl=data%3Atext%2Fhtml%2Ctest", "/"],
      ["/api/auth/signin?callbackUrl=%25", "/"],
      ["/api/auth/signin?callbackUrl=%2Fdirectory", "/directory"],
    ] as const;

    for (const [path, expected] of cases) {
      const url = `https://plannerdesk.test${path}`;
      const sanitized = sanitizeAuthCallbackUrl(url);
      const callbackUrl = new URL(sanitized).searchParams.get("callbackUrl");
      assert.equal(callbackUrl, expected);
    }
  });
});
