import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  AA_REPORT_HANDLING,
  INBOX_PLAN_CHECKLIST,
  PR162_ENTRY_CONDITIONS,
  PR162_INBOX_VERDICTS,
  PR162_OPEN_CRITICAL_COUNT,
  PR162_SCOPE_NOTICE,
  PR162_TEST_FILES,
  REPORT_TYPE_CLASSIFICATION,
  USER_REPORT_NOTICE,
} from "@/lib/ops/user-support-inbox-plan";

const ROOT = process.cwd();

describe("PR162 user support inbox plan (static, no inbox or DB)", () => {
  it("hub forbids inbox db and links PR158 PR161", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-158|PR158/);
    assert.match(hub, /PR-161|PR161/);
    assert.match(hub, /Inbox|제보/);
    assert.match(hub, /인박스|DB|metadata|알림 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions all met for PR162 doc phase", () => {
    const unmet = PR162_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("inbox panel admin only no prisma webhook or send", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminUserSupportInboxPlanPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminUserSupportInboxPlanPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminUserSupportInboxPlanPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|webhook|slack|sendMail|nodemailer/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("verdicts conditional ready inbox implementation not ready", () => {
    assert.equal(PR162_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR162_INBOX_VERDICTS.inboxPlanPrepared, "conditional");
    assert.equal(PR162_INBOX_VERDICTS.inboxImplementation, "not_ready");
    assert.equal(PR162_INBOX_VERDICTS.deidentificationSafety, "ready");
  });

  it("classification marks visibility admin aa and secret as critical", () => {
    const crit = REPORT_TYPE_CLASSIFICATION.filter(
      (r) => r.defaultGrade === "critical",
    );
    assert.ok(crit.some((r) => r.type.includes("visibility")));
    assert.ok(crit.some((r) => r.type.includes("admin")));
    assert.ok(crit.some((r) => r.type.includes("Answer Assistant")));
  });

  it("aa handling forbids raw prompt response storage", () => {
    const text = AA_REPORT_HANDLING.map((r) => r.recordMethod).join(" ");
    assert.match(text, /원문 없음|유형/);
    assert.doesNotMatch(text, /prompt 원문|response 원문 저장/i);
  });

  it("checklist forbids inbox alert db and raw storage", () => {
    const ids = INBOX_PLAN_CHECKLIST.map((c) => c.id);
    assert.ok(ids.includes("noinbox"));
    assert.ok(ids.includes("noalert"));
    assert.ok(ids.includes("nodb"));
    assert.ok(ids.includes("noraw"));
    assert.ok(ids.includes("nofile"));
    const met = INBOX_PLAN_CHECKLIST.filter((c) => c.status === "met").length;
    assert.ok(met >= 14);
  });

  it("user notice excludes pii and payout disclaimer", () => {
    const exclude = USER_REPORT_NOTICE.excludeItems.join(" ");
    assert.match(exclude, /고객명|주민번호|연락처/);
    const footer = USER_REPORT_NOTICE.footer.join(" ");
    assert.match(footer, /공식 출처|지급/);
  });

  it("scope forbids inbox form db and alerts", () => {
    assert.match(PR162_SCOPE_NOTICE, /Inbox|제보/);
    assert.match(PR162_SCOPE_NOTICE, /인박스|DB|Slack|카카오/);
  });

  it("test files exist", () => {
    for (const rel of PR162_TEST_FILES) {
      readFileSync(join(ROOT, rel), "utf8");
    }
  });

  it("operating checklist links PR162 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-162-USER-SUPPORT-INBOX-PLAN-OPS/);
  });

  it("PR140 deferred roadmap marks PR162 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR162-A 완료/);
  });

  it("usage log forbids prompt draft fields", () => {
    const usageLog = readFileSync(
      join(ROOT, "lib/answer-assistant/usage-log.ts"),
      "utf8",
    );
    assert.match(usageLog, /Does NOT store request text|draft text/);
  });

  it("build script does not run migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
  });
});
