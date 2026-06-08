# PR-161 — 구조 분석

## 점검 대상 (코드 참조만, DB 미접근)

| 영역 | 경로 |
| --- | --- |
| public visibility | `lib/public/visibility.ts` |
| 보험사 | `lib/public/insurers.ts` |
| 청구서류 | `lib/public/claim-documents.ts` |
| 지식 | `lib/public/knowledge-articles.ts` |
| 검색 | `lib/search/public.ts` |
| admin bulk | `lib/admin/` (정책 참조) |
| 검수 필드 | `verificationStatus` · `isPublished` |

## SSOT · UI · Test

- SSOT: `lib/ops/data-freshness-review.ts`
- Panel: `AdminDataFreshnessReviewPanel`
- Test: `tests/ops/pr161-data-freshness-review.test.ts`

## 영향 없음

Auth · schema · migration · package · provider · 운영 DB · 크롤 · 동기화 · role · allowlist
