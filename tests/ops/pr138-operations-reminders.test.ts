import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ADMIN_OPS_REMINDER_FORBIDDEN_CONTENT,
  AUTOMATION_DEFERRED_ITEMS,
} from "@/lib/admin/operations-reminder-copy";

const ROOT = process.cwd();

const FORBIDDEN_IN_REMINDER = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "nodemailer.send",
  "webhook",
  "cron.schedule",
  "bull.queue",
];

describe("PR138 operations reminders (static, manual only)", () => {
  it("hub documents PR138-B and no automation in PR138-A", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-138-OPERATIONS-REMINDER-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-138-B-NOTIFICATION-AUTOMATION-DESIGN/);
    assert.match(hub, /자동 발송/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("no Notification or Reminder prisma model", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Notification\b/);
    assert.doesNotMatch(schema, /model Reminder\b/);
    assert.doesNotMatch(schema, /model OpsReminder\b/);
  });

  it("reminder panel admin only not public", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminOperationsReminderPanel/);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminOperationsReminderPanel/);
    assert.doesNotMatch(home, /운영 리마인더/);
  });

  it("reminder panel has no send fetch cron or prisma writes", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminOperationsReminderPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /fetch\(/);
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /cron|schedule|webhook|nodemailer|sendMail/i);
    assert.match(panel, /overflow-x-auto/);
    assert.match(panel, /AUTOMATION_DEFERRED_ITEMS/);
  });

  it("copy forbids PII and secret phrasing in reminders", () => {
    const copy = ADMIN_OPS_REMINDER_FORBIDDEN_CONTENT;
    assert.match(copy, /고객정보/);
    assert.match(copy, /secret/);
    assert.doesNotMatch(copy, /고객명을 입력/);
  });

  it("automation deferral list includes email cron notification table", () => {
    const joined = AUTOMATION_DEFERRED_ITEMS.join(" ");
    assert.match(joined, /이메일/);
    assert.match(joined, /cron/);
    assert.match(joined, /notification DB/);
  });

  it("links PR134 PR136 PR137 in reminder rows", () => {
    const lib = readFileSync(
      join(ROOT, "lib/admin/operations-reminder-copy.ts"),
      "utf8",
    );
    assert.match(lib, /PR-134/);
    assert.match(lib, /PR-136/);
    assert.match(lib, /PR-137/);
    assert.match(lib, /PR-129/);
  });

  it("no new notification routes under app", () => {
    const appScan = [
      "app/page.tsx",
      "app/directory/page.tsx",
      "app/planner/answer-assistant/page.tsx",
    ];
    for (const rel of appScan) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of FORBIDDEN_IN_REMINDER) {
        assert.doesNotMatch(src, new RegExp(phrase));
      }
    }
  });

  it("package.json scripts unchanged for scheduler", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.doesNotMatch(pkg, /"cron"/);
    assert.doesNotMatch(pkg, /node-cron/);
  });
});
