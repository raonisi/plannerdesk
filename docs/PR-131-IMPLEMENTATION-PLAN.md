# PR-131 — 구현 계획 (실행 기록)

## 1. 진입 조건

- PR130 **조건부 가능** — limited UI scope로 진행
- Critical: 레지스트리 미기입(운영 확인) — 코드 변경 없음
- visibility·AA allowlist: Cycle 기준 **충족**

## 2. 반영 항목

- Public 홈 업무 시작·지식·검색·stats·visibility
- Admin 검수 큐 패널 (기존 probe)
- 문서·static tests

## 3. 보류

- OPS severity DB 집계
- Planner 전용 `/planner` hub route
- Draft/needs_review public 카운트

## 4. 별도 PR

- schema·Auth·allowlist·visibility 변경
- 실시간 운영 이슈 API

## 5. 수정 파일

- `app/page.tsx`, `app/home-client.tsx`
- `lib/dashboard/work-hub-copy.ts`
- `components/dashboard/*`
- `lib/admin/dashboard-status.ts`, `components/admin/*`, `app/admin/page.tsx`
- `docs/PR-131-*`, `tests/ops/pr131-dashboard.test.ts`

## 6. 미수정

- `prisma/schema`, auth, `lib/public/*` guards, `package.json`, `.env`

## 7–10. 범위

| | |
| --- | --- |
| public | 홈 허브 UI |
| planner | 홈 AA 안내 + 기존 route |
| admin | ReviewQueuePanel |

## 11–14. 영향

| | |
| --- | --- |
| public visibility | 없음 (기존 fetch만) |
| RBAC/Auth | 없음 |
| DB/Migration | 없음 |
| Answer Assistant | 안내만, gate 미변경 |

## 15. 검증

`npm run lint`, `typecheck`, `test`, `build`, `npx tsx --test tests/ops/pr131-dashboard.test.ts`

## 16. Codex

기본 생략. admin probe가 공개 API로 새면 제한검수.
