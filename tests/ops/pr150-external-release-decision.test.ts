import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR150_FINAL_VERDICTS,
  PR150_OPEN_CRITICAL_COUNT,
  PR150_SCOPE_NOTICE,
  PR140_TO_149_ENTRY,
} from "@/lib/ops/external-release-decision";

const ROOT = process.cwd();

describe("PR150 external release decision (static, no launch)", () => {
  it("hub forbids launch and links PR140 PR149", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-150-EXTERNAL-RELEASE-DECISION-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-140/);
    assert.match(hub, /PR-149/);
    assert.match(hub, /외부 공개/);
    assert.match(hub, /실행 없음/);
    assert.match(hub, /Conditional Go/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("all PR140-149 entries present", () => {
    assert.equal(PR140_TO_149_ENTRY.length, 10);
    const prs = PR140_TO_149_ENTRY.map((e) => e.pr);
    assert.ok(prs.includes("PR149"));
    assert.ok(prs.includes("PR140"));
  });

  it("decision panel admin only no deploy or role writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminExternalReleaseDecisionPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminExternalReleaseDecisionPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminExternalReleaseDecisionPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /deploy|push|allowlist|updateRole/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("limited beta conditional public and paid no_go", () => {
    assert.equal(PR150_FINAL_VERDICTS.limitedExternalBeta, "conditional_go");
    assert.equal(PR150_FINAL_VERDICTS.publicBeta, "no_go");
    assert.equal(PR150_FINAL_VERDICTS.paidBeta, "no_go");
    assert.equal(PR150_FINAL_VERDICTS.formalMonetization, "no_go");
    assert.equal(PR150_FINAL_VERDICTS.internalOps, "go");
  });

  it("open critical count is zero for static audit", () => {
    assert.equal(PR150_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR150_FINAL_VERDICTS.overallUntilCodex, "conditional_go");
  });

  it("scope forbids launch and allowlist change", () => {
    assert.match(PR150_SCOPE_NOTICE, /배포/);
    assert.match(PR150_SCOPE_NOTICE, /allowlist/);
  });

  it("no payment routes in app", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Subscription\b/);
  });

  it("operating checklist links PR150 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-150-EXTERNAL-RELEASE-DECISION-OPS/);
  });

  it("PR140 deferred roadmap marks PR150 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR150-A 완료/);
  });
});
