# PR-157 — 구조 분석

## SSOT

`lib/ops/beta-launch-decision.ts` — PR150~PR156 verdict import, 종합표, 리스크, 판단, Codex 범위.

## UI

`AdminBetaLaunchDecisionPanel` — admin 전용, read-only 표시. `AdminShell` PR156 다음 배치.

## 테스트

`tests/ops/pr157-beta-launch-decision.test.ts` — hub·진입·판단·panel·checklist·roadmap 정적 검증.

## 영향 없음

- Auth/RBAC · allowlist · schema
- public visibility guard
- Answer Assistant 접근 범위
- package/lockfile
- provider/API · 운영 DB
