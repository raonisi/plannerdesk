import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR163_ENTRY_CONDITIONS,
  PR163_OPEN_CRITICAL_COUNT,
  PR163_SCOPE_NOTICE,
  PR163_TEST_FILES,
  PR163_UX_VERDICTS,
  UX_POLISH_CHECKLIST,
} from "@/lib/ops/public-ux-polish";
import { PUBLIC_UX_SEARCH_EMPTY } from "@/lib/public/public-ux-copy";
import { SEARCH_EMPTY_MESSAGE } from "@/lib/search/constants";
import { USER_REPORT_NOTICE } from "@/lib/ops/user-support-inbox-plan";

const ROOT = process.cwd();

describe("PR163 public UX polish (static, guards unchanged)", () => {
  it("hub is UX polish not auth or schema change", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-163-PUBLIC-UX-POLISH-OPS.md"),
      "utf8",
    );
    assert.match(hub, /UX|사용성/);
    assert.match(hub, /guard|권한|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions met for PR163", () => {
    assert.equal(PR163_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
  });

  it("panel admin only no prisma or guard changes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminPublicUxPolishPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminPublicUxPolishPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|allowlist|updateMany/i);
  });

  it("verdicts conditional ready guards ready", () => {
    assert.equal(PR163_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR163_UX_VERDICTS.uxPolishPrepared, "conditional");
    assert.equal(PR163_UX_VERDICTS.guardIntegrity, "ready");
  });

  it("public error report notice uses PR162 copy no PII fields", () => {
    const notice = readFileSync(
      join(ROOT, "components/content/public-error-report-notice.tsx"),
      "utf8",
    );
    assert.match(notice, /USER_REPORT_NOTICE/);
    assert.doesNotMatch(notice, /prisma|webhook/i);
    assert.match(USER_REPORT_NOTICE.footer.join(" "), /지급/);
  });

  it("footer and routes include error report notice", () => {
    const footer = readFileSync(join(ROOT, "components/footer.tsx"), "utf8");
    assert.match(footer, /PublicErrorReportNotice/);
    const directory = readFileSync(
      join(ROOT, "app/directory/page.tsx"),
      "utf8",
    );
    assert.match(directory, /PublicErrorReportNotice/);
  });

  it("access restricted panel no bypass hints", () => {
    const panel = readFileSync(
      join(ROOT, "components/content/access-restricted-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /PUBLIC_UX_ACCESS_RESTRICTED/);
    assert.doesNotMatch(panel, /우회|bypass/i);
  });

  it("search empty copy aligned with PR163", () => {
    assert.equal(SEARCH_EMPTY_MESSAGE, PUBLIC_UX_SEARCH_EMPTY);
  });

  it("knowledge safety title user facing", () => {
    const knowledge = readFileSync(
      join(ROOT, "app/knowledge/page.tsx"),
      "utf8",
    );
    assert.match(knowledge, /PUBLIC_UX_KNOWLEDGE_SAFETY_TITLE/);
    assert.doesNotMatch(knowledge, /안전 안내 박스/);
  });

  it("checklist guards unchanged", () => {
    const ids = UX_POLISH_CHECKLIST.map((c) => c.id);
    assert.ok(ids.includes("guard"));
    assert.ok(ids.includes("auth"));
    assert.ok(ids.includes("aa"));
    assert.ok(ids.includes("nodb"));
  });

  it("visibility helper untouched", () => {
    const vis = readFileSync(join(ROOT, "lib/public/visibility.ts"), "utf8");
    assert.match(vis, /isPublishedContentPubliclyVisible/);
  });

  it("operating checklist links PR163 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-163-PUBLIC-UX-POLISH-OPS/);
  });

  it("test files exist", () => {
    for (const rel of PR163_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
  });

  it("build script does not run migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
  });
});
