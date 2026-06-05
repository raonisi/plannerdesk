# PR-154 — 접근 차단 Smoke

`PUBLIC_ACCESS_BLOCK_SMOKE` 기준.

- `app/admin/layout.tsx` → `getAdminAccess`
- `app/planner/answer-assistant` → `getVerifiedAnswerAssistantAccess`
- `smoke-public-routes.mjs`에 `/admin`·`/planner` 미포함
- `app/answer-assistant` public route 없음

런타임 admin 200 without auth — **test:e2e 부재**, PR155 후보.
