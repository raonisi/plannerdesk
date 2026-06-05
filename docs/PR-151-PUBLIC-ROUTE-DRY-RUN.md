# PR-151 — Public Route Dry Run

`PUBLIC_ROUTE_DRY_RUN` 기준. 정적 검증 — 런타임 E2E는 PR154.

- landing: PR144 conditional, 과장·지급 확정 문구 없음
- `/directory`, `/claim-documents`, `/disclosure-links`, `/knowledge`, `/search`: `isPublished` + PR147 `DataResponsibilityInlineNotice`
- admin·운영·audit·bulk·변경 이력: public 미노출
