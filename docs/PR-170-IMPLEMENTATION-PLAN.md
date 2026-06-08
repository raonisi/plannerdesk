# PR-170 — 구현 계획 (PR170-A)

## 완료 범위

1. 진입 조건 (PR165·PR169)
2. 결제 구조 대상 분석
3. 10 architecture 원칙
4. PG·비저장·권한·AA·환불 연결·No-Go
5. `lib/ops/payment-architecture-plan.ts`
6. `AdminPaymentArchitecturePlanPanel`
7. `tests/ops/pr170-payment-architecture-plan.test.ts`
8. docs/PR-170-*

## 수정하지 않음

- prisma/schema · migration · package.json
- checkout/billing/subscription/webhook routes
- Auth/RBAC · allowlist · AA 접근
- PG SDK · 결제 버튼 · 가격표

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/ops/pr170-*.test.ts
npm run build
```

## Codex

**필수**
