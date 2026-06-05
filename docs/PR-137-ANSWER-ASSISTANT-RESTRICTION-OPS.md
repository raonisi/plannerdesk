# PR-137 — Answer Assistant 제한 고도화 (PR137-A)

**위험도:** High · **성격:** 제한 강화·문서화 — **기능·접근 확대 아님**

## 목적

verified planner + allowlist 제한 베타를 유지한 채, 위험 입력 차단·output safety·metadata-only audit·rate limit·retention·rollback 기준을 명확히 한다.

## 범위 (PR137-A)

| 항목 | 문서/코드 |
| --- | --- |
| 허브 | 본 문서 |
| 접근·출력·audit | [PR-137-ACCESS-OUTPUT-AUDIT-STANDARDS.md](./PR-137-ACCESS-OUTPUT-AUDIT-STANDARDS.md) |
| rollback | [PR-137-ROLLBACK-DISABLE.md](./PR-137-ROLLBACK-DISABLE.md) |
| 구조 | [PR-137-STRUCTURE-ANALYSIS.md](./PR-137-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-137-IMPLEMENTATION-PLAN.md](./PR-137-IMPLEMENTATION-PLAN.md) |
| 코드 | `validation.ts`, `output-safety.ts`, `constants.ts`, `rollback-disable.ts` |
| 테스트 | `tests/answer-assistant/*`, `tests/ops/pr137-*.test.ts` |

## 절대 금지 (이번 PR)

- allowlist·Auth·RBAC 변경
- beta/public 확대
- rate limit 완화
- audit 원문 저장
- schema migration

## 연계

- [PR-126-ANSWER-ASSISTANT-BETA-OPS.md](./PR-126-ANSWER-ASSISTANT-BETA-OPS.md)
- [PR-136-ANSWER-ASSISTANT-REPORT.md](./PR-136-ANSWER-ASSISTANT-REPORT.md)

## Codex 제한검수

**권장** — output safety·audit·권한·PII 영향. allowlist/Auth 무변경이어도 High-risk PR 특성상 Antigravity+C restricted review.

## 후속

- [PR-148-AI-LIMITED-BETA-POLICY-OPS.md](./PR-148-AI-LIMITED-BETA-POLICY-OPS.md) — 제한 베타 운영 정책 통합 (**PR148-A 완료**)
