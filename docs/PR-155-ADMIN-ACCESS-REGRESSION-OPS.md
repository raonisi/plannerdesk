# PR-155 — Admin Access Regression Test (PR155-A)

**위험도:** Critical · **성격:** admin 접근 **회귀 테스트** — 실제 권한·role 변경 없음

## 목적

PR154 이후 public·planner·verified·AI allowlisted 사용자의 admin route 접근 차단과 content_admin/super_admin 경계가 회귀하지 않도록 **정적 regression**을 보강한다.

## 범위 (PR155-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 대상 | [PR-155-REGRESSION-TARGETS.md](./PR-155-REGRESSION-TARGETS.md) |
| 역할 기대값 | [PR-155-ROLE-ACCESS-EXPECTATIONS.md](./PR-155-ROLE-ACCESS-EXPECTATIONS.md) |
| route 차단 | [PR-155-ADMIN-ROUTE-BLOCK.md](./PR-155-ADMIN-ROUTE-BLOCK.md) |
| 데이터 미노출 | [PR-155-ADMIN-DATA-NON-EXPOSURE.md](./PR-155-ADMIN-DATA-NON-EXPOSURE.md) |
| role 경계 | [PR-155-ROLE-BOUNDARY.md](./PR-155-ROLE-BOUNDARY.md) |
| AA 분리 | [PR-155-AA-ADMIN-SEPARATION.md](./PR-155-AA-ADMIN-SEPARATION.md) |
| 런타임 | [PR-155-RUNTIME-REGRESSION.md](./PR-155-RUNTIME-REGRESSION.md) |
| PR156+ | [PR-155-FOLLOW-UP-ROADMAP.md](./PR-155-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-155-CODEX-REVIEW-SCOPE.md](./PR-155-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-155-STRUCTURE-ANALYSIS.md](./PR-155-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-155-IMPLEMENTATION-PLAN.md](./PR-155-IMPLEMENTATION-PLAN.md) |
| UI | `AdminAccessRegressionPanel` |
| 코드 | `lib/ops/admin-access-regression.ts` |

## 테스트

| 파일 | 실행 |
| --- | --- |
| `tests/admin/admin-access-regression.test.ts` | `npx tsx --test tests/admin/*.test.ts` |
| `tests/ops/pr155-admin-access-regression.test.ts` | `npx tsx --test tests/ops/pr155-*.test.ts` |
| `tests/ops/pr139-role-access.test.ts` | PR139 RBAC 기반 |
| `tests/public/public-visibility.test.ts` | public 미노출 |

`npm run test:e2e` · `npm run test:smoke` — **명령 부재**

## 비범위

- package.json/lockfile 변경 · 신규 의존성
- 운영 DB · role · allowlist · 실제 관리자 계정 변경
- Auth/RBAC 구조 대규모 변경

## 연계

| PR | 문서 |
| --- | --- |
| PR154 | [PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md](./PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md) |
| PR149 | [PR-149-SECURITY-FINAL-AUDIT-OPS.md](./PR-149-SECURITY-FINAL-AUDIT-OPS.md) |
| PR139 | [PR-139-ROLE-ACCESS-OPS.md](./PR-139-ROLE-ACCESS-OPS.md) |

**실제 권한 변경·외부 공개·배포 실행 없음.**

## 판단 (PR155-A)

| 구분 | 판단 |
| --- | --- |
| Admin 회귀 (정적) | **Conditional Ready** |
| PR156 진입 | **Conditional Ready** |
| 런타임 HTTP admin E2E | **보류** (test:e2e 부재) |

Critical(정적) 0

## Codex

**원칙적 권장** — admin 접근·RBAC·AA 분리
