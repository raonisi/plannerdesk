# PR-139 — Route 접근 권한 매트릭스

| route | public | planner | content_admin | super_admin | 서버 guard |
| --- | --- | --- | --- | --- | --- |
| `/` | 허용 | 허용 | 허용 | 허용 | public data only |
| `/directory` 등 공개 라우트 | 허용 | 허용 | 허용 | 허용 | `getPublic*` |
| `/search` | 허용 | 허용 | 허용 | 허용 | `lib/search/public.ts` |
| `/planner/*` | 금지 | 조건부 | 허용 | 허용 | session |
| `/planner/answer-assistant` | 금지 | verified+allowlist | shell/테스트 | shell/테스트 | `getVerifiedAnswerAssistantAccess` |
| `/admin` | 금지 | 금지 | 허용 | 허용 | `app/admin/layout.tsx` → `getAdminAccess` |
| `/admin/insurers` 등 | 금지 | 금지 | 허용 | 허용 | `requireContentManagerAccess` on actions |
| `/admin/search` | 금지 | 금지 | 허용 | 허용 | admin search only |
| `/admin/answer-assistant/*` | 금지 | 금지 | 허용 | 허용 | admin + env (allowlist 변경 별도 PR) |

## 별도 route 없음

- **관리자 리포트·운영 리마인더:** `/admin` 내 패널 (`AdminOperationsReportPanel`, `AdminOperationsReminderPanel`)
- **`/admin/reports` · `/admin/reminders`:** **없음** — 문서상 “제한 허용”은 `/admin` 동일

## UI 숨김 금지

public `home-client`에 admin 컴포넌트가 **import·렌더되지 않음** (PR131·PR139 정적 테스트).
