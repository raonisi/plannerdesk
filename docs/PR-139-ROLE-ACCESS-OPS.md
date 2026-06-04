# PR-139 — 역할별 운영 권한 세분화 (점검 · PR139-A)

**위험도:** Critical · **성격:** 기존 RBAC 확인·문서·admin 안내 — **role/Auth/DB 변경 없음**

## 목적

`lib/auth/rbac.ts` · `lib/auth/access.ts` · admin layout · bulk policy · Answer Assistant access를 기준으로 public / planner / verified planner / content_admin / super_admin 범위를 **명확히 정리**한다.

## 범위 (PR139-A)

| 항목 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 역할 정의 | [PR-139-ROLE-DEFINITIONS.md](./PR-139-ROLE-DEFINITIONS.md) |
| 기능 매트릭스 | [PR-139-FEATURE-PERMISSION-MATRIX.md](./PR-139-FEATURE-PERMISSION-MATRIX.md) |
| Route 매트릭스 | [PR-139-ROUTE-ACCESS-MATRIX.md](./PR-139-ROUTE-ACCESS-MATRIX.md) |
| 고위험 권한 | [PR-139-HIGH-RISK-PERMISSIONS.md](./PR-139-HIGH-RISK-PERMISSIONS.md) |
| public visibility | [PR-139-PUBLIC-VISIBILITY-RBAC.md](./PR-139-PUBLIC-VISIBILITY-RBAC.md) |
| 구조 분석 | [PR-139-STRUCTURE-ANALYSIS.md](./PR-139-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-139-IMPLEMENTATION-PLAN.md](./PR-139-IMPLEMENTATION-PLAN.md) |
| UI | `AdminRoleAccessPanel` — `/admin` only |
| 코드 | `lib/auth/role-access-matrix.ts` |

## 비범위 (별도 PR)

- 신규 role · Prisma migration · Auth provider 변경 → [PR-139-B-RBAC-FOUNDATION-DESIGN.md](./PR-139-B-RBAC-FOUNDATION-DESIGN.md)
- 실제 User.role 변경 · allowlist 변경 · bulk 실행

## 연계 (PR131~138)

- [PR-131-DASHBOARD-OPS.md](./PR-131-DASHBOARD-OPS.md) — admin/public 대시보드 분리
- [PR-132-ADVANCED-SEARCH-OPS.md](./PR-132-ADVANCED-SEARCH-OPS.md) — public/admin 검색 분리
- [PR-133-CHANGE-HISTORY-OPS.md](./PR-133-CHANGE-HISTORY-OPS.md)
- [PR-136-PUBLIC-ADMIN-MATRIX.md](./PR-136-PUBLIC-ADMIN-MATRIX.md)
- [PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md](./PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md)
- [PR-138-OPERATIONS-REMINDER-OPS.md](./PR-138-OPERATIONS-REMINDER-OPS.md)
- [PR-123-ADMIN-ROLES.md](./PR-123-ADMIN-ROLES.md)

## Codex

**제한검수 권장** — Auth/RBAC/public visibility/Admin bulk/Answer Assistant 경계 확인. PR139-A는 권한 **변경 없음**이면 문서·테스트 diff 중심 검수.
