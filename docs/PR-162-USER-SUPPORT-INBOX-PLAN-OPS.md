# PR-162 — User Support Inbox Plan (PR162-A)

**위험도:** High · **성격:** 오류 제보 **운영 계획** — 인박스·폼·DB·알림 없음

## 목적

제한 베타 운영 중 오류 제보를 metadata 중심으로 접수·분류·후속 PR 연결하는 User Support Inbox 운영 계획을 문서화한다.

## 범위 (PR162-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-162-ENTRY-CONDITIONS.md](./PR-162-ENTRY-CONDITIONS.md) |
| 운영 원칙 | [PR-162-INBOX-PRINCIPLES.md](./PR-162-INBOX-PRINCIPLES.md) |
| 기록 허용/금지 | [PR-162-RECORD-ALLOW-DENY.md](./PR-162-RECORD-ALLOW-DENY.md) |
| 유형 분류 | [PR-162-REPORT-TYPES.md](./PR-162-REPORT-TYPES.md) |
| 등급별 처리 | [PR-162-GRADE-RESPONSE.md](./PR-162-GRADE-RESPONSE.md) |
| AA 제보 | [PR-162-AA-REPORT-HANDLING.md](./PR-162-AA-REPORT-HANDLING.md) |
| 데이터 오류 | [PR-162-DATA-ERROR-REPORTS.md](./PR-162-DATA-ERROR-REPORTS.md) |
| 처리 흐름 | [PR-162-WORKFLOW.md](./PR-162-WORKFLOW.md) |
| 사용자 안내 | [PR-162-USER-NOTICE.md](./PR-162-USER-NOTICE.md) |
| 후속 PR | [PR-162-FOLLOW-UP-PRS.md](./PR-162-FOLLOW-UP-PRS.md) |
| PR163+ | [PR-162-FOLLOW-UP-ROADMAP.md](./PR-162-FOLLOW-UP-ROADMAP.md) |
| Checklist | [PR-162-INBOX-CHECKLIST.md](./PR-162-INBOX-CHECKLIST.md) |
| Codex | [PR-162-CODEX-REVIEW-SCOPE.md](./PR-162-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-162-STRUCTURE-ANALYSIS.md](./PR-162-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-162-IMPLEMENTATION-PLAN.md](./PR-162-IMPLEMENTATION-PLAN.md) |
| UI | `AdminUserSupportInboxPlanPanel` |
| 코드 | `lib/ops/user-support-inbox-plan.ts` |

## 테스트

`npx tsx --test tests/ops/pr162-*.test.ts`

**인박스·폼·DB·알림·발송 없음** · metadata-only · `test:e2e` · `test:smoke` **명령 부재**

## 연계

PR161 · PR158 · PR159 · PR153 · PR143

## 판단 (PR162-A)

| 구분 | 판단 |
| --- | --- |
| Inbox Plan | **Conditional Ready** |
| Inbox UI 구현 | **Not Ready** |
| 비식별화 안전성 | **Ready** |
| Critical(정적) | **0** |

## Codex

**조건부 권장**
