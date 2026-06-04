# PR-121 — 기존 피드백 운영 구조 분석

---

## 피드백 문서

| 문서 | 역할 | PR121 관계 |
| --- | --- | --- |
| PR-118-USER-FEEDBACK-OPS | 1차 반영·양식 | → PR121로 승격 |
| PR-118-USER-FEEDBACK-INTAKE | 간단 표 | → REGISTRY로 대체 |
| PR-118-FEEDBACK-TRIAGE-AND-PLAN | 분류·PR119 이관 | 워크플로·라우팅에 통합 |
| PR-119-DATA-ISSUES | 데이터 품질 이슈 | FB 유형「데이터」연계 |
| PR-120-INTEGRATED-RISKS | R7 피드백 없음 | REGISTRY로 추적 |
| PR-120-POST-LAUNCH-BACKLOG | #1,#8 피드백 | PR121 체계로 해소 |

---

## 사용자 피드백 기록

| 항목 | 상태 |
| --- | --- |
| 일반 사용자(설계사) 피드백 | **미수집** (PR118) |
| 저장 위치 | PR121 **문서 표** (권장) |
| 인앱 제출 UI | **없음** (PR121 범위 외) |

---

## 운영 데이터 이슈

- PR119 이슈 #2~#11 — [PR-121-FEEDBACK-TO-PR-ROUTING.md](./PR-121-FEEDBACK-TO-PR-ROUTING.md) → PR124+

---

## 관리자 / public 이슈

| 영역 | 기록 위치 |
| --- | --- |
| Admin UI | PR111, smoke PR117 (미완) |
| Public route | PR110, PR112 |
| Admin bulk | PR107 |
| Answer Assistant | PR109 + **전용** beta feedback 대시보드 |

**AA beta feedback:** `AnswerAssistantBetaFeedback` — 답변 보조 **안전 신호** 전용. PlannerDesk **일반 UX 피드백**과 ID·워크플로 **분리**.

---

## 정보 부족

- production 피드백 원문
- 피드백 담당자·SLA
- 외부 이슈 트래커(GitHub Issues 등) 운영 정책
