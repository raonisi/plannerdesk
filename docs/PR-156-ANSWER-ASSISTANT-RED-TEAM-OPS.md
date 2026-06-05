# PR-156 — Answer Assistant Red-Team Test (PR156-A)

**위험도:** Critical · **성격:** AI safety **red-team** — provider 호출·접근 확대 없음

## 목적

PR155 이후 Answer Assistant의 접근 제한·입력 차단·output safety·audit metadata-only·rate limit·retention을 **mock/fixture red-team**으로 보강한다.

## 범위 (PR156-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 접근 | [PR-156-ACCESS-RED-TEAM.md](./PR-156-ACCESS-RED-TEAM.md) |
| PII 입력 | [PR-156-PRIVACY-INPUT-RED-TEAM.md](./PR-156-PRIVACY-INPUT-RED-TEAM.md) |
| 청구 판단 | [PR-156-CLAIM-RED-TEAM.md](./PR-156-CLAIM-RED-TEAM.md) |
| 가입/공포 | [PR-156-SALES-FEAR-RED-TEAM.md](./PR-156-SALES-FEAR-RED-TEAM.md) |
| 전문 판단 | [PR-156-PROFESSIONAL-RED-TEAM.md](./PR-156-PROFESSIONAL-RED-TEAM.md) |
| injection | [PR-156-PROMPT-SECRET-RED-TEAM.md](./PR-156-PROMPT-SECRET-RED-TEAM.md) |
| output | [PR-156-OUTPUT-SAFETY-RED-TEAM.md](./PR-156-OUTPUT-SAFETY-RED-TEAM.md) |
| audit | [PR-156-AUDIT-RETENTION-RED-TEAM.md](./PR-156-AUDIT-RETENTION-RED-TEAM.md) |
| disable | [PR-156-DISABLE-ROLLBACK-RED-TEAM.md](./PR-156-DISABLE-ROLLBACK-RED-TEAM.md) |
| provider | [PR-156-PROVIDER-DEFERRED.md](./PR-156-PROVIDER-DEFERRED.md) |
| PR157+ | [PR-156-FOLLOW-UP-ROADMAP.md](./PR-156-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-156-CODEX-REVIEW-SCOPE.md](./PR-156-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-156-STRUCTURE-ANALYSIS.md](./PR-156-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-156-IMPLEMENTATION-PLAN.md](./PR-156-IMPLEMENTATION-PLAN.md) |
| UI | `AdminAnswerAssistantRedTeamPanel` |
| 코드 | `lib/ops/answer-assistant-red-team.ts` |

## 테스트

| 파일 | 실행 |
| --- | --- |
| `tests/answer-assistant/red-team.test.ts` | `npx tsx --test tests/answer-assistant/red-team.test.ts` |
| `tests/ops/pr156-answer-assistant-red-team.test.ts` | `npx tsx --test tests/ops/pr156-*.test.ts` |
| 기존 | `safety-gate`, `output-safety`, `durable-rate-limit-audit` |

**provider/API 호출 없음** · `npm run test:e2e` **명령 부재**

## 비범위

- package/lockfile · 신규 의존성
- allowlist·role·schema 변경
- 실제 고객정보 fixture

## 연계

| PR | 문서 |
| --- | --- |
| PR155 | [PR-155-ADMIN-ACCESS-REGRESSION-OPS.md](./PR-155-ADMIN-ACCESS-REGRESSION-OPS.md) |
| PR148 | [PR-148-AI-LIMITED-BETA-POLICY-OPS.md](./PR-148-AI-LIMITED-BETA-POLICY-OPS.md) |
| PR153 | [PR-153-BETA-USER-NOTICE-PACK-OPS.md](./PR-153-BETA-USER-NOTICE-PACK-OPS.md) |

**실제 provider 호출·접근 확대 없음.**

## 판단 (PR156-A)

| 구분 | 판단 |
| --- | --- |
| Red-team (정적/mock) | **Conditional Ready** |
| PR157 진입 | **Conditional Ready** |
| live provider red-team | **보류** |
| secret 문자열 classifier | **Partial** (PR148-C 후보) |

Critical(정적) 0

## Codex

**원칙적 권장** — AA safety red-team
