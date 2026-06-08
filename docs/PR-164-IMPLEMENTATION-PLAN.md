# PR-164 — 구현 계획 (PR164-A)

1. 진입 조건 확인 — PR156/158/159/162 충족
2. `output-safety.ts` · `validation.ts` rule 보강
3. `rollback-disable.ts` PR164 trigger 추가
4. `lib/ops/ai-safety-hardening.ts` SSOT
5. `AdminAiSafetyHardeningPanel` + tests
6. fixtures·output-safety·pr164 tests
7. PR156 red-team partial → pass 갱신

**수정 안 함:** verified-access, allowlist, prisma, package.json, provider live call

**검증:** lint · typecheck · test · build (migrate 없음)

**Codex:** 필수(조건부) · PR165 전 safety 확정 권장
