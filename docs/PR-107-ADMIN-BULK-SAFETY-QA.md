# PR-107 — Admin Bulk Safety QA

Safety-focused pass on admin bulk register / verify / status-change flows. No production DB access, no schema or auth structure changes.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Policy + server guard review | Production bulk runs |
| `validateServerBulkAction` on all wired domains | DB migrations |
| Unit tests (`tests/admin/bulk-safety.test.ts`, no Prisma) | `package.json` / lockfile edits |
| Antigravity handoff checklist | Commit / push / merge |

## Key files

| Area | Path |
|------|------|
| Policies | `lib/admin/bulk-policies.ts` |
| Runner / id limits | `lib/admin/bulk-run.ts` |
| Verification bulk writes | `lib/admin/bulk-verification-actions.ts` |
| Domain runners | `lib/admin/*-bulk-actions.ts` |
| Server actions | `app/admin/*/actions.ts` (`run*Bulk` + RBAC) |
| UI | `components/admin/bulk/*` |
| Policy doc | `docs/ADMIN_BULK_ACTION_POLICY.md` |

## Server guard (PR107)

`validateServerBulkAction(domain, actionId)` runs after session RBAC and before Prisma:

- Domain disabled → fail
- Action not in domain policy → fail
- `importDrafts`, `planned`, or `blocked` risk → fail
- Not in `IMPLEMENTED_BULK_DOMAINS` → fail

`parseBulkIds` enforces non-empty selection and max **50** ids per run.

## Manual QA checklist (no prod data)

1. Sign in as `content_admin` — bulk status actions work; publish actions require publisher role.
2. Sign in as non-admin — `/admin/*` redirects or unauthorized; bulk server actions unreachable.
3. Select 0 rows — toolbar disabled; direct action call returns “선택된 항목이 없습니다.”
4. Attempt `importDrafts` via forged action id — server returns policy block (if routed).
5. Publish bulk on rows in `draft` — UI blocks; server skips per `shouldSkipPublish` / knowledge visibility.

## Tests

```bash
npx tsx --test tests/admin/bulk-safety.test.ts
npm run test
```

`npm run test` still runs answer-assistant tests only (no `package.json` change in PR107). Run both commands before release.

## Antigravity review focus

- Forbidden / planned bulk operations stay blocked server-side
- Role checks remain in server actions (not UI-only)
- Empty / oversized id lists fail safely
- Tests do not connect to a database
