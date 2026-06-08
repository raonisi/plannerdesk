import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PAYMENT_ARCHITECTURE_CHECKLIST,
  PAYMENT_ARCHITECTURE_NO_GO,
  PAYMENT_DATA_NON_STORAGE_RULES,
  PG_REVIEW_CHECKLIST,
  PG_SDK_FORBIDDEN,
  PR170_ARCHITECTURE_VERDICTS,
  PR170_ENTRY_CONDITIONS,
  PR170_FORBIDDEN_PHRASES,
  PR170_OPEN_CRITICAL_COUNT,
  PR170_SCOPE_NOTICE,
  PR170_TEST_FILES,
} from "@/lib/ops/payment-architecture-plan";

const ROOT = process.cwd();

const ROUTE_FORBIDDEN = [
  "createCheckout",
  "billingPortal",
  "createSubscription",
  "PaymentIntent",
  "webhook",
];

describe("PR170 payment architecture plan (static, no billing)", () => {
  it("hub is architecture plan not payment implementation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Architecture Plan|결제 구조/);
    assert.match(hub, /PG|checkout|billing|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.match(hub, /검토 필요/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /stripe\.com/i);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR170_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR170_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no prisma stripe checkout webhook or billing", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminPaymentArchitecturePlanPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminPaymentArchitecturePlanPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|stripe|checkout|webhook|createSubscription/i);
    assert.match(panel, /PR170_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminPaymentArchitecturePlanPanel/);
  });

  it("verdicts conditional ready billing and storage blocked", () => {
    assert.equal(PR170_ARCHITECTURE_VERDICTS.paymentArchitecturePlan, "conditional");
    assert.equal(PR170_ARCHITECTURE_VERDICTS.architectureReviewDefined, "ready");
    assert.equal(PR170_ARCHITECTURE_VERDICTS.billingImplementation, "blocked");
    assert.equal(PR170_ARCHITECTURE_VERDICTS.paymentDataStorage, "blocked");
  });

  it("pg checklist requires no direct payment data storage", () => {
    const noStore = PG_REVIEW_CHECKLIST.find((r) => r.id === "no-store");
    assert.equal(noStore?.status, "required");
    const pan = PAYMENT_DATA_NON_STORAGE_RULES.find((r) => r.id === "pan");
    assert.match(pan?.rule ?? "", /금지/);
  });

  it("no-go blocks pan storage webhook secret and price finalization", () => {
    const situations = PAYMENT_ARCHITECTURE_NO_GO.map((r) => r.situation);
    assert.ok(situations.some((s) => s.includes("저장")));
    assert.ok(situations.some((s) => s.includes("webhook")));
    assert.ok(situations.some((s) => s.includes("가격")));
  });

  it("no payment routes subscription models pg deps or api routes", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Subscription\b/);
    assert.doesNotMatch(schema, /model Payment\b/);
    assert.doesNotMatch(schema, /model BillingProfile\b/);
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
    assert.equal(existsSync(join(ROOT, "app/billing")), false);
    assert.equal(existsSync(join(ROOT, "app/api/payment")), false);
    assert.equal(existsSync(join(ROOT, "app/api/webhooks")), false);

    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    for (const sdk of PG_SDK_FORBIDDEN) {
      assert.doesNotMatch(pkg, new RegExp(`"${sdk}"`));
    }
  });

  it("ssot has no prisma import", () => {
    const ssot = readFileSync(
      join(ROOT, "lib/ops/payment-architecture-plan.ts"),
      "utf8",
    );
    assert.doesNotMatch(ssot, /from ["']@\/lib\/prisma/);
  });

  it("checklist blocks live billing pending pg select gap", () => {
    assert.ok(
      PAYMENT_ARCHITECTURE_CHECKLIST.find((c) => c.id === "no-billing")?.status ===
        "met",
    );
    assert.ok(
      PAYMENT_ARCHITECTURE_CHECKLIST.find((c) => c.id === "live-billing")?.status ===
        "pending",
    );
    assert.ok(
      PAYMENT_ARCHITECTURE_CHECKLIST.find((c) => c.id === "pg-select")?.status ===
        "gap",
    );
  });

  it("public home has no payment sdk or forbidden phrases", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    for (const sdk of PG_SDK_FORBIDDEN) {
      assert.doesNotMatch(home, new RegExp(sdk, "i"));
    }
    for (const phrase of PR170_FORBIDDEN_PHRASES.slice(0, 6)) {
      assert.doesNotMatch(home, new RegExp(phrase));
    }
    for (const term of ROUTE_FORBIDDEN) {
      assert.doesNotMatch(home, new RegExp(term));
    }
  });

  it("aa route guard unchanged", () => {
    const page = readFileSync(
      join(ROOT, "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(page, /requireVerifiedPlannerAccess|verified/i);
    const access = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(access, /allowlist|NOT_ALLOWLISTED/i);
  });

  it("operating checklist links PR170 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS/);
  });

  it("test files exist", () => {
    for (const file of PR170_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });

  it("scope notice matches SSOT", () => {
    assert.match(PR170_SCOPE_NOTICE, /PG/);
    assert.match(PR170_SCOPE_NOTICE, /checkout/);
  });
});
