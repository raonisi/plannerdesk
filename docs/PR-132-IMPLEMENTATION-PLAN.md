# PR-132 — 구현 계획 (실행)

## 진입

- PR130 roadmap PR132 순위 3 · PR127 선행 ✓
- PR131 `/search` 진입 ✓
- visibility guard 미변경

## 수정 파일

- `lib/search/*` (public, types, labels, constants, work-links-search, search-href, ranking)
- `app/search/*`, `components/search/search-empty-panel.tsx`
- `docs/PR-132-*`, `tests/ops/pr132-advanced-search.test.ts`
- `tests/ops/pr127-search-ux.test.ts` (action label)

## 미수정

- `prisma/schema`, auth, `lib/public/*` guards, `package.json`

## 검증

lint, typecheck, test, build, pr132 static test
