import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PAYMENT_INFO_ALLOWED_NOTICES,
  PAYMENT_INFO_FORBIDDEN_PHRASES,
  containsForbiddenPaymentInfoPhrase,
} from "@/lib/payment-info/payment-info-policy";
import {
  projectToPlannerVerifiedView,
} from "@/lib/work-links/verified-projection";
import { FIXTURE_PLANNER_PAYMENT } from "./verified-work-links-fixtures";

const ROOT = process.cwd();

/** User-facing surfaces only — forbidden phrase registries live under lib/. */
const SCAN_ROOTS = ["app", "components"] as const;

/** Registry modules that list forbidden phrases for tests — not user-facing copy. */
const SCAN_SKIP = new Set([
  "lib/payment-info/payment-info-policy.ts",
  "lib/pwa/install-ux-copy.ts",
  "lib/work-links/verified-copy.ts",
  "lib/work-links/review-copy.ts",
  "lib/directory/link-check-status.ts",
]);

function collectSourceFiles(dir: string, base = dir): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const rel = full.slice(ROOT.length + 1).replace(/\\/g, "/");
    if (rel.includes("node_modules") || rel.includes(".next")) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...collectSourceFiles(full, base));
    } else if (/\.(tsx?|jsx?|mjs)$/.test(entry)) {
      if (!SCAN_SKIP.has(rel)) {
        files.push(rel);
      }
    }
  }
  return files;
}

describe("PR-BS-17 payment info copy safety", () => {
  it("detects forbidden payment certainty phrases", () => {
    for (const phrase of PAYMENT_INFO_FORBIDDEN_PHRASES) {
      assert.equal(containsForbiddenPaymentInfoPhrase(phrase), true);
    }
    assert.equal(
      containsForbiddenPaymentInfoPhrase(PAYMENT_INFO_ALLOWED_NOTICES[0]!),
      false,
    );
  });

  it("planner payment projection uses allowed reference notices only", () => {
    const projected = projectToPlannerVerifiedView(FIXTURE_PLANNER_PAYMENT);
    assert.ok(projected);
    assert.equal(
      containsForbiddenPaymentInfoPhrase(projected!.displayNotice),
      false,
    );
    for (const notice of PAYMENT_INFO_ALLOWED_NOTICES) {
      assert.match(projected!.displayNotice, new RegExp(notice.slice(0, 12)));
    }
  });

  it("app/components/lib sources avoid forbidden payment phrases", () => {
    const files = SCAN_ROOTS.flatMap((root) =>
      collectSourceFiles(join(ROOT, root)),
    );
    assert.ok(files.length > 10);
    for (const rel of files) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of PAYMENT_INFO_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(
          src,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${rel} must not contain: ${phrase}`,
        );
      }
    }
  });
});
