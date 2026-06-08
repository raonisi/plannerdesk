# PR-166 — Beta Cohort Control (PR166-A)

**위험도:** High · **성격:** 제한 베타 **대상군 관리 운영 계획** — beta user·role·allowlist·회원가입·발송·DB 변경 없음

## 목적

PR160·PR162·PR165 이후 제한 베타 대상군을 역할·위험·사용 목적 기준으로 선정·유지·축소·중단하는 운영 기준을 문서화한다. 실제 확대 실행 PR이 아니다.

## 범위 (PR166-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-166-ENTRY-CONDITIONS.md](./PR-166-ENTRY-CONDITIONS.md) |
| 구조 | [PR-166-STRUCTURE-ANALYSIS.md](./PR-166-STRUCTURE-ANALYSIS.md) |
| 분류 | [PR-166-COHORT-CLASSIFICATION.md](./PR-166-COHORT-CLASSIFICATION.md) |
| 선정 | [PR-166-SELECTION-CRITERIA.md](./PR-166-SELECTION-CRITERIA.md) |
| 제외 | [PR-166-EXCLUSION-CRITERIA.md](./PR-166-EXCLUSION-CRITERIA.md) |
| 확대 | [PR-166-EXPANSION-CRITERIA.md](./PR-166-EXPANSION-CRITERIA.md) |
| 축소·중단 | [PR-166-REDUCTION-CRITERIA.md](./PR-166-REDUCTION-CRITERIA.md) |
| AA 대상 | [PR-166-AA-COHORT-RULES.md](./PR-166-AA-COHORT-RULES.md) |
| 기록 | [PR-166-COHORT-RECORD-RULES.md](./PR-166-COHORT-RECORD-RULES.md) |
| 후속 | [PR-166-FOLLOW-UP-ROADMAP.md](./PR-166-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-166-CODEX-REVIEW-SCOPE.md](./PR-166-CODEX-REVIEW-SCOPE.md) |
| 계획 | [PR-166-IMPLEMENTATION-PLAN.md](./PR-166-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaCohortControlPanel` |
| 코드 | `lib/ops/beta-cohort-control.ts` |

## 테스트

`npx tsx --test tests/ops/pr166-*.test.ts`

## 판단 (PR166-A)

| 구분 | 판단 |
| --- | --- |
| Cohort Control | **Conditional Ready** |
| 선정·제외 기준 | **Ready** |
| AA 대상 관리 | **Ready** |
| 실제 확대 실행 | **Blocked** |
| Critical(정적) | **0** |

## Codex

**조건부** — 권한·allowlist·대상군 확대 판단 연결 시
