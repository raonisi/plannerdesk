import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PWA_INSTALL_AUTH_NOTICE,
  PWA_INSTALL_FORBIDDEN_PHRASES,
  PWA_INSTALL_NOTICE_BODY,
  PWA_INSTALL_PII_NOTICE,
} from "@/lib/pwa/install-ux-copy";

const ROOT = process.cwd();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("PR-BS-07 PWA copy safety", () => {
  it("allowed copy includes auth and PII boundaries", () => {
    assert.match(PWA_INSTALL_NOTICE_BODY, /홈화면/);
    assert.match(PWA_INSTALL_AUTH_NOTICE, /로그인/);
    assert.match(PWA_INSTALL_AUTH_NOTICE, /권한/);
    assert.match(PWA_INSTALL_PII_NOTICE, /고객/);
    assert.match(PWA_INSTALL_PII_NOTICE, /상담 원문/);
    assert.match(PWA_INSTALL_PII_NOTICE, /계약번호/);
  });

  it("forbidden phrases are absent from install UX surfaces", () => {
    const surfaces = [
      "components/pwa/home-screen-install-notice.tsx",
      "app/home-client.tsx",
      "app/work-tools/page.tsx",
    ];

    for (const rel of surfaces) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of PWA_INSTALL_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(src, new RegExp(escapeRegExp(phrase), "i"), rel);
      }
    }
  });

  it("public home install notice does not promise Work Tools or Answer Assistant", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    const noticeBlock = home.slice(
      home.indexOf("HomeScreenInstallNotice"),
      home.indexOf("uiLabels.safetyBoundary"),
    );
    assert.doesNotMatch(noticeBlock, /Work Tools를 누구나/i);
    assert.doesNotMatch(noticeBlock, /Answer Assistant를 바로/i);
    assert.doesNotMatch(noticeBlock, /로그인 없이 설계사/i);
  });

  it("work-tools install notice only renders behind planner access guard", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.match(page, /getWorkToolsAccess/);
    assert.match(
      page,
      /getWorkToolsAccess[\s\S]*"locked"[\s\S]*AccessRestrictedPanel[\s\S]*"denied"[\s\S]*AccessRestrictedPanel[\s\S]*<HomeScreenInstallNotice/,
    );
    const jsxUsages = page.match(/<HomeScreenInstallNotice/g) ?? [];
    assert.equal(jsxUsages.length, 1);
  });
});
