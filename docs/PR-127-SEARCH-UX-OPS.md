# PR-127 — 검색·탐색 UX 개선

**목적:** 보험설계사가 보험사·청구서류·지식·업무 링크를 **더 빠르고 정확하게** 찾도록 검색 흐름, 필터 구조, 빈 결과 안내, 탐색 동선을 개선한다. **UI·문구·표시 중심** — DB·Auth·visibility guard·운영 데이터 **미변경**.

**선행:** PR121(피드백) → PR122(최신성) → PR123(운영 매뉴얼) → PR124(데이터 보완) → PR125(지식 품질) → PR126(AA 베타 관찰) → **PR127**

| 문서 | 용도 |
| --- | --- |
| [PR-127-SEARCH-STRUCTURE-ANALYSIS.md](./PR-127-SEARCH-STRUCTURE-ANALYSIS.md) | 기존 검색·탐색 구조 분석 |
| [PR-127-PUBLIC-VISIBILITY-REVIEW.md](./PR-127-PUBLIC-VISIBILITY-REVIEW.md) | public visibility 확인 (guard 미변경) |
| [PR-127-IMPLEMENTATION-PLAN.md](./PR-127-IMPLEMENTATION-PLAN.md) | 구현 범위·보류·분리 PR |

**정적 검증:** `tests/ops/pr127-search-ux.test.ts`

---

## PR127 Cursor 세션

| 항목 | 결과 |
| --- | --- |
| 운영 DB | **미접근** |
| Prisma schema / migration | **없음** |
| public fetch / visibility guard | **미변경** |
| package.json / lockfile | **미변경** |

---

## 반영 요약

| 영역 | 내용 |
| --- | --- |
| 통합 검색 `/search` | 영역별 결과 그룹, 맥락형 액션 라벨, 빈 결과 패널·허브 링크 |
| 보험사 `/directory` | 검색 빈 결과 시 다음 메뉴 안내 |
| 청구서류 `/claim-documents` | 빈 결과 시 디렉터리·통합 검색·관련 메뉴 |
| 지식 `/knowledge` | 빈 결과 문구·허브 링크 |
| 공시·약관 `/disclosure-links` | 빈 결과 문구·허브 링크 |
| 공유 | `BrowseNextSteps`, `SearchEmptyPanel` |

---

## 금지 (본 PR)

- guard 약화 · 미검수/비공개 public 노출 · schema/migration · Auth/RBAC · allowlist/bulk · 운영 DB

**Codex:** 기본 생략 — visibility·fetch 변경 시 제한검수 후보.
