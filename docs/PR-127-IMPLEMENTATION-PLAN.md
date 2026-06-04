# PR-127 — 구현 계획

## 1. 반영 항목

- 통합 검색 결과 **영역별 그룹** (2개 이상 도메인 혼합 시)
- 결과 카드 **맥락형 액션 라벨** (청구안내·서류 확인 등)
- 빈 결과 **다음 행동** — 허브 링크, visibility 안내
- 디렉터리·청구·지식·공시 빈 상태 **탐색 동선** 보강
- 정적 ops 테스트 + 문서

## 2. 보류

- 전역 검색 인덱스·외부 검색 연동
- 업무 링크 **데이터** 대량 수정 (→ PR128)
- Answer Assistant 범위 확대

## 3. 정보 부족

- 운영 DB 실검색 QA
- 실기기 모바일 스크린 검증

## 4. 별도 PR

- DB migration / Prisma schema
- Auth·RBAC·allowlist·bulk
- 검색 엔진·full-text DB 인덱스

## 5–6. 수정 / 미수정 파일

| 수정 | 미수정 |
| --- | --- |
| `lib/search/constants.ts`, `labels.ts` | `lib/search/public.ts` |
| `app/search/*`, `components/search/*` | `lib/public/*`, `prisma/schema` |
| `directory-explorer`, `claim-document-explorer`, `knowledge-archive-list`, `disclosure-link-center` | `package.json`, `.env*` |
| `lib/knowledge/archive-filter.ts` (문구만) | Auth, admin bulk |

## 7–10. 영역별 범위

| 영역 | 범위 |
| --- | --- |
| 보험사 | 빈 결과 안내·허브 링크 (필터 로직 동일) |
| 청구서류 | 빈 결과 + 디렉터리/통합 검색 링크 |
| 지식 | 빈 결과 문구·허브 |
| 업무 링크 | 공시 빈 결과·디렉터리 카드 기존 구조 유지 |

## 11–12. 영향

| 항목 | 영향 |
| --- | --- |
| public visibility | **없음** (guard·fetch 미변경) |
| DB/Auth/Migration | **없음** |

## 13. 테스트 계획

- `npx tsx --test tests/ops/pr127-search-ux.test.ts`
- `npm run lint`, `typecheck`, `test`, `build`

## 14. Codex 제한검수

- **필요 여부:** 기본 **생략**
- **후보:** `lib/search/public.ts` 또는 `lib/public/*` 변경 시
