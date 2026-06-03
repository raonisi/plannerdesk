import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ANSWER_ASSISTANT_ROOT = join(process.cwd(), "app/admin/answer-assistant");
const PANEL_SOURCE = readFileSync(
  join(process.cwd(), "components/answer-assistant/answer-assistant-panel.tsx"),
  "utf8",
);
const PAGE_SOURCE = readFileSync(join(ANSWER_ASSISTANT_ROOT, "page.tsx"), "utf8");
const ACTIONS_SOURCE = readFileSync(join(ANSWER_ASSISTANT_ROOT, "actions.ts"), "utf8");
const GENERATE_SOURCE = readFileSync(
  join(process.cwd(), "lib/answer-assistant/generate-draft.ts"),
  "utf8",
);

describe("Answer Assistant auth guard wiring", () => {
  it("page uses getAdminAccess guard", () => {
    assert.match(PAGE_SOURCE, /getAdminAccess/);
    assert.match(PAGE_SOURCE, /AdminLockedState/);
    assert.match(PAGE_SOURCE, /AdminAccessDeniedState/);
  });

  it("server action uses requireAdminAccess", () => {
    assert.match(ACTIONS_SOURCE, /requireAdminAccess/);
    assert.match(ACTIONS_SOURCE, /관리자 권한이 필요합니다/);
  });

  it("draft generation validates input before retrieval", () => {
    assert.match(GENERATE_SOURCE, /validateAnswerAssistantInput/);
    const validateIndex = GENERATE_SOURCE.indexOf("validateAnswerAssistantInput");
    const retrievalIndex = GENERATE_SOURCE.indexOf("retrieveAnswerCandidates");
    assert.ok(validateIndex >= 0 && retrievalIndex > validateIndex);
  });
});

describe("Answer Assistant forbidden auto-actions in UI", () => {
  const forbiddenUiPatterns = [
    /고객에게\s*보내/i,
    /카카오/i,
    /이메일\s*발송/i,
    /자동\s*게시/i,
    /자동\s*댓글/i,
    /파일\s*첨부/i,
    /upload/i,
    /OCR/i,
    /type=["']file["']/i,
  ];

  for (const pattern of forbiddenUiPatterns) {
    it(`panel does not expose UI matching ${pattern}`, () => {
      assert.doesNotMatch(PANEL_SOURCE, pattern);
    });
  }

  it("panel exposes draft generation and result labels", () => {
    assert.match(PANEL_SOURCE, /업무 참고용 초안 생성|관리자 검수용 초안 생성/);
    assert.match(PANEL_SOURCE, /VERIFIED_ANSWER_ASSIST_PAGE_NOTICES|ANSWER_ASSIST_PAGE_NOTICES/);
    assert.match(PAGE_SOURCE, /관리자 검수/);
  });
});

describe("Answer Assistant route absence checks", () => {
  it("has admin-only route and no public chatbot route in app tree listing", () => {
    const appRoutes = [
      "app/admin/answer-assistant/page.tsx",
      "app/planner/answer-assistant/page.tsx",
    ];
    for (const route of appRoutes) {
      assert.doesNotThrow(() => readFileSync(join(process.cwd(), route), "utf8"));
    }
  });

  it("planner route is not a public chatbot path", () => {
    const plannerPage = readFileSync(
      join(process.cwd(), "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(plannerPage, /robots:\s*\{[\s\S]*index:\s*false/);
    assert.doesNotMatch(plannerPage, /public chatbot/i);
  });
});
