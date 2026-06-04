# PR-130 — 사용자 피드백 요약

**출처:** [PR-121-FEEDBACK-INTAKE-REGISTRY.md](./PR-121-FEEDBACK-INTAKE-REGISTRY.md) · [PR-120-POST-LAUNCH-BACKLOG.md](./PR-120-POST-LAUNCH-BACKLOG.md) · Cycle 문서.

**주의:** 아래 **「문서 근거 후보」**는 production 반복 피드백이 **확정된 것이 아님**. 월간 Registry 기입 후 순위를 갱신한다.

---

## 사용자 피드백 요약표

| 순위 | 반복 피드백 (후보) | 발생 화면 | 유형 | 심각도 | 권장 조치 |
| ---: | --- | --- | --- | --- | --- |
| 1 | 보험사·청구·링크 **최신성·정확성** 불안 | 디렉터리·청구 | 데이터 | High | PR122 점검 + PR124/134 |
| 2 | **찾기 어려움** (검색·필터·빈 상태) | 검색·청구·지식 | 검색/화면 | Medium | PR127 유지·PR132 검토 |
| 3 | 전산·청구 **링크 목적 구분** | 디렉터리 | 링크/화면 | Medium | PR128 유지·fixture URL 승인 후 |
| 4 | 청구서류 **보험사별 묶음** (`insurerId`) | 청구 | 데이터 | Medium | PR124 import (출처 확인 후) |
| 5 | 관리자 **등록·검수·일괄작업** 복잡 | admin | 관리자 | Medium~High | PR123 준수·PR136 후보 |
| 6 | Answer Assistant **범위·안전** 우려 | AA | AI | High | PR126 관찰 유지·PR137 보류 |

---

## 판단

| 기준 | 결과 |
| --- | --- |
| 반복 피드백 → 고도화 | **데이터·검색·링크** 우선 (문서 근거) |
| 정보 부족 피드백 | Registry 비어 있으면 **고도화 근거 사용 금지** |
| Critical/High | **안정화 PR** 우선 (PR124, 129, visibility) |
| 단순 선호 | backlog (PR-120-POST-LAUNCH-BACKLOG) |
