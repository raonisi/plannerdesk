import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  BETA_USER_FORBIDDEN_PHRASES,
  PR141_OVERALL_VERDICT,
  PR141_SCOPE_NOTICE,
} from "@/lib/ops/limited-beta-readiness";
import { OVERALL_VERDICTS } from "@/lib/ops/external-release-readiness";

const ROOT = process.cwd();

describe("PR141 limited beta readiness (static, no launch)", () => {
  it("hub links PR140 and manual approval without signup form", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-141-LIMITED-BETA-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-140-EXTERNAL-RELEASE-READINESS-OPS/);
    assert.match(hub, /PR-141-MANUAL-APPROVAL-FLOW/);
    assert.match(hub, /신청 폼/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("aligns with PR140 limited beta conditional_go", () => {
    assert.equal(OVERALL_VERDICTS.limitedBeta, "conditional_go");
    assert.equal(PR141_OVERALL_VERDICT, "conditional");
  });

  it("no beta signup route or form component", () => {
    const appScan = ["app/page.tsx", "app/home-client.tsx"];
    for (const rel of appScan) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /BetaSignup|beta-signup|베타 신청/i);
    }
    assert.doesNotMatch(
      readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8"),
      /model BetaApplication\b/,
    );
  });

  it("limited beta panel admin only", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminLimitedBetaReadinessPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminLimitedBetaReadinessPanel/);
    assert.doesNotMatch(home, /제한 베타 공개 준비/);
  });

  it("panel has no prisma allowlist mutation or marketing send", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminLimitedBetaReadinessPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /allowlist.*push|expandAllowlist/i);
    assert.doesNotMatch(panel, /nodemailer|webhook|bulkInvite/i);
    assert.match(panel, /overflow-x-auto/);
    assert.match(panel, /수동 승인/);
  });

  it("answer assistant scope stays restricted in beta scope rows", () => {
    const lib = readFileSync(
      join(ROOT, "lib/ops/limited-beta-readiness.ts"),
      "utf8",
    );
    assert.match(lib, /allowlist/);
    assert.match(lib, /forbidden/);
    assert.match(lib, /admin-bulk/);
  });

  it("forbidden beta user phrases exclude auto signup and AI full launch", () => {
    const joined = BETA_USER_FORBIDDEN_PHRASES.join(" ");
    assert.match(joined, /자동 가입/);
    assert.match(joined, /AI 상담 전면 공개/);
    assert.doesNotMatch(joined, /고객명을 입력/);
  });

  it("halt criteria includes visibility and allowlist bypass", () => {
    const halt = readFileSync(
      join(ROOT, "docs/PR-141-BETA-HALT-CRITERIA.md"),
      "utf8",
    );
    assert.match(halt, /즉시 중단/);
    assert.match(halt, /allowlist/);
    assert.match(halt, /미검수/);
  });

  it("scope doc forbids admin and aa expansion", () => {
    const scope = readFileSync(
      join(ROOT, "docs/PR-141-BETA-SCOPE.md"),
      "utf8",
    );
    assert.match(scope, /금지/);
    assert.match(scope, /allowlist/);
  });

  it("PR141 scope notice forbids launch and signup expansion", () => {
    assert.match(PR141_SCOPE_NOTICE, /실제 외부 공개 실행/);
    assert.match(PR141_SCOPE_NOTICE, /회원가입 확대/);
    assert.match(PR141_SCOPE_NOTICE, /베타 신청 폼/);
  });
});
