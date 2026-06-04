import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR117 post-limited-release smoke (static)", () => {
  it("PR117 record document includes environment and result tables", () => {
    const record = readFileSync(
      join(ROOT, "docs/PR-117-SMOKE-RESULT-RECORD.md"),
      "utf8",
    );
    assert.match(record, /배포 URL/);
    assert.match(record, /정보 부족/);
    assert.match(record, /미검수\/비공개/);
    assert.match(record, /일괄상태변경/);
    assert.match(record, /allowlist/);
    assert.doesNotMatch(record, /AUTH_SECRET=[^<\s]/);
  });

  it("failure doc defines severity and rollback triggers", () => {
    const doc = readFileSync(
      join(ROOT, "docs/PR-117-SMOKE-FAILURE-AND-DEPLOY-DECISION.md"),
      "utf8",
    );
    assert.match(doc, /Critical/);
    assert.match(doc, /Rollback/);
    assert.match(doc, /배포 보류/);
  });

  it("smoke script paths match PR110 public routes", () => {
    const script = readFileSync(
      join(ROOT, "scripts/smoke-public-routes.mjs"),
      "utf8",
    );
    const record = readFileSync(
      join(ROOT, "docs/PR-117-SMOKE-RESULT-RECORD.md"),
      "utf8",
    );
    for (const path of ["/directory", "/claim-documents", "/knowledge", "/search"]) {
      assert.match(script, new RegExp(`path: "${path}"`));
      assert.match(record, new RegExp(path.replace(/\//g, "\\/")));
    }
  });
});
