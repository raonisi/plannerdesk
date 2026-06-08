# PR-174 — Implementation Plan

## 범위

1. `lib/ops/terms-legal-review-prep.ts` SSOT
2. `docs/PR-174-TERMS-LEGAL-REVIEW-PREP.md` 허브
3. `AdminTermsLegalReviewPrepPanel` (admin only)
4. `tests/ops/pr174-terms-legal-review-prep.test.ts`

## 비범위

- 이용약관·개인정보·환불·결제 확정
- 결제/PG/checkout 구현
- PII 수집 구조·schema 변경
- 회원가입 확대·beta user 추가
- role/allowlist 변경

## 검증

```bash
npm run lint
npm run typecheck
npm run test
```
