import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-16 PWA install guide boundary", () => {
  it("no service worker or beforeinstallprompt implementation", () => {
    const notice = readFileSync(
      join(ROOT, "components/pwa/home-screen-install-notice.tsx"),
      "utf8",
    );
    assert.doesNotMatch(notice, /serviceWorker|beforeinstallprompt|useEffect/i);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /serviceWorker|beforeinstallprompt/i);
  });

  it("no manifest or sw files added", () => {
    assert.equal(existsSync(join(ROOT, "app/manifest.ts")), false);
    assert.equal(existsSync(join(ROOT, "public/manifest.json")), false);
    assert.equal(existsSync(join(ROOT, "public/sw.js")), false);
  });

  it("HomeScreenInstallGuide alias exports from install notice module", () => {
    const notice = readFileSync(
      join(ROOT, "components/pwa/home-screen-install-notice.tsx"),
      "utf8",
    );
    assert.match(notice, /export function HomeScreenInstallGuide/);
    assert.match(notice, /compact\?: boolean/);
    assert.match(notice, /PWA_INSTALL_NO_OFFLINE_NOTICE/);
  });

  it("work-tools page unchanged for install guard wiring", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.match(page, /getWorkToolsAccess/);
    assert.match(page, /HomeScreenInstallNotice/);
    assert.doesNotMatch(page, /serviceWorker/i);
  });
});
