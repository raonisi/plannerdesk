# PR-155 — 역할별 접근 기대값

| 역할 | admin | bulk | AA |
| --- | --- | --- | --- |
| public | 차단 | 차단 | 차단 |
| planner | 차단 | 차단 | 차단 |
| verified planner | 차단 | 차단 | allowlist 조건부 |
| AI allowlisted | 차단 | 차단 | 제한 허용 |
| content_admin | 제한 허용 | 조건부 | 자동 허용 아님 |
| super_admin | 허용 | 제한 허용 | 운영 기준 |

코드: `lib/auth/rbac.ts`, `lib/auth/role-access-matrix.ts`
