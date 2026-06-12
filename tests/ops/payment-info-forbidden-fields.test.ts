import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PAYMENT_INFO_FORBIDDEN_FIELDS,
  projectionIncludesForbiddenPaymentField,
  stripForbiddenPaymentFields,
} from "@/lib/payment-info/payment-info-policy";
import type { PublicInsurer } from "@/lib/public/insurers";
import { PUBLIC_PROJECTION_FIELDS } from "@/lib/work-links/verified-projection";

const ROOT = process.cwd();

describe("PR-BS-17 payment info forbidden fields", () => {
  it("detects forbidden payment fields on projection records", () => {
    for (const field of PAYMENT_INFO_FORBIDDEN_FIELDS) {
      assert.equal(
        projectionIncludesForbiddenPaymentField({ [field]: "x" }),
        true,
        `should detect ${field}`,
      );
    }
    assert.equal(projectionIncludesForbiddenPaymentField({ title: "ok" }), false);
  });

  it("strips forbidden payment fields from records", () => {
    const cleaned = stripForbiddenPaymentFields({
      title: "납입 안내",
      cardNumber: "4111",
      cvc: "123",
      accountNumber: "123-456",
    });
    assert.equal("cardNumber" in cleaned, false);
    assert.equal("cvc" in cleaned, false);
    assert.equal("accountNumber" in cleaned, false);
    assert.equal(cleaned.title, "납입 안내");
  });

  it("PublicInsurer projection type excludes forbidden customer payment fields", () => {
    const insurerSource = readFileSync(join(ROOT, "lib/public/insurers.ts"), "utf8");
    const typeBlock = insurerSource.slice(
      insurerSource.indexOf("export interface PublicInsurer"),
      insurerSource.indexOf("export type PublicInsurersResult"),
    );
    for (const field of PAYMENT_INFO_FORBIDDEN_FIELDS) {
      assert.doesNotMatch(
        typeBlock,
        new RegExp(`\\b${field}\\b`),
        `PublicInsurer must not declare ${field}`,
      );
    }
    const _typeCheck: keyof PublicInsurer = "cardPaymentStatus";
    assert.ok(_typeCheck);
  });

  it("verified work link public projection allow list excludes forbidden fields", () => {
    for (const field of PAYMENT_INFO_FORBIDDEN_FIELDS) {
      assert.equal(
        (PUBLIC_PROJECTION_FIELDS as readonly string[]).includes(field),
        false,
        `PUBLIC_PROJECTION_FIELDS must not include ${field}`,
      );
    }
  });

  it("payment info policy module does not define storage for forbidden fields", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/payment-info/payment-info-policy.ts"),
      "utf8",
    );
    for (const field of ["cardNumber", "cvc", "accountNumber", "paymentToken"]) {
      const assignPattern = new RegExp(`${field}\\s*:`);
      assert.doesNotMatch(
        policySource,
        assignPattern,
        `policy module must not assign ${field}`,
      );
    }
  });
});
