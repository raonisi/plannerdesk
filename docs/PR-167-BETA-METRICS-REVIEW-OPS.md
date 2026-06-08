# PR-167 — Beta Metrics Review (PR167-A)

**위험도:** High · **성격:** 제한 베타 **운영 지표 정의·검토** — analytics SDK·대시보드·지표 DB·schema 변경 없음

## 목적

PR158·PR159·PR160·PR162·PR166 기준을 바탕으로 사용성·오류·피드백·데이터·AI safety·지원 지표를 metadata 중심으로 정의하고 확대·유지·축소·중단 판단 근거를 문서화한다.

## 범위 (PR167-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-167-ENTRY-CONDITIONS.md](./PR-167-ENTRY-CONDITIONS.md) |
| 구조 | [PR-167-STRUCTURE-ANALYSIS.md](./PR-167-STRUCTURE-ANALYSIS.md) |
| 분류 | [PR-167-METRICS-CLASSIFICATION.md](./PR-167-METRICS-CLASSIFICATION.md) |
| 핵심 | [PR-167-CORE-METRICS.md](./PR-167-CORE-METRICS.md) |
| 등급 | [PR-167-SEVERITY-GRADES.md](./PR-167-SEVERITY-GRADES.md) |
| 운영 판단 | [PR-167-OPERATION-DECISIONS.md](./PR-167-OPERATION-DECISIONS.md) |
| AA 지표 | [PR-167-AA-METRICS.md](./PR-167-AA-METRICS.md) |
| 지원 지표 | [PR-167-SUPPORT-METRICS.md](./PR-167-SUPPORT-METRICS.md) |
| 기록 | [PR-167-RECORD-RULES.md](./PR-167-RECORD-RULES.md) |
| 후속 | [PR-167-FOLLOW-UP-ROADMAP.md](./PR-167-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-167-CODEX-REVIEW-SCOPE.md](./PR-167-CODEX-REVIEW-SCOPE.md) |
| 계획 | [PR-167-IMPLEMENTATION-PLAN.md](./PR-167-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaMetricsReviewPanel` |
| 코드 | `lib/ops/beta-metrics-review.ts` |

## 테스트

`npx tsx --test tests/ops/pr167-*.test.ts`

## 판단 (PR167-A)

| 구분 | 판단 |
| --- | --- |
| Metrics Review | **Conditional Ready** |
| 지표 정의 | **Ready** |
| metadata-only | **Ready** |
| analytics 구현 | **Blocked** |
| Critical(정적) | **0** |

## Codex

**조건부** — PII·AI safety·권한 지표 기준 불명확 시
