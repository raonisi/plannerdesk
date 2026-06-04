import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR145_FORBIDDEN_PHRASES,
  PR145_OVERALL_VERDICTS,
  PR145_SCOPE_NOTICE,
} from "@/lib/ops/payment-feasibility";

const ROOT = process.cwd();

const PAYMENT_FORBIDDEN = [
  "stripe",
  "createCheckout",
  "billingPortal",
  "PaymentIntent",
  "tosspayments",
  "iamport",
];

describe("PR145 payment feasibility (static, no billing)", () => {
  it("hub forbids PG implementation and links PR140-B", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-145-PAYMENT-FEASIBILITY-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-140-B-PAYMENT-MONETIZATION-DESIGN/);
    assert.match(hub, /PG/);
    assert.match(hub, /No-Go/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /STRIPE_SECRET/);
  });

  it("formal and limited paid beta are no_go", () => {
    assert.equal(PR145_OVERALL_VERDICTS.limitedPaidBeta, "no_go");
    assert.equal(PR145_OVERALL_VERDICTS.formalMonetization, "no_go");
    assert.match(PR145_SCOPE_NOTICE, /PG 연동/);
  });

  it("no payment routes or subscription models", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Subscription\b/);
    assert.doesNotMatch(schema, /model Payment\b/);
    assert.doesNotMatch(schema, /model Invoice\b/);
    assert.doesNotMatch(schema, /model Plan\b/);

    const glob = ["app/page.tsx", "app/home-client.tsx", "app/admin/page.tsx"];
    for (const rel of glob) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of PAYMENT_FORBIDDEN) {
        assert.doesNotMatch(src, new RegExp(phrase));
      }
      assert.doesNotMatch(src, /\/checkout|\/billing|\/pricing/i);
    }
  });

  it("payment panel admin only not on public home", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminPaymentFeasibilityPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminPaymentFeasibilityPanel/);
    assert.doesNotMatch(home, /결제·유료화 가능성/);
  });

  it("panel has no prisma stripe checkout or paid role grant", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminPaymentFeasibilityPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /stripe|checkout|webhook/i);
    assert.doesNotMatch(panel, /grantPaid|paidRole|createSubscription/i);
    assert.match(panel, /가격 확정/);
    assert.match(panel, /overflow-x-auto/);
  });

  it("pg review doc lists candidates without integration code", () => {
    const pg = readFileSync(
      join(ROOT, "docs/PR-145-PG-REVIEW-SCOPE.md"),
      "utf8",
    );
    assert.match(pg, /연동/);
    assert.match(pg, /금지/);
    assert.doesNotMatch(pg, /apiKey\s*=/);
  });

  it("refund doc does not guarantee refunds", () => {
    const refund = readFileSync(
      join(ROOT, "docs/PR-145-REFUND-SUBSCRIPTION-REVIEW.md"),
      "utf8",
    );
    assert.match(refund, /확정 금지/);
    const joined = PR145_FORBIDDEN_PHRASES.join(" ");
    assert.match(joined, /환불 보장/);
  });

  it("home avoids paid service and pricing confirmation phrases", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /유료 서비스 시작/);
    assert.doesNotMatch(home, /가격 확정/);
    assert.doesNotMatch(home, /결제 완료/);
  });

  it("operating checklist links PR145 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-145-PAYMENT-FEASIBILITY-OPS/);
  });

  it("package.json has no stripe or billing deps", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.doesNotMatch(pkg, /"stripe"/);
    assert.doesNotMatch(pkg, /"@tosspayments/);
  });
});
