import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  WORK_TOOLS_PUBLIC_FORBIDDEN_PHRASES,
  WORK_TOOLS_PUBLIC_OPEN_SUMMARY,
  WORK_TOOLS_PUBLIC_PII_NOTICE,
  WORK_TOOLS_PUBLIC_REFERENCE_NOTICE,
} from "@/lib/work-tools/work-tools-public-copy";

const ROOT = process.cwd();

describe("PR-BS-19C work-tools copy safety", () => {
  it("public notice includes required safety meanings", () => {
    const notice = readFileSync(
      join(ROOT, "components/work-tools/work-tools-public-notice.tsx"),
      "utf8",
    );
    assert.match(notice, /WORK_TOOLS_PUBLIC_OPEN_SUMMARY/);
    assert.match(notice, /WORK_TOOLS_PUBLIC_COMPLETION_NOTICE/);
    assert.match(notice, /WORK_TOOLS_PUBLIC_ADMIN_NOTICE/);
    assert.match(notice, /WORK_TOOLS_PUBLIC_PII_NOTICE/);
    assert.match(notice, /WORK_TOOLS_PUBLIC_REFERENCE_NOTICE/);
    assert.doesNotMatch(notice, /href="\/admin"/);
    assert.equal(WORK_TOOLS_PUBLIC_OPEN_SUMMARY.includes("로그인 없이"), true);
    assert.equal(WORK_TOOLS_PUBLIC_REFERENCE_NOTICE.includes("참고용"), true);
  });

  it("forbidden certainty phrases absent from rendered notice surfaces", () => {
    const surfaces = [
      "components/work-tools/work-tools-public-notice.tsx",
      "app/work-tools/page.tsx",
      "app/home-client.tsx",
    ];
    for (const rel of surfaces) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of WORK_TOOLS_PUBLIC_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(src, new RegExp(phrase), `${rel}: ${phrase}`);
      }
    }
  });

  it("home card uses public work-tools description", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /WORK_TOOLS_PUBLIC_HOME_CARD_DESCRIPTION/);
    assert.doesNotMatch(home, /WORK_TOOLS_PLANNER_ACCESS_NOTICE/);
  });

  it("reference and pii copy constants are present", () => {
    assert.match(WORK_TOOLS_PUBLIC_PII_NOTICE, /진단서/);
    assert.match(WORK_TOOLS_PUBLIC_REFERENCE_NOTICE, /참고용/);
    assert.match(WORK_TOOLS_PUBLIC_REFERENCE_NOTICE, /약관/);
  });
});
