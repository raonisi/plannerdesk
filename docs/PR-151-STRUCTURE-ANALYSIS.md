# PR-151 — 구조 분석

## SSOT

`lib/ops/external-beta-dry-run.ts` — 진입 조건, 역할 시나리오, route/AA/데이터/지원/build matrices, checklist, verdicts.

## UI

`AdminExternalBetaDryRunPanel` — `AdminShell` 내 PR150 패널 다음, 읽기 전용.

## 테스트

`tests/ops/pr151-external-beta-dry-run.test.ts` — 정적 검증, DB·allowlist·role 변경 없음.

## 영향 없음

Auth/RBAC, Prisma schema, visibility guard, AA 접근 로직, package.json.
