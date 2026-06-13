import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  OVERALL_VERDICTS,
  PR140_SCOPE_NOTICE,
} from "@/lib/ops/external-release-readiness";

const ROOT = process.cwd();

const PAYMENT_FORBIDDEN = [
  "stripe",
  "Stripe",
  "createCheckout",
  "subscription",
  "billingPortal",
  "PaymentIntent",
  "tosspayments",
  "iamport",
];

describe("PR140 external release readiness (static, judgment only)", () => {
  it("hub documents PR140-B and no payment implementation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-140-EXTERNAL-RELEASE-READINESS-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-140-B-PAYMENT-MONETIZATION-DESIGN/);
    assert.match(hub, /결제/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("monetization verdict is no_go for paid and formal tiers", () => {
    assert.equal(OVERALL_VERDICTS.paidBeta, "no_go");
    assert.equal(OVERALL_VERDICTS.formalMonetization, "no_go");
    assert.match(PR140_SCOPE_NOTICE, /결제/);
  });

  it("no payment routes or billing models in app or prisma", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Subscription\b/);
    assert.doesNotMatch(schema, /model Payment\b/);

    const appDirs = ["app/page.tsx", "app/admin/page.tsx"];
    for (const rel of appDirs) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of PAYMENT_FORBIDDEN) {
        assert.doesNotMatch(src, new RegExp(phrase));
      }
    }
  });

  it("release panel admin only not on public home", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminExternalReleaseReadinessPanel/);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminExternalReleaseReadinessPanel/);
    assert.doesNotMatch(home, /유료화 준비 판단/);
  });

  it("panel has no payment signup prisma or marketing send", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminExternalReleaseReadinessPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /nodemailer|webhook|cron/i);
    assert.doesNotMatch(panel, /stripe|checkout/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("package.json scripts unchanged for billing", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.doesNotMatch(pkg, /"billing"/);
    assert.doesNotMatch(pkg, /stripe/);
  });

  it("links PR130 PR139 PR137 in deferred roadmap", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR145/);
    assert.match(roadmap, /PR148/);
    assert.match(roadmap, /PR150/);
  });

  it("go nogo separates external and monetization", () => {
    const go = readFileSync(
      join(ROOT, "docs/PR-140-GO-NOGO-CRITERIA.md"),
      "utf8",
    );
    assert.match(go, /외부 공개 Go ≠ 유료화 Go/);
    assert.match(go, /No-Go/);
  });

  it("answer assistant row stays limited beta in feature matrix", () => {
    const features = readFileSync(
      join(ROOT, "docs/PR-140-FEATURE-RELEASE-MATRIX.md"),
      "utf8",
    );
    assert.match(features, /Answer Assistant/);
    assert.match(features, /allowlist|제한 베타/);
    assert.match(features, /No-Go/);
  });

  it("public visibility tests still referenced in checklist doc", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/PR-140-EXTERNAL-READINESS-CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /getPublic/);
    assert.match(checklist, /미검수/);
  });
});
