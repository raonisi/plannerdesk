import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-07 PWA install UX (static)", () => {
  it("documents BS-07 and defers manifest to follow-up", () => {
    const doc = readFileSync(
      join(ROOT, "docs/PR-BS-07-PWA-INSTALL-UX-REVIEW.md"),
      "utf8",
    );
    assert.match(doc, /PR-BS-07/);
    assert.match(doc, /service worker/);
    assert.match(doc, /후속/);
    assert.doesNotMatch(doc, /AUTH_SECRET=/);
  });

  it("has no web app manifest or service worker files yet", () => {
    assert.equal(existsSync(join(ROOT, "app/manifest.ts")), false);
    assert.equal(existsSync(join(ROOT, "public/manifest.json")), false);
    assert.equal(existsSync(join(ROOT, "public/sw.js")), false);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /serviceWorker|beforeinstallprompt/i);
  });

  it("wires install notice on public home and planner work-tools", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /HomeScreenInstallNotice/);
    assert.match(home, /variant=\{plannerFavoritesEnabled/);

    const workTools = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.match(workTools, /HomeScreenInstallNotice/);
    assert.match(workTools, /getWorkToolsAccess/);
  });

  it("install notice component does not auto-trigger install prompt", () => {
    const notice = readFileSync(
      join(ROOT, "components/pwa/home-screen-install-notice.tsx"),
      "utf8",
    );
    assert.match(notice, /details/);
    assert.doesNotMatch(notice, /beforeinstallprompt|serviceWorker/i);
    assert.doesNotMatch(notice, /useEffect/);
  });
});
