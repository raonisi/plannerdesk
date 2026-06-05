# PR-149 — Public Visibility 최종 감사

`isPublishedContentPubliclyVisible` — `lib/public/visibility.ts`

- draft · isPublished=false → public **미노출**
- 검색: `lib/search/public.ts` — admin-only domain 제외
- 운영 패널: `AdminOperationsReportPanel` 등 — `/admin` only
