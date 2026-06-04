# PR-146 — Beta Access Request Flow (PR146-A)

**위험도:** High~Critical · **성격:** 신청 흐름 **설계만** — 폼·DB·승인·초대 발송 없음

## 목적

[PR-141](./PR-141-LIMITED-BETA-OPS.md) 제한 베타 이후, **신청 → 수동 검토 → 승인/보류/거절 → 접근 전 확인 → 운영 → 해제** 흐름을 안전하게 정의한다.

## 범위 (PR146-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 흐름 | [PR-146-REQUEST-FLOW.md](./PR-146-REQUEST-FLOW.md) |
| 상태값 | [PR-146-REQUEST-STATUS.md](./PR-146-REQUEST-STATUS.md) |
| 검토 기준 | [PR-146-APPLICANT-REVIEW.md](./PR-146-APPLICANT-REVIEW.md) |
| PII 금지 | [PR-146-PII-INTAKE-RULES.md](./PR-146-PII-INTAKE-RULES.md) |
| 접근 분리 | [PR-146-ACCESS-SCOPE-SPLIT.md](./PR-146-ACCESS-SCOPE-SPLIT.md) |
| 안내 문구 | [PR-146-BETA-USER-NOTICE.md](./PR-146-BETA-USER-NOTICE.md) |
| 승인·해제 | [PR-146-APPROVAL-REVOCATION.md](./PR-146-APPROVAL-REVOCATION.md) |
| 체크리스트 | [PR-146-BETA-ACCESS-READINESS.md](./PR-146-BETA-ACCESS-READINESS.md) |
| 구조 | [PR-146-STRUCTURE-ANALYSIS.md](./PR-146-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-146-IMPLEMENTATION-PLAN.md](./PR-146-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaAccessRequestFlowPanel` |
| 코드 | `lib/ops/beta-access-request-flow.ts` |

## 비범위

- 신청 폼 · `BetaRequest`/waitlist table · migration
- 자동 승인 · 대량 초대 · 이메일/SMS/webhook
- allowlist·role 실제 변경 · 외부 공개 실행

## 원칙

- 소수 검증 설계사 · **운영자 수동 검토**
- **베타 접근 ≠ Answer Assistant** (verified + allowlist 별도)

## Codex

개인정보·권한·allowlist·신청 폼·AA — **제한검수 권장(필수에 가깝)**.
