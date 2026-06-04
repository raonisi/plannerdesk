# PR-135 — 설계사 업무 즐겨찾기 (client-only · PR135-A)

**위험도:** Medium · **구현 분기:** **B안** (기존 localStorage + UX 통합)

## 목적

설계사가 반복적으로 찾는 **보험사·청구서류·지식·업무 도구**를 이 기기에서 빠르게 다시 열 수 있도록, 기존 즐겨찾기 저장소를 통합·확장하고 public visibility guard를 유지한다.

## 범위 (PR135-A)

| 항목 | 내용 |
| --- | --- |
| 구조 분석 | [PR-135-STRUCTURE-ANALYSIS.md](./PR-135-STRUCTURE-ANALYSIS.md) |
| UX·문구·금지 저장 | [PR-135-FAVORITES-UX-STANDARDS.md](./PR-135-FAVORITES-UX-STANDARDS.md) |
| 구현 계획 | [PR-135-IMPLEMENTATION-PLAN.md](./PR-135-IMPLEMENTATION-PLAN.md) |
| 코드 | `lib/planner-favorites/*`, 홈 패널, 청구/지식/검색 토글 |
| 테스트 | `tests/ops/pr135-planner-favorites.test.ts` |

## 비범위 (별도 PR)

| 항목 | 권장 PR |
| --- | --- |
| 사용자별 서버 저장·동기화 | **PR-135-B** [PR-135-B-DB-FOUNDATION-DESIGN.md](./PR-135-B-DB-FOUNDATION-DESIGN.md) |
| 검색어 즐겨찾기 | 고객정보 입력 위험 — 보류 |
| 즐겨찾기 메모 | 민감정보 입력 위험 — 보류 |
| 업무 링크(work_link) 즐겨찾기 | 외부 URL·확인 필요 링크 — 보류 |
| Auth/RBAC/allowlist 변경 | 금지 |
| schema migration | 금지 |

## 저장소 (client-only)

| 대상 | 키 | ID 형식 |
| --- | --- | --- |
| 보험사 | `plannerdesk:favoriteInsurers` | 공개 보험사 `id` |
| 업무 도구 | `plannerdesk.workTools.favorites` | 도구 `id` |
| 고객 문구 | `plannerdesk.messages.favorites` | 템플릿 `id` (기존) |
| 청구서류 | `plannerdesk:favoriteClaimDocuments` | `doc:{id}` / `pdf:{id}` |
| 지식 | `plannerdesk:favoriteKnowledgeArticles` | 기사 `id` |

표시 시 **현재 공개 카탈로그**에 없는 id는 렌더하지 않음 (미검수·비공개 우회 방지).

## 관련

- [PR-131-DASHBOARD-OPS.md](./PR-131-DASHBOARD-OPS.md)
- [PR-132-ADVANCED-SEARCH-OPS.md](./PR-132-ADVANCED-SEARCH-OPS.md) (있다면)
- [PR-134-LINK-STATUS-OPS.md](./PR-134-LINK-STATUS-OPS.md)
- PR-32 `hooks/useFavorites.ts`

## Codex

DB/Auth/Migration/개인화 서버 저장 없으면 **생략 가능**. PR-135-B 착수 시 **제한검수**.
