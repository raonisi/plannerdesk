# PR-161 — 구현 계획

1. PR161 진입 조건 확인 — PR160/158/159 연계, Critical 0
2. 데이터 최신성 점검 대상 분석 — `lib/public/*`, visibility helper
3. 공식 출처 우선순위 · 도메인별 점검표 · 오류 등급 · public 보류
4. 후속 PR 연결 · Checklist · PR162+ 로드맵
5. SSOT `data-freshness-review.ts` · admin panel · static test · docs
6. `OPERATING_QA_CHECKLIST` · `PR-140-DEFERRED-PR-ROADMAP` · `external-release-readiness` 갱신

## 수정하지 않음

`prisma/schema.prisma` · Auth/RBAC · public visibility guard · package.json · lockfile · 운영 데이터

## 검증

`npm run lint` · `typecheck` · `test` · `build`(migrate deploy 없음) · `npx tsx --test tests/ops/pr161-*.test.ts`

## Codex

조건부 권장 — 청구·보험사·visibility 기준 불명확 시 제한검수
