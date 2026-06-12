# PR-BS-19C Public Work Tools Open Access by Completion Status

## Summary

- `/work-tools` is public — no login required.
- Login remains required for `/admin` only (admin guard unchanged).
- Only `complete` / `ready` tools render on Work Tools; unfinished and admin-only tools are omitted.
- Read-only `/api/work-tools/*` routes use `workToolsPublicReadRouteGuard` (no session).
- `workToolsRouteGuard` retained for future protected write routes.

## Registry

`lib/work-tools/work-tools-registry.ts` classifies tools by `status` and `visibility`.

Hidden by default override:

| Tool ID | Status | Reason |
| --- | --- | --- |
| `nonlife-mock` | `placeholder` | Mock exam data |
| `life-mock` | `placeholder` | Mock exam data |
| `variable-mock` | `placeholder` | Mock exam data |

All other registered tools default to `complete` + `public`.

## Public copy

`lib/work-tools/work-tools-public-copy.ts` and `components/work-tools/work-tools-public-notice.tsx` provide reference-only notices (no payout/claim certainty).

## Code search (PR-BS-18 + PR-BS-19C)

- Code search panels remain reference-only with forbidden certainty phrases.
- `isCodeSearchPublicAllowed()` returns true when registry marks code tools complete.
- Site-wide public search still excludes code domains (unchanged).

## Tests

- `tests/public/work-tools-open-access.test.ts`
- `tests/public/work-tools-completion-visibility.test.ts`
- `tests/public/work-tools-copy-safety.test.ts`
- `tests/ops/work-tools-admin-only-hidden.test.ts`
- `tests/ops/work-tools-unfinished-hidden.test.ts`
- `tests/ops/admin-login-only-boundary.test.ts`

## Out of scope

- No DB/schema/migration/package changes.
- Answer Assistant remains under `/planner/answer-assistant`.
- Admin operations remain under `/admin`.
