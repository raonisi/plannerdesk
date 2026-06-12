import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  getInstallGuideBody,
  getInstallGuidePiiNotice,
  PWA_INSTALL_AUTH_NOTICE,
  PWA_INSTALL_FORBIDDEN_PHRASES,
  PWA_INSTALL_PLANNER_ACCESS_NOTICE,
  PWA_INSTALL_PLANNER_BODY,
  PWA_INSTALL_PLANNER_PII_NOTICE,
  PWA_INSTALL_NOTICE_BODY,
  PWA_INSTALL_PII_NOTICE,
} from "@/lib/pwa/install-ux-copy";

const ROOT = process.cwd();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("PR-BS-16 PWA install guide copy", () => {
  it("public copy includes browser variance and auth retention", () => {
    assert.match(PWA_INSTALL_NOTICE_BODY, /브라우저/);
    assert.match(PWA_INSTALL_NOTICE_BODY, /기기/);
    assert.match(PWA_INSTALL_AUTH_NOTICE, /로그인/);
    assert.match(PWA_INSTALL_AUTH_NOTICE, /권한/);
  });

  it("planner copy includes Work Tools and Answer Assistant access boundary", () => {
    assert.match(PWA_INSTALL_PLANNER_BODY, /바로가기/);
    assert.match(PWA_INSTALL_PLANNER_ACCESS_NOTICE, /Work Tools/);
    assert.match(PWA_INSTALL_PLANNER_ACCESS_NOTICE, /Answer Assistant/);
    assert.equal(getInstallGuideBody("planner"), PWA_INSTALL_PLANNER_BODY);
  });

  it("PII notices include contract number and consultation text", () => {
    assert.match(PWA_INSTALL_PII_NOTICE, /계약번호/);
    assert.match(PWA_INSTALL_PII_NOTICE, /상담 원문/);
    assert.match(PWA_INSTALL_PLANNER_PII_NOTICE, /브라우저/);
    assert.equal(getInstallGuidePiiNotice("planner"), PWA_INSTALL_PLANNER_PII_NOTICE);
  });
});

describe("PR-BS-16 home screen guide safety", () => {
  it("install guide UI avoids forbidden overclaim phrases", () => {
    const surfaces = [
      "components/pwa/home-screen-install-notice.tsx",
      "app/home-client.tsx",
    ];
    for (const rel of surfaces) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of PWA_INSTALL_FORBIDDEN_PHRASES) {
        if (phrase === "beforeinstallprompt" || phrase === "serviceWorker.register") {
          assert.doesNotMatch(src, new RegExp(escapeRegExp(phrase), "i"), rel);
          continue;
        }
        assert.doesNotMatch(
          src,
          new RegExp(escapeRegExp(phrase)),
          `${rel} must not contain: ${phrase}`,
        );
      }
    }
  });

  it("public home does not expose Work Tools or AA as install shortcuts", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    const installBlocks = home.match(/HomeScreenInstallNotice[\s\S]*?\/>/g) ?? [];
    assert.ok(installBlocks.length >= 1);
    for (const block of installBlocks) {
      assert.doesNotMatch(block, /Work Tools를 바로/i);
      assert.doesNotMatch(block, /Answer Assistant를 바로/i);
      assert.doesNotMatch(block, /관리자 기능/i);
    }
  });

  it("planner sidebar uses compact install guide without bypassing auth", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /HomeScreenInstallNotice compact variant="planner"/);
    assert.match(home, /plannerFavoritesEnabled \? \(/);
  });
});
