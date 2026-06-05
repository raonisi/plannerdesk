# PR-148 — AI Limited Beta Policy (PR148-A)

**위험도:** Critical · **성격:** Answer Assistant 제한 베타 **운영 정책** — 접근·allowlist·로직 확대 없음

## 목적

외부 제한 베타 전, Answer Assistant의 **접근·금지 입력/출력·output safety·metadata-only audit·rate limit·retention·중단** 기준을 정리한다.

## 범위 (PR148-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 운영 범위 | [PR-148-LIMITED-BETA-SCOPE.md](./PR-148-LIMITED-BETA-SCOPE.md) |
| 금지 입력 | [PR-148-FORBIDDEN-INPUT.md](./PR-148-FORBIDDEN-INPUT.md) |
| 금지 출력 | [PR-148-FORBIDDEN-OUTPUT.md](./PR-148-FORBIDDEN-OUTPUT.md) |
| output safety | [PR-148-OUTPUT-SAFETY-CHECKLIST.md](./PR-148-OUTPUT-SAFETY-CHECKLIST.md) |
| usage audit | [PR-148-USAGE-AUDIT-POLICY.md](./PR-148-USAGE-AUDIT-POLICY.md) |
| rate/retention | [PR-148-RATE-LIMIT-RETENTION.md](./PR-148-RATE-LIMIT-RETENTION.md) |
| disable | [PR-148-DISABLE-ROLLBACK.md](./PR-148-DISABLE-ROLLBACK.md) |
| 운영자 검토 | [PR-148-OPERATOR-REVIEW.md](./PR-148-OPERATOR-REVIEW.md) |
| 사용자 안내 | [PR-148-USER-NOTICE.md](./PR-148-USER-NOTICE.md) |
| 체크리스트 | [PR-148-AI-LIMITED-BETA-CHECKLIST.md](./PR-148-AI-LIMITED-BETA-CHECKLIST.md) |
| 구조 | [PR-148-STRUCTURE-ANALYSIS.md](./PR-148-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-148-IMPLEMENTATION-PLAN.md](./PR-148-IMPLEMENTATION-PLAN.md) |
| UI | `AdminAiLimitedBetaPolicyPanel` |
| 코드 | `lib/ops/ai-limited-beta-policy.ts` |

## 비범위

- 접근 확대 · allowlist·role 실변경
- output safety·rate limit·audit schema 약화/변경
- provider·API key·prompt 로직 변경
- migration · 결제 연동

## 원칙

- **verified planner + allowlist** 유지
- **베타 접근 ≠ Answer Assistant** ([PR-146](./PR-146-ACCESS-SCOPE-SPLIT.md))
- usage audit **metadata-only** ([PR-137](./PR-137-ACCESS-OUTPUT-AUDIT-STANDARDS.md))

## 판단

**Conditional Go** — 정책·체크리스트 반영; 입력 강화·allowlist UI·최종 공개는 후속 PR

## Codex

**제한검수 권장(필수에 가깝)** — PII·권한·output safety·audit
