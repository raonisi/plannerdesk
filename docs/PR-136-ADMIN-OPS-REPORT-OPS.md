# PR-136 — 관리자 운영 리포트 (문서·기준·admin 안내)

**위험도:** Medium~High · **분기:** **A** (문서·템플릿·기존 대시보드 안내) + **PR136-B** (DB 집계 별도)

## 목적

운영자가 보험사·청구서류·지식·링크·검수·이슈·Answer Assistant 베타 상태를 **반복 점검**할 수 있도록 리포트 영역·상태값·템플릿·public/admin 분리 기준을 정리한다.

## 범위 (PR136-A)

| 항목 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 템플릿 | [PR-136-REPORT-TEMPLATE.md](./PR-136-REPORT-TEMPLATE.md) |
| 상태값 | [PR-136-REPORT-STATUS-VALUES.md](./PR-136-REPORT-STATUS-VALUES.md) |
| 영역별 기준 | [PR-136-DOMAIN-REPORT-CRITERIA.md](./PR-136-DOMAIN-REPORT-CRITERIA.md) |
| 운영 이슈 | [PR-136-OPERATIONAL-ISSUES-REPORT.md](./PR-136-OPERATIONAL-ISSUES-REPORT.md) |
| AA 베타 | [PR-136-ANSWER-ASSISTANT-REPORT.md](./PR-136-ANSWER-ASSISTANT-REPORT.md) |
| 역할 매트릭스 | [PR-136-PUBLIC-ADMIN-MATRIX.md](./PR-136-PUBLIC-ADMIN-MATRIX.md) |
| 구조 분석 | [PR-136-STRUCTURE-ANALYSIS.md](./PR-136-STRUCTURE-ANALYSIS.md) |
| UI | `AdminOperationsReportPanel` — `/admin` 전용 |
| 금지 | 신규 통계 테이블 · migration · public 노출 |

## 비범위 (별도 PR)

- DB 기반 자동 집계·리포트 테이블 → [PR-136-B-DB-ANALYTICS-DESIGN.md](./PR-136-B-DB-ANALYTICS-DESIGN.md)
- allowlist·Auth·bulk 실행 변경

## 연계 Cycle

- [PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md](./PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md)
- [PR-131-DASHBOARD-OPS.md](./PR-131-DASHBOARD-OPS.md)
- [PR-133-CHANGE-HISTORY-OPS.md](./PR-133-CHANGE-HISTORY-OPS.md)
- [PR-134-LINK-STATUS-OPS.md](./PR-134-LINK-STATUS-OPS.md)
- [PR-135-PLANNER-FAVORITES-OPS.md](./PR-135-PLANNER-FAVORITES-OPS.md)
- [PR-129-OPERATIONAL-ISSUES-OPS.md](./PR-129-OPERATIONAL-ISSUES-OPS.md)

## Codex

schema·Auth·운영 DB·visibility 변경 없으면 **생략 가능**. PR136-B 착수 시 **제한검수**.
