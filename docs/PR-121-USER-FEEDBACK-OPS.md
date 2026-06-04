# PR-121 — 사용자 피드백 수집 체계

**목적:** 실제 사용자·운영자 피드백을 **누락 없이 수집·분류·우선순위화**하고 후속 PR로 연결하는 **운영 루프**를 만든다. 인앱 DB·PII 수집 기능 추가 **없음**.

**선행:** PR118 (1차 양식) → PR119 (데이터 QA) → PR120 (운영 전 통합) → **PR121 (체계화)** → [PR123 (관리자 매뉴얼)](./PR-123-ADMIN-OPERATIONS-MANUAL.md)

**운영 이슈(장애·권한·visibility):** High 이상은 [PR-129-OPERATIONAL-ISSUES-OPS.md](./PR-129-OPERATIONAL-ISSUES-OPS.md) `OPS-*` Registry로 승격.

| 문서 | 용도 |
| --- | --- |
| [PR-121-FEEDBACK-STRUCTURE-ANALYSIS.md](./PR-121-FEEDBACK-STRUCTURE-ANALYSIS.md) | 기존 구조 분석 |
| [PR-121-FEEDBACK-INTAKE-REGISTRY.md](./PR-121-FEEDBACK-INTAKE-REGISTRY.md) | 접수·기록 표 (운영자 기입) |
| [PR-121-FEEDBACK-TYPES.md](./PR-121-FEEDBACK-TYPES.md) | 유형 정의·처리 방향 |
| [PR-121-FEEDBACK-SEVERITY-AND-PRIORITY.md](./PR-121-FEEDBACK-SEVERITY-AND-PRIORITY.md) | 심각도·우선순위 |
| [PR-121-FEEDBACK-WORKFLOW.md](./PR-121-FEEDBACK-WORKFLOW.md) | 처리 흐름·상태값 |
| [PR-121-FEEDBACK-TO-PR-ROUTING.md](./PR-121-FEEDBACK-TO-PR-ROUTING.md) | 후속 PR 연결 기준 |
| [PR-121-SENSITIVE-DATA-RULES.md](./PR-121-SENSITIVE-DATA-RULES.md) | 민감정보·PII 금지 |

**레거시:** [PR-118-USER-FEEDBACK-INTAKE.md](./PR-118-USER-FEEDBACK-INTAKE.md) → PR121 표로 이전

---

## PR121 Cursor 세션

| 항목 | 결과 |
| --- | --- |
| product code / schema | **미변경** |
| 피드백 저장소 | **문서(마크다운)** — 운영 DB·앱 폼 없음 |
| AA beta feedback | 별도 (`/admin/answer-assistant/feedback`) — 본 체계와 **분리** |

---

## 운영자 Quick Start

1. [접수 표](./PR-121-FEEDBACK-INTAKE-REGISTRY.md)에 행 추가 (FB-YYYY-NNN)
2. [유형](./PR-121-FEEDBACK-TYPES.md) · [심각도](./PR-121-FEEDBACK-SEVERITY-AND-PRIORITY.md) 지정
3. [워크플로](./PR-121-FEEDBACK-WORKFLOW.md) 따라 분류
4. [PR 라우팅](./PR-121-FEEDBACK-TO-PR-ROUTING.md)에 처리 PR 기입

---

## 금지

- 고객 PII·비밀번호·allowlist·운영 DB 변경
- 피드백 없는 기능 추측

---

## Antigravity 검수

- [ ] PII 수집 구조 없음
- [ ] Critical/High가 backlog에 묻히지 않음
- [ ] PR 라우팅 명확

**Codex:** 기본 생략 — [PR-121-FEEDBACK-WORKFLOW.md](./PR-121-FEEDBACK-WORKFLOW.md)
