import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ACCESS_SCOPE_ROWS,
  BETA_USER_NOTICE_FORBIDDEN,
  PR146_SCOPE_NOTICE,
} from "@/lib/ops/beta-access-request-flow";

const ROOT = process.cwd();

describe("PR146 beta access request flow (static, no form)", () => {
  it("hub forbids form and links PR141 manual approval", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-141/);
    assert.match(hub, /신청 폼/);
    assert.match(hub, /allowlist/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /model BetaRequest/);
  });

  it("access scope separates beta from answer assistant", () => {
    const aa = ACCESS_SCOPE_ROWS.find((r) => r.scope.includes("Answer"));
    assert.ok(aa?.aaSeparate);
    assert.equal(aa?.betaOk, false);
    const admin = ACCESS_SCOPE_ROWS.find((r) => r.scope.includes("admin"));
    assert.ok(admin);
    assert.equal(admin?.betaOk, false);
  });

  it("no beta signup waitlist routes or schema models", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model BetaRequest\b/);
    assert.doesNotMatch(schema, /model Waitlist\b/);
    assert.doesNotMatch(schema, /model BetaInvite\b/);

    const scan = ["app/page.tsx", "app/home-client.tsx", "app/admin/page.tsx"];
    for (const rel of scan) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /beta-signup|BetaSignup|waitlist|autoApprove/i);
      assert.doesNotMatch(src, /bulkInvite|sendInviteEmail/i);
    }
  });

  it("beta flow panel admin only", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaAccessRequestFlowPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaAccessRequestFlowPanel/);
    assert.doesNotMatch(home, /제한 베타 신청 흐름/);
  });

  it("panel has no prisma auto approve or allowlist writes", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaAccessRequestFlowPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /autoApprove|grantBeta|updateAllowlist/i);
    assert.doesNotMatch(panel, /nodemailer|webhook|sendgrid/i);
    assert.match(panel, /베타 ≠ Answer Assistant|AA 별도/);
    assert.match(panel, /overflow-x-auto/);
  });

  it("pii rules forbid customer identifiers at intake", () => {
    const pii = readFileSync(
      join(ROOT, "docs/PR-146-PII-INTAKE-RULES.md"),
      "utf8",
    );
    assert.match(pii, /수집 금지/);
    assert.match(pii, /PII_FORBIDDEN_AT_INTAKE/);
    assert.match(pii, /미확정/);
  });

  it("status doc states no prisma enum", () => {
    const status = readFileSync(
      join(ROOT, "docs/PR-146-REQUEST-STATUS.md"),
      "utf8",
    );
    assert.match(status, /schema 추가 금지/);
    assert.match(status, /approved_limited/);
  });

  it("forbidden notices block auto approval phrases", () => {
    const joined = BETA_USER_NOTICE_FORBIDDEN.join(" ");
    assert.match(joined, /자동 승인/);
    assert.match(PR146_SCOPE_NOTICE, /자동 승인/);
  });

  it("operating checklist links PR146 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-146-BETA-ACCESS-REQUEST-FLOW-OPS/);
  });

  it("PR141 manual flow references PR146 completion", () => {
    const manual = readFileSync(
      join(ROOT, "docs/PR-141-MANUAL-APPROVAL-FLOW.md"),
      "utf8",
    );
    assert.match(manual, /PR-146/);
  });
});
