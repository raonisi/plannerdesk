# PR-155 — Answer Assistant / Admin 분리

- AI allowlist ≠ admin 권한
- `getVerifiedAnswerAssistantAccess` — planner route gate
- `canAdminTestVerifiedAnswerAssistant` — admin tester 별도 경로
- usage audit: `/admin/answer-assistant/audit` only

코드: `lib/answer-assistant/verified-access.ts`
