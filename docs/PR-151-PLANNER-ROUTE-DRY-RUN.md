# PR-151 — Planner Route Dry Run

`PLANNER_ROUTE_DRY_RUN` 기준.

- `/planner/answer-assistant`: auth + `verified-access.ts` gate
- public 미인증: locked
- 일반 planner: shell/안내, 생성 기본 차단
- admin·운영 데이터: planner route 미노출
- PII 입력 유도 없음 (PR148)
