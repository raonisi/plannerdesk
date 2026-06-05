import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  BETA_USER_NOTICES,
  getAllNoticeText,
  NOTICE_PACK_COMPOSITION,
  NOTICE_PACK_FORBIDDEN_PHRASES,
  PR153_ENTRY_CONDITIONS,
  PR153_PACK_VERDICTS,
  PR153_OPEN_CRITICAL_COUNT,
  PR153_SCOPE_NOTICE,
} from "@/lib/ops/beta-user-notice-pack";
import { PR152_OPERATOR_VERDICTS } from "@/lib/ops/beta-operator-checklist";

const ROOT = process.cwd();

describe("PR153 beta user notice pack (static, no send)", () => {
  it("hub forbids send and links PR152 PR147", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-153-BETA-USER-NOTICE-PACK-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-152/);
    assert.match(hub, /PR-147|데이터 책임/);
    assert.match(hub, /안내문|Notice Pack/i);
    assert.match(hub, /발송 없음|실제 발송/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("PR152 entry allows notice pack", () => {
    assert.equal(PR152_OPERATOR_VERDICTS.checklistPrepared, "conditional_ready");
    assert.notEqual(PR152_OPERATOR_VERDICTS.checklistPrepared, "not_ready");
    const unmet = PR153_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("notice panel admin only no send or role writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaUserNoticePackPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaUserNoticePackPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaUserNoticePackPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(
      panel,
      /sendMail|sendSms|webhook|nodemailer|allowlist|updateRole|beta user/i,
    );
    assert.match(panel, /overflow-x-auto|details/);
  });

  it("twelve notices match composition", () => {
    assert.equal(BETA_USER_NOTICES.length, 12);
    assert.equal(NOTICE_PACK_COMPOSITION.length, 12);
    for (const row of NOTICE_PACK_COMPOSITION) {
      assert.ok(
        BETA_USER_NOTICES.some((n) => n.id === row.noticeId),
        `missing notice ${row.noticeId}`,
      );
    }
  });

  it("notice bodies exclude forbidden phrases", () => {
    const all = getAllNoticeText();
    for (const phrase of NOTICE_PACK_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(
        all,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden phrase found: ${phrase}`,
      );
    }
    assert.match(all, /입력하지 마세요|입력 금지/);
    assert.match(all, /확정하지 않습니다|확정하지 않음/);
    assert.match(all, /allowlist|verified planner/);
  });

  it("pack verdicts conditional send not ready", () => {
    assert.equal(PR153_PACK_VERDICTS.noticePackPrepared, "conditional_ready");
    assert.equal(PR153_PACK_VERDICTS.externalSend, "not_ready");
    assert.equal(PR153_OPEN_CRITICAL_COUNT, 0);
  });

  it("scope forbids send and pii in templates", () => {
    assert.match(PR153_SCOPE_NOTICE, /발송/);
    assert.match(PR153_SCOPE_NOTICE, /allowlist|beta user/);
  });

  it("operating checklist links PR153 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-153-BETA-USER-NOTICE-PACK-OPS/);
  });

  it("PR140 deferred roadmap marks PR153 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR153-A 완료/);
  });
});
