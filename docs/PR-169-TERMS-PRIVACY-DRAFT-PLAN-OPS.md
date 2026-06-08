# PR-169 — Terms & Privacy Draft Plan (PR169-A)

**위험도:** Critical · **성격:** 약관·개인정보·고지 **초안 작성 계획** — 확정·결제·PII 수집 구조·schema 변경 없음

## 목적

PR147·PR153·PR162·PR164·PR165·PR168 기준을 바탕으로 공개 베타·유료화 전 필요한 이용약관·개인정보처리방침·데이터·AI·고객지원·환불 관련 초안 범위와 법무 검토 필요 항목을 문서화한다.

## 범위 (PR169-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-169-ENTRY-CONDITIONS.md](./PR-169-ENTRY-CONDITIONS.md) |
| 구조 | [PR-169-STRUCTURE-ANALYSIS.md](./PR-169-STRUCTURE-ANALYSIS.md) |
| 이용약관 | [PR-169-TERMS-OF-SERVICE-DRAFT.md](./PR-169-TERMS-OF-SERVICE-DRAFT.md) |
| 개인정보 | [PR-169-PRIVACY-POLICY-DRAFT.md](./PR-169-PRIVACY-POLICY-DRAFT.md) |
| 데이터 책임 | [PR-169-DATA-RESPONSIBILITY-DRAFT.md](./PR-169-DATA-RESPONSIBILITY-DRAFT.md) |
| AA 고지 | [PR-169-AA-NOTICE-DRAFT.md](./PR-169-AA-NOTICE-DRAFT.md) |
| 고객지원 | [PR-169-SUPPORT-NOTICE-DRAFT.md](./PR-169-SUPPORT-NOTICE-DRAFT.md) |
| 환불 검토 | [PR-169-REFUND-REVIEW.md](./PR-169-REFUND-REVIEW.md) |
| 금지 표현 | [PR-169-FORBIDDEN-EXPRESSIONS.md](./PR-169-FORBIDDEN-EXPRESSIONS.md) |
| 법무 검토 | [PR-169-LEGAL-REVIEW-ITEMS.md](./PR-169-LEGAL-REVIEW-ITEMS.md) |
| No-Go | [PR-169-NO-GO-CRITERIA.md](./PR-169-NO-GO-CRITERIA.md) |
| 후속 | [PR-169-FOLLOW-UP-ROADMAP.md](./PR-169-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-169-CODEX-REVIEW-SCOPE.md](./PR-169-CODEX-REVIEW-SCOPE.md) |
| 계획 | [PR-169-IMPLEMENTATION-PLAN.md](./PR-169-IMPLEMENTATION-PLAN.md) |
| UI | `AdminTermsPrivacyDraftPlanPanel` |
| 코드 | `lib/ops/terms-privacy-draft-plan.ts` |

## 연계 허브

- [PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md](./PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md)
- [PR-153-BETA-USER-NOTICE-PACK-OPS.md](./PR-153-BETA-USER-NOTICE-PACK-OPS.md)
- [PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md](./PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md)
- [PR-164-AI-SAFETY-HARDENING-OPS.md](./PR-164-AI-SAFETY-HARDENING-OPS.md)
- [PR-165-PAYMENT-LEGAL-READINESS-OPS.md](./PR-165-PAYMENT-LEGAL-READINESS-OPS.md)
- [PR-168-DATA-CORRECTION-WORKFLOW-OPS.md](./PR-168-DATA-CORRECTION-WORKFLOW-OPS.md)

## 테스트

`npx tsx --test tests/ops/pr169-*.test.ts`

## 판단 (PR169-A)

| 구분 | 판단 |
| --- | --- |
| Draft Plan | **Conditional Ready** |
| 초안 범위 | **Ready** |
| 약관·개인정보 확정 | **Blocked** |
| 결제 구현 | **Blocked** |
| Critical(정적) | **0** |

## Codex

**필수** — 약관·개인정보·AI·환불·유료화 준비 연계
