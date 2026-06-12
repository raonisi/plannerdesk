import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  isCodeSearchPublicAllowed,
  CODE_SEARCH_WORK_TOOLS_TOOL_IDS,
} from "@/lib/work-tools/code-search-safety";
import {
  PUBLIC_SEARCH_FILTER_OPTIONS,
  SEARCH_DOMAIN_DISPLAY_ORDER,
  SEARCH_DOMAIN_LABEL,
} from "@/lib/search/labels";

const ROOT = process.cwd();

describe("PR-BS-18 code search public visibility", () => {
  it("excludes code search from public search domains", () => {
    const domains = SEARCH_DOMAIN_DISPLAY_ORDER.map((d) => d.toLowerCase());
    const labels = Object.values(SEARCH_DOMAIN_LABEL).join(" ");
    for (const forbidden of [
      "disease_code",
      "surgery_code",
      "disease-code",
      "kcd",
      "상병코드",
      "수술코드",
      "인수예외",
    ]) {
      assert.equal(domains.includes(forbidden), false, `domain: ${forbidden}`);
    }
    assert.doesNotMatch(labels, /상병코드|수술코드|KCD|인수예외/);
    for (const opt of PUBLIC_SEARCH_FILTER_OPTIONS) {
      assert.doesNotMatch(opt.label, /상병|수술코드|KCD|인수예외/);
      assert.doesNotMatch(opt.param, /diseaseCode|surgeryCode|kcd/i);
    }
  });

  it("keeps public search fetch helpers free of work-tools code APIs", () => {
    const pub = readFileSync(join(ROOT, "lib/search/public.ts"), "utf8");
    assert.doesNotMatch(pub, /\/api\/work-tools\/disease-codes/);
    assert.doesNotMatch(pub, /\/api\/work-tools\/surgery-codes/);
    assert.doesNotMatch(pub, /\/api\/work-tools\/diseases/);
    assert.doesNotMatch(pub, /canAccessWorkTools|getWorkToolsAccess/);
  });

  it("does not expose code search CTA on public home", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /\/work-tools\?tool=disease-code/);
    assert.doesNotMatch(home, /\/work-tools\?tool=surgery-code/);
    assert.doesNotMatch(home, /\/work-tools\?tool=disease-search/);
    for (const toolId of CODE_SEARCH_WORK_TOOLS_TOOL_IDS) {
      assert.doesNotMatch(home, new RegExp(`tool=${toolId}`));
    }
  });

  it("shows code tool names on landing only as non-link labels behind planner notice", () => {
    const major = readFileSync(
      join(ROOT, "components/directory/major-work-links.tsx"),
      "utf8",
    );
    assert.match(major, /WorkToolsPlannerNotice/);
    assert.doesNotMatch(major, /href=.*work-tools\?tool=/);
    assert.match(major, /border-dashed/);
  });

  it("does not list code search in public directory insurer cards", () => {
    const directory = readFileSync(join(ROOT, "app/directory/page.tsx"), "utf8");
    assert.doesNotMatch(directory, /\/api\/work-tools\/disease-codes/);
    assert.doesNotMatch(directory, /DiseaseCodeSearchTool/);
  });

  it("policy helper denies public code search", () => {
    assert.equal(isCodeSearchPublicAllowed(), false);
  });
});
