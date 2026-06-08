# PR-157 — Beta Launch Decision (PR157-A)

**위험도:** Critical · **성격:** 제한 베타 **실행 여부 판단** — 실제 배포·외부 공개·beta user·role·allowlist·운영 DB·provider 호출 **없음**

## 목적

PR140~PR156 결과를 종합하여 제한 베타의 **Launch / Conditional Launch / Hold / No-Go**를 판단한다. 실제 실행은 포함하지 않는다.

## 범위 (PR157-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 조건 | [PR-157-ENTRY-CONDITIONS.md](./PR-157-ENTRY-CONDITIONS.md) |
| PR140~156 종합 | [PR-157-PR140-156-SYNTHESIS.md](./PR-157-PR140-156-SYNTHESIS.md) |
| 판단 기준 | [PR-157-LAUNCH-CRITERIA.md](./PR-157-LAUNCH-CRITERIA.md) |
| 기능 실행/보류 | [PR-157-FEATURE-LAUNCH-FINAL.md](./PR-157-FEATURE-LAUNCH-FINAL.md) |
| 리스크 등급 | [PR-157-RISK-REGISTER.md](./PR-157-RISK-REGISTER.md) |
| 실행 전 필수 | [PR-157-PRE-LAUNCH-REQUIRED.md](./PR-157-PRE-LAUNCH-REQUIRED.md) |
| 즉시 중단 | [PR-157-IN-FLIGHT-HALT.md](./PR-157-IN-FLIGHT-HALT.md) |
| 운영 조건 | [PR-157-OPS-CONDITIONS.md](./PR-157-OPS-CONDITIONS.md) |
| PR158+ | [PR-157-FOLLOW-UP-ROADMAP.md](./PR-157-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-157-CODEX-REVIEW-SCOPE.md](./PR-157-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-157-STRUCTURE-ANALYSIS.md](./PR-157-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-157-IMPLEMENTATION-PLAN.md](./PR-157-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaLaunchDecisionPanel` |
| 코드 | `lib/ops/beta-launch-decision.ts` |

## 테스트

| 파일 | 실행 |
| --- | --- |
| `tests/ops/pr157-beta-launch-decision.test.ts` | `npx tsx --test tests/ops/pr157-*.test.ts` |
| 연계 | `pr154` · `pr155` · `pr156` ops tests |

**실제 배포·beta user·allowlist·운영 DB·provider 호출 없음** · `npm run test:e2e` · `npm run test:smoke` **명령 부재**

## 비범위

- package/lockfile · 신규 의존성
- Auth/RBAC·allowlist·schema 변경
- 결제·회원가입 확대·외부 발송
- 실제 외부 공개 실행

## 연계

| PR | 문서 |
| --- | --- |
| PR150 | [PR-150-EXTERNAL-RELEASE-DECISION-OPS.md](./PR-150-EXTERNAL-RELEASE-DECISION-OPS.md) |
| PR154 | [PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md](./PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md) |
| PR155 | [PR-155-ADMIN-ACCESS-REGRESSION-OPS.md](./PR-155-ADMIN-ACCESS-REGRESSION-OPS.md) |
| PR156 | [PR-156-ANSWER-ASSISTANT-RED-TEAM-OPS.md](./PR-156-ANSWER-ASSISTANT-RED-TEAM-OPS.md) |

## 판단 (PR157-A)

| 구분 | 판단 |
| --- | --- |
| 제한 베타 실행 가능성 | **Conditional Launch** |
| Codex 제한검수 전 | **Conditional Launch 이하** (Launch 금지) |
| PR157 시점 즉시 실행 | **Hold** |
| 공개 베타 / 유료 베타 / 정식 유료화 | **No-Go** |

Critical(정적) **0** · High **7** (운영·법무·런타임 gap·AA classifier 등)

## Codex

**원칙적 필수** — PR140~PR156 종합·Launch 판단·Critical/High 분류
