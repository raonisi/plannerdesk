import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR154_ENTRY_CONDITIONS,
  PR154_SCOPE_NOTICE,
  PR154_SMOKE_VERDICTS,
  PR154_OPEN_CRITICAL_COUNT,
  PR154_TEST_FILES,
  PUBLIC_SMOKE_TARGETS,
} from "@/lib/ops/public-smoke-expansion";
import { PR153_PACK_VERDICTS } from "@/lib/ops/beta-user-notice-pack";

const ROOT = process.cwd();

describe("PR154 public smoke expansion (static, no launch)", () => {
  it("hub forbids launch and links PR153 PR147", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-153/);
    assert.match(hub, /PR-147|visibility/i);
    assert.match(hub, /smoke|Smoke/i);
    assert.match(hub, /실행 없음|외부 공개/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("PR153 entry allows smoke expansion", () => {
    assert.equal(PR153_PACK_VERDICTS.noticePackPrepared, "conditional_ready");
    const unmet = PR154_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("smoke panel admin only no deploy or db writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminPublicSmokeExpansionPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminPublicSmokeExpansionPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminPublicSmokeExpansionPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /deploy|allowlist|updateRole|migrate deploy/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("smoke targets cover landing directory claim admin planner", () => {
    assert.ok(PUBLIC_SMOKE_TARGETS.length >= 12);
    const areas = PUBLIC_SMOKE_TARGETS.map((t) => t.area).join(" ");
    assert.match(areas, /landing/);
    assert.match(areas, /디렉터리|directory/i);
    assert.match(areas, /청구/);
    assert.match(areas, /admin/);
    assert.match(areas, /answer-assistant/i);
  });

  it("verdicts conditional ready no new dependencies", () => {
    assert.equal(PR154_SMOKE_VERDICTS.smokeExpansionReady, "conditional_ready");
    assert.equal(PR154_SMOKE_VERDICTS.staticSmokePass, true);
    assert.equal(PR154_OPEN_CRITICAL_COUNT, 0);
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    assert.ok(pkg.scripts["smoke:public"]);
    assert.equal(pkg.scripts["test:e2e"], undefined);
    assert.equal(pkg.scripts["test:smoke"], undefined);
  });

  it("scope forbids launch and operational db", () => {
    assert.match(PR154_SCOPE_NOTICE, /smoke/);
    assert.match(PR154_SCOPE_NOTICE, /운영 DB|allowlist/);
  });

  it("test files exist including extended public-routes-smoke", () => {
    for (const rel of PR154_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
    const extended = readFileSync(
      join(ROOT, "tests/public/public-routes-smoke.test.ts"),
      "utf8",
    );
    assert.match(extended, /PR154 public smoke expansion/);
  });

  it("operating checklist links PR154 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-154-PUBLIC-SMOKE-EXPANSION-OPS/);
  });

  it("PR140 deferred roadmap marks PR154 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR154-A 완료/);
  });
});
