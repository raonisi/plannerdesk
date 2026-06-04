# PR-105: Build vs DB Migration Separation

**Purpose:** `npm run build` must not apply Prisma migrations to any database. Migration deploy is an explicit, operator-controlled step.

## Script responsibilities

| Command | What it does | Touches DB? |
| --- | --- | --- |
| `npm run build` | `prisma generate` + `next build` | **No** (generate only) |
| `npm run verify` | lint + test + typecheck + build | **No** |
| `npm run db:migrate:deploy` | `prisma migrate deploy` | **Yes** — requires `DATABASE_URL` / `DIRECT_URL` |
| `npm run release:migrate` | Alias for production migration deploy | **Yes** — operator-only |

## CI (GitHub Actions)

- Runs `typecheck`, `lint`, `test`, and `build`.
- **Does not** run `db:migrate:deploy` or `release:migrate`.
- Safe without production database credentials.

## Railway / production release order

1. Merge reviewed migration SQL in `prisma/migrations/` (separate PR when schema changes).
2. **Operator:** confirm target environment, backup/rollback plan, and pending migrations.
3. **Operator:** run `npm run release:migrate` (or `npm run db:migrate:deploy`) against the target DB with approved env vars.
4. Deploy app build using `npm run build` (Railway build command) — migrations are **not** applied during build.
5. Start with `npm run start`.

## Never during PR-105 validation

- Do not run `db:migrate:deploy` / `release:migrate` against production from this task.
- Do not create new migrations or change `prisma/schema.prisma` in this PR.

## Rollback

- Revert `package.json` scripts and restore prior `build` line if a pipeline still expects migrate-in-build (not recommended).
- Schema rollback remains a separate DBA/operator procedure; this PR only separates commands.
