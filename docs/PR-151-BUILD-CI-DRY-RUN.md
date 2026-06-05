# PR-151 — Build / CI / Deployment Dry Run

`BUILD_CI_DRY_RUN` 기준.

- `package.json` build: `prisma generate && next build` (migrate deploy 없음)
- `.github/workflows/ci.yml`: build 실행, migrate deploy 명시적 미포함
- 운영 DB 접근: CI·build에서 의도적 없음
- rollback·halt: PR143·PR148·PR116
