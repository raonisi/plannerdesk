# PR-128 — 업무 링크 / 전산 바로가기 안정화

**목적:** 보험사별 전산·청구안내·홈페이지·공시·헬프데스크 링크를 **목적별로 구분**하고, 확인 전 항목을 정상 링크처럼 보이지 않게 한다. **UI·문구·그룹핑** 중심 — 운영 DB·fixture URL 대량 수정·guard 변경 **없음**.

**선행:** PR127(검색 UX) → **PR128**

| 문서 | 용도 |
| --- | --- |
| [PR-128-WORK-LINK-STRUCTURE-ANALYSIS.md](./PR-128-WORK-LINK-STRUCTURE-ANALYSIS.md) | 구조 분석 |
| [PR-128-WORK-LINK-TYPES-AND-STATUS.md](./PR-128-WORK-LINK-TYPES-AND-STATUS.md) | 유형·상태값 기준 |
| [PR-128-PUBLIC-VISIBILITY-REVIEW.md](./PR-128-PUBLIC-VISIBILITY-REVIEW.md) | visibility 확인 |
| [PR-128-IMPLEMENTATION-PLAN.md](./PR-128-IMPLEMENTATION-PLAN.md) | 구현·보류·분리 PR |

**정적 검증:** `tests/ops/pr128-work-links.test.ts`

---

## PR128 Cursor 세션

| 항목 | 결과 |
| --- | --- |
| 운영 DB | **미접근** |
| fixture URL 대량 수정 | **없음** (데이터 보완은 PR124·별도 승인 PR) |
| public guard | **미변경** |
| 자동 링크 크롤/HEAD 검사 | **없음** |

---

## 반영 요약

| 영역 | 내용 |
| --- | --- |
| `lib/directory/work-links.ts` | 유형·그룹 라벨, 접근 안내, 공시 partial 상태 |
| `InsurerPrimaryWorkLinks` | 전산·공식·지원 그룹 (카드 상단) |
| `InsurerActionCard` | 청구 업무 그룹 라벨, 상세 영역 제목 통일 |
| `/directory` hero | 목적별 탐색·확인 전 미단정 안내 |

---

## 금지

- 출처 없이 URL 수정 · guard 약화 · 자동 대량 HTTP 검사

**Codex:** 기본 생략 — visibility·fixture URL 변경 시 후보.
