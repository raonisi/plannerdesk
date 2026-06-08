# PR-170 — Payment Architecture Plan (PR170-A)

**위험도:** Critical · **성격:** 결제 **구조 설계·검토 계획** — PG·checkout·billing·webhook·schema·package 변경 없음

## 목적

PR145·PR165·PR169 기준을 바탕으로 유료화 전 결제 아키텍처, PG 검토, 결제정보 비저장, 권한·구독, AA 유료화 safety, 환불 연결 기준을 문서화한다.

## 범위 (PR170-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-170-ENTRY-CONDITIONS.md](./PR-170-ENTRY-CONDITIONS.md) |
| 구조 | [PR-170-STRUCTURE-ANALYSIS.md](./PR-170-STRUCTURE-ANALYSIS.md) |
| 원칙 | [PR-170-ARCHITECTURE-PRINCIPLES.md](./PR-170-ARCHITECTURE-PRINCIPLES.md) |
| PG | [PR-170-PG-REVIEW-CHECKLIST.md](./PR-170-PG-REVIEW-CHECKLIST.md) |
| 비저장 | [PR-170-PAYMENT-DATA-NON-STORAGE.md](./PR-170-PAYMENT-DATA-NON-STORAGE.md) |
| 권한·구독 | [PR-170-SUBSCRIPTION-RBAC-REVIEW.md](./PR-170-SUBSCRIPTION-RBAC-REVIEW.md) |
| AA 유료 | [PR-170-AA-PAID-CRITERIA.md](./PR-170-AA-PAID-CRITERIA.md) |
| 환불 연결 | [PR-170-FAILURE-REFUND-LINKS.md](./PR-170-FAILURE-REFUND-LINKS.md) |
| No-Go | [PR-170-NO-GO-CRITERIA.md](./PR-170-NO-GO-CRITERIA.md) |
| 후속 | [PR-170-FOLLOW-UP-ROADMAP.md](./PR-170-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-170-CODEX-REVIEW-SCOPE.md](./PR-170-CODEX-REVIEW-SCOPE.md) |
| 계획 | [PR-170-IMPLEMENTATION-PLAN.md](./PR-170-IMPLEMENTATION-PLAN.md) |
| UI | `AdminPaymentArchitecturePlanPanel` |
| 코드 | `lib/ops/payment-architecture-plan.ts` |

## 연계 허브

- [PR-145-PAYMENT-FEASIBILITY-OPS.md](./PR-145-PAYMENT-FEASIBILITY-OPS.md)
- [PR-165-PAYMENT-LEGAL-READINESS-OPS.md](./PR-165-PAYMENT-LEGAL-READINESS-OPS.md)
- [PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md](./PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md)
- [PR-164-AI-SAFETY-HARDENING-OPS.md](./PR-164-AI-SAFETY-HARDENING-OPS.md)

## 테스트

`npx tsx --test tests/ops/pr170-*.test.ts`

## 판단 (PR170-A)

| 구분 | 판단 |
| --- | --- |
| Architecture Plan | **Conditional Ready** |
| 구조 검토 정의 | **Ready** |
| 결제 구현 | **Blocked** |
| 결제정보 저장 | **Blocked** |
| PG·환불·정산 | **검토 필요** |
| Critical(정적) | **0** |

## Codex

**필수** — 결제·권한·개인정보·보안 연계
