import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { CORRECTION_SUBMIT_COPY } from "@/lib/correction-request/constants";
import { CORRECTION_FORBIDDEN_UI_PHRASES } from "@/lib/correction-request/pii-guard";
import { USER_REPORT_NOTICE } from "@/lib/ops/user-support-inbox-plan";

const ROOT = process.cwd();

describe("PR-BS-05 correction flow copy (static)", () => {
  it("dialog includes required PII and review notices", () => {
    assert.match(CORRECTION_SUBMIT_COPY.sensitiveWarningBody, /주민번호/);
    assert.match(CORRECTION_SUBMIT_COPY.sensitiveWarningBody, /상담 원문/);
    assert.match(CORRECTION_SUBMIT_COPY.officialSourceReminder, /공식 출처/);
    assert.match(CORRECTION_SUBMIT_COPY.reviewNoticeBody, /관리자/);
    assert.match(CORRECTION_SUBMIT_COPY.reviewNoticeBody, /청구 가능/);
    assert.match(CORRECTION_SUBMIT_COPY.piiBlockedMessage, /개인정보/);
  });

  it("forbids payout and PII solicitation copy in correction UI", () => {
    const dialog = readFileSync(
      join(ROOT, "components/directory/correction-request-dialog.tsx"),
      "utf8",
    );
    const constants = readFileSync(
      join(ROOT, "lib/correction-request/constants.ts"),
      "utf8",
    );
    for (const phrase of CORRECTION_FORBIDDEN_UI_PHRASES) {
      assert.doesNotMatch(dialog, new RegExp(phrase));
      assert.doesNotMatch(constants, new RegExp(phrase));
    }
    assert.doesNotMatch(dialog, /첨부해 주세요|붙여넣어 주세요/);
  });

  it("public error report notice excludes PII categories", () => {
    assert.ok(USER_REPORT_NOTICE.excludeItems.some((item) => item.includes("주민")));
    assert.ok(USER_REPORT_NOTICE.excludeItems.some((item) => item.includes("상담")));
    assert.ok(
      USER_REPORT_NOTICE.includeItems.some((item) => item.includes("공식 출처")),
    );
    assert.match(USER_REPORT_NOTICE.footer.join(" "), /보험금 지급/);
  });

  it("correction submit action blocks forbidden form fields", () => {
    const actions = readFileSync(
      join(ROOT, "app/correction-requests/actions.ts"),
      "utf8",
    );
    assert.match(actions, /FORBIDDEN_FORM_FIELD_NAMES/);
    assert.match(actions, /customerName/);
    assert.match(actions, /policyNumber/);
    assert.doesNotMatch(actions, /console\.log\(.*message/i);
  });

  it("admin correction views are not linked from public home", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /\/admin\/corrections/);
  });
});
