import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  NOTICE_FORBIDDEN_PHRASES,
  PR147_SCOPE_NOTICE,
  PUBLIC_INLINE_NOTICE,
} from "@/lib/ops/data-responsibility-notice";

const ROOT = process.cwd();

const PUBLIC_ROUTES = [
  "app/directory/page.tsx",
  "app/claim-documents/page.tsx",
  "app/disclosure-links/page.tsx",
  "app/knowledge/page.tsx",
  "app/search/page.tsx",
] as const;

const FORBIDDEN_PUBLIC = [
  "100% 최신",
  "보험금 지급이 확정",
  "무조건 지급",
  "AI가 최종 판단",
  "가입하면 해결",
] as const;

describe("PR147 data responsibility notice (static)", () => {
  it("hub forbids crawlers migration and links PR143", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-143/);
    assert.match(hub, /크롤러/);
    assert.match(hub, /migration/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /model SourceVerification/);
  });

  it("no prisma schema change or crawler code in panel", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminDataResponsibilityNoticePanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /crawler|cheerio|puppeteer/i);
    assert.match(panel, /overflow-x-auto/);
    assert.match(panel, /PR-143/);
  });

  it("data responsibility panel admin only", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminDataResponsibilityNoticePanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminDataResponsibilityNoticePanel/);
    assert.doesNotMatch(home, /데이터 책임 고지 \(PR147\)/);
  });

  it("public routes use inline notice from lib", () => {
    for (const rel of PUBLIC_ROUTES) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.match(src, /DataResponsibilityInlineNotice/);
      assert.match(src, /data-responsibility-inline-notice/);
    }
  });

  it("inline notice copy matches PUBLIC_INLINE_NOTICE", () => {
    const component = readFileSync(
      join(ROOT, "components/content/data-responsibility-inline-notice.tsx"),
      "utf8",
    );
    assert.match(component, /PUBLIC_INLINE_NOTICE/);
    for (const line of Object.values(PUBLIC_INLINE_NOTICE)) {
      assert.ok(line.length > 10 && line.length < 200);
      assert.doesNotMatch(line, /100% 최신/);
      assert.doesNotMatch(line, /확정됩니다/);
    }
  });

  it("public app pages avoid forbidden payout phrases", () => {
    for (const rel of PUBLIC_ROUTES) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const bad of FORBIDDEN_PUBLIC) {
        assert.doesNotMatch(src, new RegExp(bad));
      }
    }
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    for (const bad of FORBIDDEN_PUBLIC) {
      assert.doesNotMatch(home, new RegExp(bad));
    }
  });

  it("scope notice forbids bulk edit and source automation", () => {
    assert.match(PR147_SCOPE_NOTICE, /대량 수정/);
    assert.match(PR147_SCOPE_NOTICE, /크롤러/);
    const joined = NOTICE_FORBIDDEN_PHRASES.join(" ");
    assert.match(joined, /100% 최신|최신입니다/);
  });

  it("aa doc states no allowlist expansion", () => {
    const aa = readFileSync(
      join(ROOT, "docs/PR-147-ANSWER-ASSISTANT-NOTICE.md"),
      "utf8",
    );
    assert.match(aa, /allowlist/);
    assert.match(aa, /확대하지/);
    assert.match(aa, /verified planner/);
  });

  it("operating checklist links PR147 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-147-DATA-RESPONSIBILITY-NOTICE-OPS/);
  });

  it("PR142 liability doc references PR147 completion", () => {
    const liability = readFileSync(
      join(ROOT, "docs/PR-142-DATA-LIABILITY-NOTICE.md"),
      "utf8",
    );
    assert.match(liability, /PR-147/);
  });
});
