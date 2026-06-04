import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { insurerDirectoryEntries } from "@/lib/content/insurers";

const ROOT = process.cwd();

describe("PR122 data freshness ops (static, no database)", () => {
  it("hub links scope, status, sheet, and PR124 handoff", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-122-DATA-FRESHNESS-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-122-FRESHNESS-CHECK-SHEET/);
    assert.match(hub, /PR-124-DATA-REMEDIATION-OPS/);
    assert.match(hub, /미접근/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("cadence defines monthly and quarterly checks", () => {
    const cadence = readFileSync(
      join(ROOT, "docs/PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md"),
      "utf8",
    );
    assert.match(cadence, /월 1회/);
    assert.match(cadence, /분기 1회/);
    assert.match(cadence, /public visibility/);
    assert.match(cadence, /Critical/);
  });

  it("status values include six operator-facing states", () => {
    const status = readFileSync(
      join(ROOT, "docs/PR-122-DATA-STATUS-VALUES.md"),
      "utf8",
    );
    for (const label of [
      "정상",
      "확인 필요",
      "수정 필요",
      "보류",
      "비공개",
      "검수 대기",
    ]) {
      assert.match(status, new RegExp(label));
    }
  });

  it("check sheet has rows and fixture baseline notes", () => {
    const sheet = readFileSync(
      join(ROOT, "docs/PR-122-FRESHNESS-CHECK-SHEET.md"),
      "utf8",
    );
    assert.match(sheet, /CHK-/);
    assert.match(sheet, /visibility/);
    assert.match(sheet, /49\/49 null/);
  });

  it("PR124 handoff excludes visibility and auth from PR124 scope", () => {
    const handoff = readFileSync(
      join(ROOT, "docs/PR-122-PR124-HANDOFF-CRITERIA.md"),
      "utf8",
    );
    assert.match(handoff, /public visibility/);
    assert.match(handoff, /별도 긴급 PR/);
    assert.match(handoff, /DB\/Auth/);
  });

  it("fixture lastVerifiedAt null aligns with check sheet confirm-needed", () => {
    const allNull = insurerDirectoryEntries.every(
      (e) => e.lastVerifiedAt === null,
    );
    assert.equal(allNull, true);
    assert.equal(insurerDirectoryEntries.length, 49);
  });
});
