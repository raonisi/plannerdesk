# PR-157 — 구현 계획 (PR157-A)

1. 진입 조건 확인 — PR150~156 met, Codex pending
2. SSOT `beta-launch-decision.ts`
3. Admin panel + Shell wiring
4. ops test + docs 허브·하위 12문서
5. OPERATING_QA_CHECKLIST · PR-140 roadmap 갱신
6. lint · typecheck · test · build (migrate deploy 없음 확인)

## 수정 파일

- `lib/ops/beta-launch-decision.ts`
- `components/admin/AdminBetaLaunchDecisionPanel.tsx`
- `components/admin/AdminShell.tsx`
- `tests/ops/pr157-beta-launch-decision.test.ts`
- `docs/PR-157-*`
- `docs/OPERATING_QA_CHECKLIST.md`
- `docs/PR-140-DEFERRED-PR-ROADMAP.md`

## 수정하지 않음

- Auth/RBAC · Prisma · allowlist · payment · beta signup
- `package.json` · lockfile

## 최종 판단

- 제한 베타 실행 가능성: **Conditional Launch**
- 즉시 실행: **Hold**
- Codex: **필수·대기**
