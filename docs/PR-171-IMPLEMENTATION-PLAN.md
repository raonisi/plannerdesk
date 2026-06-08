# PR-171 — 구현 계획 (PR171-A)

## 완료 범위

1. 진입 조건 · 대상 분석
2. 10 policy 원칙
3. 환불 12 · 고객지원 11 · 기록 10 · 장애 9 · AA 9
4. 금지 표현 · No-Go 11
5. `lib/ops/refund-support-policy-plan.ts`
6. `AdminRefundSupportPolicyPlanPanel`
7. `tests/ops/pr171-refund-support-policy-plan.test.ts`

## 수정하지 않음

- 환불·결제·PG·webhook·인박스·알림
- prisma/schema · package.json
- Auth/RBAC · AA 접근

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/ops/pr171-*.test.ts
npm run build
```

## Codex

**필수**
