import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  SILBI_REFERENCE_BALANCE_LABEL,
  WORK_TOOLS_CLAIM_BOUNDARY_NOTICE,
  WORK_TOOLS_FORBIDDEN_PAYOUT_PHRASES,
} from "@/lib/work-tools/claim-boundary-copy";

const ROOT = process.cwd();

describe("PR173-C work-tools claim boundary (static)", () => {
  it("work-tools client has no forbidden payout phrases", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    for (const phrase of WORK_TOOLS_FORBIDDEN_PAYOUT_PHRASES) {
      assert.doesNotMatch(
        client,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden phrase: ${phrase}`,
      );
    }
  });

  it("silbi calculator uses reference labels and boundary notice", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.match(client, /SILBI_REFERENCE_BALANCE_LABEL/);
    assert.match(client, /WORK_TOOLS_CLAIM_BOUNDARY_NOTICE/);
    assert.match(client, /referenceBalance/);
    assert.doesNotMatch(client, /최종 보험금 예상 환급액/);
    assert.doesNotMatch(client, /예상 환급금을 가장 정확하게/);
  });

  it("work-tools page is planner gated", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.match(page, /getWorkToolsAccess/);
    assert.match(page, /index:\s*false/);
  });

  it("boundary notice denies payout confirmation", () => {
    assert.match(WORK_TOOLS_CLAIM_BOUNDARY_NOTICE, /지급 여부/);
    assert.match(WORK_TOOLS_CLAIM_BOUNDARY_NOTICE, /확정하지 않습니다/);
    assert.match(WORK_TOOLS_CLAIM_BOUNDARY_NOTICE, /공식 안내/);
    assert.doesNotMatch(SILBI_REFERENCE_BALANCE_LABEL, /보험금|환급/);
  });

  it("pr173a guard remains on storage api", () => {
    const storage = readFileSync(
      join(ROOT, "app/api/work-tools/storage/route.ts"),
      "utf8",
    );
    assert.match(storage, /workToolsRouteGuard/);
  });
});
