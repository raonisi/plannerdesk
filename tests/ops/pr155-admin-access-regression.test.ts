import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ADMIN_REGRESSION_TARGETS,
  PR155_ENTRY_CONDITIONS,
  PR155_OPEN_CRITICAL_COUNT,
  PR155_REGRESSION_VERDICTS,
  PR155_SCOPE_NOTICE,
  PR155_TEST_FILES,
} from "@/lib/ops/admin-access-regression";
import { PR154_SMOKE_VERDICTS } from "@/lib/ops/public-smoke-expansion";

const ROOT = process.cwd();

describe("PR155 admin access regression (static, no role changes)", () => {
  it("hub forbids role changes and links PR154 PR149", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-155-ADMIN-ACCESS-REGRESSION-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-154/);
    assert.match(hub, /PR-149|security/i);
    assert.match(hub, /회귀|regression/i);
    assert.match(hub, /실행 없음|권한 변경/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("PR154 entry allows admin regression", () => {
    assert.equal(PR154_SMOKE_VERDICTS.smokeExpansionReady, "conditional_ready");
    const unmet = PR155_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("regression panel admin only no role or db writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminAccessRegressionPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminAccessRegressionPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminAccessRegressionPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /updateRole|setRole|allowlist.*=|migrate deploy/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("regression targets cover admin bulk ops data AA", () => {
    assert.ok(ADMIN_REGRESSION_TARGETS.length >= 10);
    const areas = ADMIN_REGRESSION_TARGETS.map((t) => t.area).join(" ");
    assert.match(areas, /\/admin/);
    assert.match(areas, /bulk|일괄/i);
    assert.match(areas, /answer-assistant|AA/i);
    assert.match(areas, /search|리포트|리마인더|이슈/i);
  });

  it("verdicts conditional ready no new dependencies", () => {
    assert.equal(
      PR155_REGRESSION_VERDICTS.regressionReady,
      "conditional_ready",
    );
    assert.equal(PR155_REGRESSION_VERDICTS.staticRegressionPass, true);
    assert.equal(PR155_OPEN_CRITICAL_COUNT, 0);
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    assert.equal(pkg.scripts["test:e2e"], undefined);
    assert.equal(pkg.scripts["test:smoke"], undefined);
  });

  it("scope forbids role changes and operational db", () => {
    assert.match(PR155_SCOPE_NOTICE, /회귀|admin/);
    assert.match(PR155_SCOPE_NOTICE, /role|allowlist|운영 DB/);
  });

  it("test files exist including admin-access-regression", () => {
    for (const rel of PR155_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
    const regression = readFileSync(
      join(ROOT, "tests/admin/admin-access-regression.test.ts"),
      "utf8",
    );
    assert.match(regression, /PR155 admin access regression/);
  });

  it("operating checklist links PR155 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-155-ADMIN-ACCESS-REGRESSION-OPS/);
  });

  it("PR140 deferred roadmap marks PR155 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR155-A 완료/);
  });
});
