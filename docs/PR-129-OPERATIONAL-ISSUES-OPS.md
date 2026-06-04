# PR-129 — 운영 이슈 리포팅 체계

**목적:** 운영 중 발견되는 데이터·링크·화면·권한·검색·관리자·AI·배포·보안 이슈를 **누락 없이 접수·분류·우선순위화**하고 후속 PR 또는 운영 조치로 연결한다. **문서·표·템플릿만** — 인앱 이슈 DB·PII 수집 **없음**.

**선행:** PR121(피드백) → PR122~PR128(운영 개선) → **PR129 (이슈 체계)** → [PR130(월간 운영 리포트)](./PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md)

| 문서 | 용도 |
| --- | --- |
| [PR-129-ISSUE-STRUCTURE-ANALYSIS.md](./PR-129-ISSUE-STRUCTURE-ANALYSIS.md) | 기존 운영·피드백 구조 분석 |
| [PR-129-ISSUE-INTAKE-REGISTRY.md](./PR-129-ISSUE-INTAKE-REGISTRY.md) | 이슈 접수·기록 표 (OPS-YYYY-NNN) |
| [PR-129-ISSUE-TYPES.md](./PR-129-ISSUE-TYPES.md) | 유형·처리 방향 |
| [PR-129-ISSUE-SEVERITY.md](./PR-129-ISSUE-SEVERITY.md) | 심각도·에스컬레이션 |
| [PR-129-ISSUE-WORKFLOW.md](./PR-129-ISSUE-WORKFLOW.md) | 처리 흐름·상태값 |
| [PR-129-ISSUE-TO-PR-ROUTING.md](./PR-129-ISSUE-TO-PR-ROUTING.md) | 후속 PR 연결 |
| [PR-129-PII-AND-SENSITIVE-DATA-RULES.md](./PR-129-PII-AND-SENSITIVE-DATA-RULES.md) | 개인정보·민감정보 금지 |
| [PR-129-ISSUE-REPORT-TEMPLATE.md](./PR-129-ISSUE-REPORT-TEMPLATE.md) | 리포트·월간 요약 템플릿 |
| [PR-129-IMPLEMENTATION-PLAN.md](./PR-129-IMPLEMENTATION-PLAN.md) | 구현 범위·보류 |

**연계:** [PR-121-USER-FEEDBACK-OPS.md](./PR-121-USER-FEEDBACK-OPS.md) (FB-* 피드백 → 필요 시 OPS-* 승격)

**정적 검증:** `tests/ops/pr129-operational-issues.test.ts`

---

## PR129 Cursor 세션

| 항목 | 결과 |
| --- | --- |
| product code / schema | **미변경** |
| 이슈 저장소 | **문서(마크다운)** — 운영 DB·앱 폼 없음 |
| 운영 DB / Auth / allowlist / bulk | **미변경** |

---

## 운영자 Quick Start

1. [접수 표](./PR-129-ISSUE-INTAKE-REGISTRY.md)에 행 추가 (`OPS-YYYY-NNN`)
2. [민감정보 제거](./PR-129-PII-AND-SENSITIVE-DATA-RULES.md) 후 요약만 기록
3. [유형](./PR-129-ISSUE-TYPES.md) · [심각도](./PR-129-ISSUE-SEVERITY.md) 지정
4. **Critical/High** → [워크플로](./PR-129-ISSUE-WORKFLOW.md) 긴급 분기 (backlog 금지)
5. [PR 라우팅](./PR-129-ISSUE-TO-PR-ROUTING.md) · [리포트](./PR-129-ISSUE-REPORT-TEMPLATE.md) 갱신

---

## 금지

- 고객 PII·상담 원문·계약번호·병력 원문 기록
- 확인 전 데이터·링크를 “정상”으로 단정
- Critical/High를 일반 backlog만으로 종료

**Codex:** 기본 생략 — 권한·visibility·secret·운영 DB 이슈 시 제한검수 후보.
