# PR-160 — Beta Expansion Decision (PR160-A)

**위험도:** Critical · **성격:** 베타 **확대 여부 판단** — beta user·초대·role·DB·provider 없음

## 목적

PR157~PR159 결과를 종합하여 Expansion / Conditional Expansion / Maintain / Reduce / Stop을 판단한다.

## 범위 (PR160-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-160-ENTRY-CONDITIONS.md](./PR-160-ENTRY-CONDITIONS.md) |
| PR157~159 | [PR-160-PR157-159-SYNTHESIS.md](./PR-160-PR157-159-SYNTHESIS.md) |
| 판단 기준 | [PR-160-EXPANSION-CRITERIA.md](./PR-160-EXPANSION-CRITERIA.md) |
| 기능 확대/보류 | [PR-160-FEATURE-EXPANSION.md](./PR-160-FEATURE-EXPANSION.md) |
| 확대 전 필수 | [PR-160-PRE-EXPANSION-REQUIRED.md](./PR-160-PRE-EXPANSION-REQUIRED.md) |
| 축소·중단 | [PR-160-REDUCE-HALT.md](./PR-160-REDUCE-HALT.md) |
| 확대 대상 | [PR-160-COHORT-CRITERIA.md](./PR-160-COHORT-CRITERIA.md) |
| 리스크 | [PR-160-RISK-REGISTER.md](./PR-160-RISK-REGISTER.md) |
| PR161+ | [PR-160-FOLLOW-UP-ROADMAP.md](./PR-160-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-160-CODEX-REVIEW-SCOPE.md](./PR-160-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-160-STRUCTURE-ANALYSIS.md](./PR-160-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-160-IMPLEMENTATION-PLAN.md](./PR-160-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaExpansionDecisionPanel` |
| 코드 | `lib/ops/beta-expansion-decision.ts` |

## 테스트

`npx tsx --test tests/ops/pr160-*.test.ts`

**실제 베타 확대·beta user·발송 없음** · `test:e2e` · `test:smoke` **명령 부재**

## 판단 (PR160-A)

| 구분 | 판단 |
| --- | --- |
| 제한 베타 확대 | **Conditional Expansion** |
| 즉시 확대 | **Maintain** |
| 공개/유료/정식 유료화 | **Stop/보류** |

Critical(정적) **0** · High **7**

## Codex

**원칙적 필수**
