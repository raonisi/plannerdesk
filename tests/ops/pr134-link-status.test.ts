import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  FORBIDDEN_PUBLIC_LINK_ASSERTIONS,
  PUBLIC_LINK_SAFETY_COPY,
} from "@/lib/directory/link-check-status";

const ROOT = process.cwd();

describe("PR134 link status check (static, no HTTP)", () => {
  it("hub links procedure, sheet, and PR128", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-134-LINK-STATUS-OPS.md"),
      "utf8",
    );
    assert.match(hub, /수동/);
    assert.match(hub, /크롤/);
    assert.match(hub, /PR-128-WORK-LINKS-OPS/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("no automated link crawl or bulk fetch in new code", () => {
    const lib = readFileSync(
      join(ROOT, "lib/directory/link-check-status.ts"),
      "utf8",
    );
    assert.match(lib, /noAutoCheck/);
    assert.doesNotMatch(lib, /fetch\(/);
    assert.doesNotMatch(lib, /axios|playwright|cheerio|headless/i);

    const repoScan = [
      "lib/directory/link-check-status.ts",
      "components/directory/public-link-check-notice.tsx",
      "components/admin/AdminLinkCheckGuidePanel.tsx",
    ];
    for (const rel of repoScan) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /bulk.*fetch|crawl|linkChecker/i);
    }
  });

  it("public copy avoids forbidden assertions", () => {
    const copy = Object.values(PUBLIC_LINK_SAFETY_COPY).join(" ");
    for (const phrase of FORBIDDEN_PUBLIC_LINK_ASSERTIONS) {
      assert.doesNotMatch(copy, new RegExp(phrase));
    }
    assert.match(copy, /수동 점검/);
  });

  it("insurer work links show manual check notice and external hint", () => {
    const links = readFileSync(
      join(ROOT, "components/directory/insurer-primary-work-links.tsx"),
      "utf8",
    );
    assert.match(links, /PublicLinkCheckNotice/);
    assert.match(links, /externalOpenHint/);
    assert.match(links, /publicContentTrustHint/);
  });

  it("admin guide on insurer edit only not public routes", () => {
    const admin = readFileSync(
      join(ROOT, "app/admin/insurers/[id]/edit/page.tsx"),
      "utf8",
    );
    assert.match(admin, /AdminLinkCheckGuidePanel/);

    const directory = readFileSync(join(ROOT, "app/directory/page.tsx"), "utf8");
    assert.doesNotMatch(directory, /AdminLinkCheckGuidePanel/);
    assert.doesNotMatch(directory, /LINK_CHECK_STATUS_LABEL/);
  });

  it("prisma schema unchanged for link status columns", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /linkStatus/);
    assert.doesNotMatch(schema, /LinkCheck/);
  });

  it("check sheet template is not imported by app routes", () => {
    const sheet = readFileSync(
      join(ROOT, "docs/PR-134-LINK-CHECK-SHEET.md"),
      "utf8",
    );
    assert.match(sheet, /public·앱에 노출하지 않음/);
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.doesNotMatch(page, /PR-134-LINK-CHECK-SHEET/);
  });

  it("responsive classes on admin guide grid", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminLinkCheckGuidePanel.tsx"),
      "utf8",
    );
    assert.match(panel, /sm:grid-cols-2/);
  });
});
