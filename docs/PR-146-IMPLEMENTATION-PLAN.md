# PR-146 — 구현 계획

1. PR140~145 확인
2. `beta-access-request-flow.ts` + 패널 + docs + test
3. PR141 MANUAL-APPROVAL 연계
4. 보류: PR146-B~G·148·149·150

## 영향

visibility·RBAC·schema·allowlist·발송 — **없음**

## 검증

lint · typecheck · test · build  
`npx tsx --test tests/ops/pr146-beta-access-request-flow.test.ts`

## Codex

**권장(필수에 가깝)** — PII·권한·allowlist.
