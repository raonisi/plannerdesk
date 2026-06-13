import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { LANDING_FORBIDDEN_PHRASES, PR144_SCOPE_NOTICE } from "@/lib/ops/public-landing-safety";

const ROOT = process.cwd();

describe("PR144 public landing safety (static, no launch)", () => {
  it("hub forbids launch signup and payment implementation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-144-PUBLIC-LANDING-SAFETY-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-140/);
    assert.match(hub, /PR-141-LIMITED-BETA|PR-143/);
    assert.match(hub, /외부 공개 실행/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /stripe/i);
  });

  it("home and footer avoid forbidden landing phrases", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    const footer = readFileSync(join(ROOT, "components/footer.tsx"), "utf8");
    const combined = home + footer;
    for (const phrase of LANDING_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(
        combined,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden phrase: ${phrase}`,
      );
    }
    assert.match(home, /PUBLIC_LANDING_LIMITED_BETA_NOTICE/);
    assert.match(home, /PUBLIC_WORK_HUB_VISIBILITY_NOTICE/);
    assert.match(footer, /PUBLIC_LANDING_FOOTER_LINE/);
  });

  it("home includes limited beta and PII guidance in safety section", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /제한 베타/);
    assert.match(home, /개인정보/);
    assert.match(home, /PLANNER_ANSWER_ASSISTANT_HUB_NOTE/);
    assert.match(home, /PUBLIC_LANDING_LIMITED_BETA_NOTICE/);
  });

  it("no beta signup payment or privacy collection routes on landing", () => {
    const scan = ["app/page.tsx", "app/home-client.tsx"];
    for (const rel of scan) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /BetaSignup|beta-signup|checkout|stripe/i);
      assert.doesNotMatch(src, /PrivacyConsentForm|terms-consent/i);
    }
  });

  it("landing safety panel admin only", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminPublicLandingSafetyPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminPublicLandingSafetyPanel/);
    assert.doesNotMatch(home, /Public Landing 안전성/);
  });

  it("panel has no prisma payment or signup writes", () => {
    const panel = readFileSync(
      join(ROOT,
        "components/admin/AdminPublicLandingSafetyPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /createUser|checkout|stripe/i);
    assert.match(panel, /외부 공개 실행/);
    assert.match(panel, /overflow-x-auto/);
  });

  it("checklist marks admin and AA as not public", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/PR-144-LANDING-SAFETY-CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /관리자 정보/);
    assert.match(checklist, /AA 제한/);
    assert.match(PR144_SCOPE_NOTICE, /신규 마케팅/);
  });

  it("CTA doc forbids signup and payment CTAs", () => {
    const cta = readFileSync(join(ROOT, "docs/PR-144-CTA-SAFETY.md"), "utf8");
    assert.match(cta, /지금 가입/);
    assert.match(cta, /유료 결제/);
  });

  it("operating checklist links PR144 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-144-PUBLIC-LANDING-SAFETY-OPS/);
  });

  it("package.json unchanged for payment or marketing automation", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.doesNotMatch(pkg, /"@sendgrid/);
    assert.doesNotMatch(pkg, /"stripe"/);
  });
});
