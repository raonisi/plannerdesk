# PR-139 — 구현 계획

## 진입 조건

PR131~138 admin/public 분리·AA 제한·리마인더 문서화 완료. Critical 미해결 **운영 이슈**는 Registry 수동 확인.

## 선택 분기: **A + B**

- **A:** 기존 RBAC 충분 — 매트릭스·문서·`AdminRoleAccessPanel`·정적 테스트
- **B:** 테스트/문서 보완 (pr139 ops suite)
- **C:** 해당 없음 — 신규 role/schema 불필요

## 반영

- `lib/auth/role-access-matrix.ts`
- `AdminRoleAccessPanel` on `/admin`
- docs PR-139-* · PR-139-B 설계만

## 보류

- content_admin bulk publish 코드 분리
- 권한 관리 UI
- reviewer 전용 role

## 수정 파일

- `components/admin/AdminShell.tsx`
- `docs/OPERATING_QA_CHECKLIST.md`
- 신규 docs/tests/lib/auth/role-access-matrix.ts

## 수정하지 않음

- `prisma/schema.prisma` · `auth.ts` · `allowlist.ts` · `rbac.ts` 권한 로직 · public guards

## 검증

`npm run lint` · `typecheck` · `test` · `npx tsx --test tests/ops/pr139-role-access.test.ts` · `build`

## Codex

**제한검수 권장** — RBAC 경계·bulk·AA·public visibility diff 확인.
