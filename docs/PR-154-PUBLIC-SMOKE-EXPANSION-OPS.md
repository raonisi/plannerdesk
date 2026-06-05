# PR-154 — Public Smoke Test Expansion (PR154-A)

**위험도:** High · **성격:** public route **smoke 기준 확장** — 실제 공개·배포 없음

## 목적

PR151~153 이후 public route의 visibility·접근 차단·책임 고지·금지 문구를 **정적 smoke**로 보강한다.

## 범위 (PR154-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 대상 | [PR-154-SMOKE-TARGETS.md](./PR-154-SMOKE-TARGETS.md) |
| visibility | [PR-154-VISIBILITY-SMOKE.md](./PR-154-VISIBILITY-SMOKE.md) |
| 접근 차단 | [PR-154-ACCESS-BLOCK-SMOKE.md](./PR-154-ACCESS-BLOCK-SMOKE.md) |
| 책임 고지 | [PR-154-RESPONSIBILITY-SMOKE.md](./PR-154-RESPONSIBILITY-SMOKE.md) |
| 금지 문구 | [PR-154-FORBIDDEN-PHRASE-SMOKE.md](./PR-154-FORBIDDEN-PHRASE-SMOKE.md) |
| 런타임 | [PR-154-RUNTIME-SMOKE.md](./PR-154-RUNTIME-SMOKE.md) |
| PR155+ | [PR-154-FOLLOW-UP-ROADMAP.md](./PR-154-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-154-CODEX-REVIEW-SCOPE.md](./PR-154-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-154-STRUCTURE-ANALYSIS.md](./PR-154-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-154-IMPLEMENTATION-PLAN.md](./PR-154-IMPLEMENTATION-PLAN.md) |
| UI | `AdminPublicSmokeExpansionPanel` |
| 코드 | `lib/ops/public-smoke-expansion.ts` |

## 테스트

| 파일 | 실행 |
| --- | --- |
| `tests/public/public-routes-smoke.test.ts` | `npx tsx --test tests/public/*.test.ts` |
| `tests/public/public-visibility.test.ts` | 동일 |
| `tests/ops/pr154-public-smoke-expansion.test.ts` | `npx tsx --test tests/ops/pr154-*.test.ts` |
| `scripts/smoke-public-routes.mjs` | `npm run smoke:public` (서버 필요) |

`npm run test:e2e` · `npm run test:smoke` — **명령 부재**

## 비범위

- package.json/lockfile 변경 · 신규 의존성
- 운영 DB · role · allowlist · 실제 공개

## 연계

| PR | 문서 |
| --- | --- |
| PR153 | [PR-153-BETA-USER-NOTICE-PACK-OPS.md](./PR-153-BETA-USER-NOTICE-PACK-OPS.md) |
| PR147 | [PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md](./PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md) |
| PR155 | [PR-155-ADMIN-ACCESS-REGRESSION-OPS.md](./PR-155-ADMIN-ACCESS-REGRESSION-OPS.md) |

**실제 외부 공개·배포 실행 없음.**

## 판단 (PR154-A)

| 구분 | 판단 |
| --- | --- |
| Smoke 확장 (정적) | **Conditional Ready** |
| PR155 진입 | **Conditional Ready** |
| 런타임 HTTP smoke | **보류** (서버·test:e2e 부재) |

Critical(정적) 0

## Codex

**조건부 권장** — visibility·접근 차단
