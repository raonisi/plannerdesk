# PR-168 — Data Correction Workflow (PR168-A)

**위험도:** High · **성격:** 데이터 오류 **접수·검수·보류·후속 수정 PR 연결** — 운영 DB 수정·크롤링·bulk·schema 변경 없음

## 목적

PR161 Data Freshness Review, PR162 User Support Inbox Plan, PR167 Beta Metrics Review 기준을 바탕으로 보험사 디렉터리·청구서류·업무 링크·지식 아카이브·public 검색에서 발견된 데이터 오류를 안전하게 접수·검수·보류하고 후속 수정 PR로 분리하는 workflow를 문서화한다.

## 범위 (PR168-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-168-ENTRY-CONDITIONS.md](./PR-168-ENTRY-CONDITIONS.md) |
| 구조 | [PR-168-STRUCTURE-ANALYSIS.md](./PR-168-STRUCTURE-ANALYSIS.md) |
| 원칙 | [PR-168-WORKFLOW-PRINCIPLES.md](./PR-168-WORKFLOW-PRINCIPLES.md) |
| 접수 | [PR-168-INTAKE-RULES.md](./PR-168-INTAKE-RULES.md) |
| 출처 | [PR-168-OFFICIAL-SOURCES.md](./PR-168-OFFICIAL-SOURCES.md) |
| 등급 | [PR-168-ERROR-GRADES.md](./PR-168-ERROR-GRADES.md) |
| 도메인 | [PR-168-DOMAIN-WORKFLOWS.md](./PR-168-DOMAIN-WORKFLOWS.md) |
| 템플릿 | [PR-168-REQUEST-TEMPLATE.md](./PR-168-REQUEST-TEMPLATE.md) |
| 검수 | [PR-168-TRIAGE-DECISIONS.md](./PR-168-TRIAGE-DECISIONS.md) |
| 후속 | [PR-168-FOLLOW-UP-ROADMAP.md](./PR-168-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-168-CODEX-REVIEW-SCOPE.md](./PR-168-CODEX-REVIEW-SCOPE.md) |
| 계획 | [PR-168-IMPLEMENTATION-PLAN.md](./PR-168-IMPLEMENTATION-PLAN.md) |
| UI | `AdminDataCorrectionWorkflowPanel` |
| 코드 | `lib/ops/data-correction-workflow.ts` |

## 연계 허브

- [PR-161-DATA-FRESHNESS-REVIEW-OPS.md](./PR-161-DATA-FRESHNESS-REVIEW-OPS.md)
- [PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md](./PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md)
- [PR-167-BETA-METRICS-REVIEW-OPS.md](./PR-167-BETA-METRICS-REVIEW-OPS.md)
- [PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md](./PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md)

## 테스트

`npx tsx --test tests/ops/pr168-*.test.ts`

## 판단 (PR168-A)

| 구분 | 판단 |
| --- | --- |
| Correction Workflow | **Conditional Ready** |
| 공식 출처 정책 | **Ready** |
| 도메인 workflow | **Ready** |
| 실제 데이터 수정 | **Blocked** |
| Critical(정적) | **0** |

## Codex

**조건부** — public visibility·청구서류 책임 문구·후속 PR 기준 불명확 시
