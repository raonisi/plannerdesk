# PR-172 구현 계획 (PR172-A)

## 작성

1. `lib/ops/beta-review-summary.ts` — SSOT
2. `AdminBetaReviewSummaryPanel` — admin 전용
3. `docs/PR-172-*` — 허브·하위 문서
4. `tests/ops/pr172-beta-review-summary.test.ts`

## 수정하지 않음

- prisma/schema, migration, package.json, lockfile
- Auth/RBAC, allowlist, visibility guard
- Answer Assistant 접근 범위
- 결제·PG·checkout·billing·webhook
- 약관·개인정보·환불 확정

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/ops/pr172-*.test.ts
npm run build
```

build는 PR105 이후 migrate deploy 없음 전제.

## Codex

**조건부** — PR173 진입 판단·No-Go·Critical/High 분류 검증 시 권장
