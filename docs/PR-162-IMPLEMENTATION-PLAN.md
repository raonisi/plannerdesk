# PR-162 — 구현 계획

1. PR162 진입 — PR158/159/161 연계, Critical 0, PII 위험 완화
2. Inbox 운영 원칙 · 기록 허용/금지 · 유형·등급 · AA · 데이터 · 흐름 · 안내문
3. SSOT · admin panel · static test · docs
4. `OPERATING_QA_CHECKLIST` · `PR-140-DEFERRED-PR-ROADMAP` · `external-release-readiness` 갱신

## 수정하지 않음

schema · Auth/RBAC · inbox/form/alert · package.json · lockfile · 운영 DB

## 검증

`npm run lint` · `typecheck` · `test` · `build` · `npx tsx --test tests/ops/pr162-*.test.ts`

## Codex

조건부 권장
