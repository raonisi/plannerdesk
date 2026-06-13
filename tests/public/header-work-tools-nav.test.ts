import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("Header work-tools nav entry (PR-UI-NAV-01)", () => {
  it("desktop and mobile nav include work-tools link", () => {
    const header = readFileSync(join(ROOT, "components/header.tsx"), "utf8");
    const navConfig = readFileSync(join(ROOT, "lib/navigation/public-nav.ts"), "utf8");
    assert.match(navConfig, /uiLabels\.workTools/);
    assert.match(navConfig, /href:\s*"\/work-tools"/);
    assert.match(header, /MainNavigation/);
    assert.match(header, /MobileNavigation/);
    assert.match(header, /isNavItemActive/);
    assert.match(header, /mobile-nav-drawer/);
  });

  it("other primary nav links remain intact", () => {
    const navConfig = readFileSync(join(ROOT, "lib/navigation/public-nav.ts"), "utf8");
    for (const href of [
      "/search",
      "/directory",
      "/claim-documents",
      "/disclosure-links",
      "/message-templates",
    ]) {
      assert.match(navConfig, new RegExp(`href:\\s*"${href}"`));
    }
  });

  it("work-tools route is public with safety notice", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(page, /getWorkToolsAccess/);
    assert.match(page, /WorkToolsPublicNotice/);
  });
});
