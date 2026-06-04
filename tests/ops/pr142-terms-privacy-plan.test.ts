import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  NOTICE_FORBIDDEN_PHRASES,
  PR142_FORBIDDEN_DOC_CONTENT,
  PR142_SCOPE_NOTICE,
} from "@/lib/ops/terms-privacy-plan";

const ROOT = process.cwd();

describe("PR142 terms and privacy plan (static, no legal finalization)", () => {
  it("hub documents PR142-B and no final terms wording", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-142-TERMS-PRIVACY-PLAN-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-142-B-LEGAL-PUBLICATION-DESIGN/);
    assert.match(hub, /확정/);
    assert.doesNotMatch(hub, /최종 약관으로 확정/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("forbidden doc phrases exclude finalized legal claims", () => {
    const joined = NOTICE_FORBIDDEN_PHRASES.join(" ");
    assert.match(joined, /최종 약관/);
    assert.match(joined, /개인정보처리방침 확정/);
    assert.match(joined, /법적 검토 완료/);
    assert.match(PR142_FORBIDDEN_DOC_CONTENT, /최종 약관/);
  });

  it("no consent flow or privacy signup routes", () => {
    const scan = ["app/page.tsx", "app/home-client.tsx", "app/admin/page.tsx"];
    for (const rel of scan) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /TermsConsent|privacy-consent|약관 동의/i);
      assert.doesNotMatch(src, /PrivacyPolicyAccept/);
    }
  });

  it("terms panel admin only not public", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminTermsPrivacyPlanPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminTermsPrivacyPlanPanel/);
    assert.doesNotMatch(home, /약관·개인정보 준비 계획/);
  });

  it("panel has no prisma consent writes or payment", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminTermsPrivacyPlanPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /stripe|checkout|createUser/i);
    assert.match(panel, /동의 플로우/);
    assert.match(panel, /overflow-x-auto/);
  });

  it("privacy prep marks collection as info gap not finalized", () => {
    const privacy = readFileSync(
      join(ROOT, "docs/PR-142-PRIVACY-PREP-SCOPE.md"),
      "utf8",
    );
    assert.match(privacy, /정보 부족/);
    assert.match(privacy, /입력 금지/);
    assert.doesNotMatch(privacy, /확정 개인정보/);
  });

  it("legal review items defer dispute and paid terms", () => {
    const legal = readFileSync(
      join(ROOT, "docs/PR-142-LEGAL-REVIEW-ITEMS.md"),
      "utf8",
    );
    assert.match(legal, /법무/);
    assert.match(legal, /PR145/);
    assert.match(legal, /확정 문구 없음/);
  });

  it("links PR140 PR141 in hub", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-142-TERMS-PRIVACY-PLAN-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-140/);
    assert.match(hub, /PR-141/);
  });

  it("scope notice forbids consent and collection forms", () => {
    assert.match(PR142_SCOPE_NOTICE, /동의 플로우/);
    assert.match(PR142_SCOPE_NOTICE, /개인정보 수집 폼/);
    assert.match(PR142_SCOPE_NOTICE, /법적 확정/);
  });

  it("no PrivacyPolicy or TermsOfService prisma models", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model TermsOfService\b/);
    assert.doesNotMatch(schema, /model PrivacyConsent\b/);
  });
});
