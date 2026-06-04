# PR-139 — Public visibility · RBAC

| 항목 | public 노출 |
| --- | --- |
| 공개 보험사·청구·지식·링크 | `isPublished` + 검수 조건 (`PUBLIC_VERIFICATION_STATUSES` 등) |
| 미검수·비공개 | **미노출** |
| 확인 필요(내부) | 미노출 또는 제한 안내 |
| 관리자 상태값·검수 대기 | **미노출** |
| 운영 이슈·변경 이력 | **미노출** |
| 관리자 리포트·운영 리마인더 | **미노출** |
| Admin bulk 상태 | **미노출** |
| Answer Assistant 운영 상세 | **미노출** (public/planner는 베타 안내만) |

**검증:** PR131 `home-client` · PR132 `lib/search/public.ts` vs `admin.ts` · PR136 matrix — PR139에서 guard **미수정**.

## 서버 guard 우선

권한 판단은 `getAdminAccess` · `require*Access` · `getPublic*` · bulk `validateServerBulkAction` — UI 표시는 보조.
