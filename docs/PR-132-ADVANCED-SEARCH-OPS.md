# PR-132 — 고급 통합 검색

## 목적

외부 검색 엔진·schema 변경 없이 **기존 `searchPublicContent`** 를 확장해 보험사·청구서류·지식·**업무 링크**·공시·고객문구를 영역별 그룹·필터·카드로 탐색한다.

## 범위

| 항목 | 내용 |
| --- | --- |
| 업무 링크 | `lib/search/work-links-search.ts` — 공개 보험사만 |
| 그룹핑 | 전체 검색 시 영역당 4건 + 더 보기 |
| 필터 | `업무 링크` pill 추가 |
| 지식 | 태그 exact match OR 조건 |
| 카드 | 유형 라벨·보조 액션·external 링크 |
| Admin | `work_link` 도메인 **제외** (public 전용) |

## 비범위

- Elasticsearch/Algolia 등 외부 엔진
- Prisma migration / visibility guard 변경
- 운영 데이터·allowlist 수정

## 관련

- [PR-132-SEARCH-STRUCTURE-ANALYSIS.md](./PR-132-SEARCH-STRUCTURE-ANALYSIS.md)
- [PR-132-IMPLEMENTATION-PLAN.md](./PR-132-IMPLEMENTATION-PLAN.md)
- PR127 · PR131 · PR130 roadmap

## Codex

기본 생략. `work-links-search` 가 공개 보험사 WHERE 를 우회하면 제한검수.
