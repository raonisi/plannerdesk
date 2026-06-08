# PR-169 — 구현 계획 (PR169-A)

## 완료 범위

1. 진입 조건 (PR165·168·162·164)
2. 약관·개인정보 준비 대상 분석
3. 이용약관·개인정보·고지·환불 초안 계획
4. 금지 표현·법무 검토·No-Go
5. PR170 이후 방향
6. `lib/ops/terms-privacy-draft-plan.ts`
7. `AdminTermsPrivacyDraftPlanPanel`
8. `tests/ops/pr169-terms-privacy-draft-plan.test.ts`
9. docs/PR-169-*

## 수정 파일

- `lib/ops/terms-privacy-draft-plan.ts`
- `components/admin/AdminTermsPrivacyDraftPlanPanel.tsx`
- `components/admin/AdminShell.tsx`
- `lib/ops/payment-legal-readiness.ts` (PR169 연결 met)
- `docs/PR-169-*`
- `docs/OPERATING_QA_CHECKLIST.md`
- `docs/PR-140-DEFERRED-PR-ROADMAP.md`
- `lib/ops/external-release-readiness.ts`

## 수정하지 않음

- prisma/schema · migration
- Auth/RBAC · allowlist · AA 접근
- checkout/billing/subscription routes
- package.json · lockfile
- 약관·개인정보 live 게시·동의 UI

## 영향

| 영역 | PR169-A |
| --- | --- |
| DB/Migration | 없음 |
| Auth/RBAC | 없음 |
| PII 수집 구조 | 추가 없음 |
| Answer Assistant | 고지 문서만 |
| 결제/PG | 없음 |
| package | 없음 |

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/ops/pr169-*.test.ts
npm run build
```

## Codex

**필수**
