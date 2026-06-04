# PR-139 — 고위험 권한 분리 기준

| 권한 | 위험도 | 현재 코드 기준 | PR139-A |
| --- | --- | --- | --- |
| 권한·User.role 관리 | Critical | `canManageUsers` → super_admin only | 변경 없음 |
| DB/Migration | Critical | 범위 외 | 중단·별도 PR |
| Admin bulk 일괄공개 | Critical | `publishContent` → content_admin **가능** | 문서화·운영 주의만 |
| importDrafts | Critical | `superAdmin` + `validateServerBulkAction` 차단 | 변경 없음 |
| 변경 이력 조회 | High | admin only | 변경 없음 |
| 운영 이슈 Critical | High | admin·문서 | 변경 없음 |
| AA allowlist | Critical | env · server-only | **변경 금지** |
| AA safety 설정 | Critical | PR137 | 변경 없음 |
| public visibility guard | Critical | `PUBLIC_*_WHERE` | **약화 금지** |

## content_admin bulk

- **운영 원칙:** destructive·일괄공개는 super_admin 확인 후 실행.
- **코드 갭:** `setPublishedTrue`는 content_admin에게도 `roleHasPermission` 허용 — **PR139-B 또는 bulk 세분화 PR**에서 분리 검토.

## 일괄공개·일괄상태변경

대상 수·rollback·검수 상태 확인은 [PR-123-BULK-OPERATIONS.md](./PR-123-BULK-OPERATIONS.md) 필수.
