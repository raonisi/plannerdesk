# PR-155 — 회귀 테스트 대상

SSOT: `lib/ops/admin-access-regression.ts` → `ADMIN_REGRESSION_TARGETS`

| 영역 | 기대 |
| --- | --- |
| /admin | getAdminAccess 차단 |
| /admin/insurers 등 | non-admin denied |
| Admin bulk | bulk-policies |
| 운영 패널 | AdminShell only |
| public search | PUBLIC_*_WHERE |
| AA | allowlist≠admin |
