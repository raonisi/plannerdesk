# PR-155 — 구현 계획 (PR155-A)

1. 진입: PR154 Conditional Ready, PR149 admin Critical 0
2. SSOT + admin panel + regression tests
3. 문서 11건
4. 검증: lint, typecheck, test, build
5. 런타임 E2E 보류

수정: `lib/ops/`, `tests/admin/`, `tests/ops/`, `components/admin/`, `docs/`

미수정: `lib/auth/rbac.ts` guard 로직, Prisma, package.json
