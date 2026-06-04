import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR143_SCOPE_NOTICE,
  USER_NOTICE_FORBIDDEN,
  USER_NOTICE_GOOD,
} from "@/lib/ops/support-incident-playbook";

const ROOT = process.cwd();

describe("PR143 support and incident playbook (static, no CS system)", () => {
  it("hub links PR129 severity and forbids ticket implementation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-129-OPERATIONAL-ISSUES-OPS/);
    assert.match(hub, /PR-129-ISSUE-SEVERITY/);
    assert.match(hub, /문의 폼/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /model Ticket/);
  });

  it("critical doc classifies visibility and auth bypass", () => {
    const critical = readFileSync(
      join(ROOT, "docs/PR-143-CRITICAL-RESPONSE.md"),
      "utf8",
    );
    assert.match(critical, /public 노출/);
    assert.match(critical, /권한 우회/);
    assert.match(critical, /secret/);
    assert.match(critical, /allowlist 우회/);
  });

  it("severity doc references PR129 canonical and forbids downgrade", () => {
    const sev = readFileSync(
      join(ROOT, "docs/PR-143-SEVERITY-AND-RESPONSE.md"),
      "utf8",
    );
    assert.match(sev, /PR-129-ISSUE-SEVERITY/);
    assert.match(sev, /하향 단정 금지/);
    assert.match(sev, /Critical/);
    assert.match(sev, /잘못된 청구/);
  });

  it("report template forbids PII and has no form route", () => {
    const template = readFileSync(
      join(ROOT, "docs/PR-143-REPORT-FORM-TEMPLATE.md"),
      "utf8",
    );
    assert.match(template, /구현하지 않/);
    assert.match(template, /주민번호/);
    const appDir = ["app/page.tsx", "app/home-client.tsx"];
    for (const rel of appDir) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /SupportTicket|IncidentReport|문의 제출/i);
    }
  });

  it("playbook panel admin only not public", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminSupportIncidentPlaybookPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminSupportIncidentPlaybookPanel/);
    assert.doesNotMatch(home, /고객지원·장애 대응 기준/);
  });

  it("panel has no prisma email slack or ticket writes", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminSupportIncidentPlaybookPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /sendEmail|nodemailer|webhook|slack/i);
    assert.doesNotMatch(panel, /createTicket|incident\.create/i);
    assert.match(panel, /문의 폼/);
    assert.match(panel, /overflow-x-auto/);
  });

  it("prisma schema has no Ticket or Incident model", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Ticket\b/);
    assert.doesNotMatch(schema, /model Incident\b/);
  });

  it("scope notice forbids outbound CS tooling", () => {
    assert.match(PR143_SCOPE_NOTICE, /문의 폼/);
    assert.match(PR143_SCOPE_NOTICE, /ticket\/incident DB/);
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.doesNotMatch(pkg, /"@sendgrid/);
    assert.doesNotMatch(pkg, /"bull"/);
  });

  it("user notice good phrases avoid secret and PII solicitation", () => {
    const good = USER_NOTICE_GOOD.join(" ");
    assert.match(good, /개인정보/);
    assert.doesNotMatch(good, /secret/);
    const bad = USER_NOTICE_FORBIDDEN.join(" ");
    assert.match(bad, /secret 노출/);
    assert.match(bad, /주민번호/);
  });

  it("operating checklist links PR143 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS/);
  });
});
