# PR-164 — AI Safety Hardening (PR164-A)

**위험도:** Critical · **성격:** Answer Assistant **output/input safety rule 보강** — 접근 확대·provider·원문 저장·DB/schema 변경 없음

## 목적

PR156 red-team, PR158 feedback, PR159 incident, PR162 support 기준을 반영해 Answer Assistant의 출력 안전성·입력 차단·usage audit metadata-only·disable 기준을 강화한다. 기능 확대 PR이 아니다.

## 범위 (PR164-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-164-ENTRY-CONDITIONS.md](./PR-164-ENTRY-CONDITIONS.md) |
| 구조 | [PR-164-STRUCTURE-ANALYSIS.md](./PR-164-STRUCTURE-ANALYSIS.md) |
| 보강 대상 | [PR-164-SAFETY-HARDENING-TARGETS.md](./PR-164-SAFETY-HARDENING-TARGETS.md) |
| 입출력 차단 | [PR-164-INPUT-OUTPUT-BLOCK-CRITERIA.md](./PR-164-INPUT-OUTPUT-BLOCK-CRITERIA.md) |
| Audit | [PR-164-USAGE-AUDIT-SAFETY.md](./PR-164-USAGE-AUDIT-SAFETY.md) |
| Disable | [PR-164-DISABLE-ROLLBACK.md](./PR-164-DISABLE-ROLLBACK.md) |
| Checklist | [PR-164-SAFETY-CHECKLIST.md](./PR-164-SAFETY-CHECKLIST.md) |
| Codex | [PR-164-CODEX-REVIEW-SCOPE.md](./PR-164-CODEX-REVIEW-SCOPE.md) |
| 계획 | [PR-164-IMPLEMENTATION-PLAN.md](./PR-164-IMPLEMENTATION-PLAN.md) |
| UI | `AdminAiSafetyHardeningPanel` |
| 코드 | `lib/ops/ai-safety-hardening.ts` · `lib/answer-assistant/output-safety.ts` · `validation.ts` |

## 테스트

`npx tsx --test tests/ops/pr164-*.test.ts tests/answer-assistant/pr164-*.test.ts`

**접근 guard·DB·schema·package·provider 호출 변경 없음** · `test:e2e` · `test:smoke` **명령 부재**

## 판단 (PR164-A)

| 구분 | 판단 |
| --- | --- |
| Safety Hardening | **Conditional Ready** |
| Output safety rules | **Ready** |
| Audit metadata-only | **Ready** |
| Access guard integrity | **Ready** |
| Critical(정적) | **0** |

## Codex

**필수(조건부)** — output safety 핵심 rule·PII·지급 확정·prompt injection·secret 차단 변경
