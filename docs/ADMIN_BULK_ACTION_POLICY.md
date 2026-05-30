# Admin Bulk Action Policy

PR-ADMIN-BULK-00 — shared foundation for PlannerDesk admin bulk operations.

## Scope

| In scope (this PR) | Out of scope (future PRs) |
|--------------------|---------------------------|
| Selection UI pattern | Actual Prisma bulk writes |
| Toolbar + confirm dialog + result summary | Auto-publish on production |
| Domain bulk policies (`lib/admin/bulk-policies.ts`) | Import script execution from toolbar |
| Global forbidden operations list | Schema / migration changes |

### Domains

| Domain | Admin route | Bulk UI in BULK-00 |
|--------|-------------|-------------------|
| `insurers` | `/admin/insurers` | Policy + components ready |
| `claimDocuments` | `/admin/claim-documents` | Policy + components ready |
| `knowledgeArticles` | `/admin/knowledge` | Policy + components ready |
| `disclosureLinks` | (future) | Policy only — **buttons hidden**, “준비 중” |
| `messageTemplates` | (future) | Policy only — **buttons hidden**, “준비 중” |

## Components

| File | Role |
|------|------|
| `components/admin/bulk/AdminBulkSelectionBar.tsx` | Selected count, select all, clear |
| `components/admin/bulk/AdminBulkToolbar.tsx` | Action buttons from domain policy |
| `components/admin/bulk/AdminBulkConfirmDialog.tsx` | Confirm copy + publish rules |
| `components/admin/bulk/AdminBulkResultSummary.tsx` | Requested / succeeded / skipped / failed |
| `components/admin/bulk/AdminBulkFoundation.tsx` | Composed demo wiring (preview-only) |

Import from `@/components/admin/bulk` or individual files.

## Actions

| Action ID | Label (KO) | Risk | Permission |
|-----------|--------------|------|------------|
| `markNeedsReview` | 일괄 검수 필요로 변경 | low | `manageContent` |
| `markVerified` | 일괄 검수 완료로 변경 | medium | `manageContent` |
| `setPublishedFalse` | 일괄 비공개 | low | `manageContent` |
| `setPublishedTrue` | 일괄 공개 | high | `publishContent` |
| `archive` | 일괄 보관 | medium | `manageContent` |
| `importDrafts` | 일괄 등록(초안) | blocked | `superAdmin` (planned) |

`importDrafts` stays **planned** — no toolbar enablement until a dedicated import PR.

### Domain support matrix

| Action | insurers | claimDocuments | knowledgeArticles | disclosureLinks | messageTemplates |
|--------|----------|----------------|-------------------|-----------------|------------------|
| markNeedsReview | ✓ | ✓ | ✓ | — | — |
| markVerified | ✓ | ✓ | ✓ | — | — |
| setPublishedFalse | ✓ | ✓ | ✓ | — | — |
| setPublishedTrue | ✓ | ✓ | ✓ | — | — |
| archive | — | — | ✓ | — | — |
| importDrafts | planned | planned | planned | planned | planned |

## Publish rules (canonical)

1. **draft** — must not be bulk-published (`verificationStatus` or `status`).
2. **archived / rejected** (knowledge) — must not be bulk-published.
3. **needs_review** — may publish with public “검수 필요” badge (existing public fetch rules).
4. **verified** — may publish when `isPublished=true` and other visibility checks pass.

Align server actions with:

- `lib/public/visibility.ts` (insurers, claim documents)
- `lib/public/knowledge-articles.ts` (knowledge)

## RBAC

| Role | Bulk capabilities |
|------|-------------------|
| `content_admin` | Status changes (needs review, verified), unpublish, archive (knowledge) |
| `super_admin` | Same as content_admin + future user-facing bulk import approval |
| Publish (`setPublishedTrue`) | `canPublishContent` — use `requirePublisherAccess` / `requireContentManagerAccess` in server actions |

**Never rely on client UI alone.** Each domain PR must call `requireContentManagerAccess` or `requirePublisherAccess` before writes.

## Safety rules

1. **Confirm required** before any bulk write (dialog copy in `bulk-policies.ts`).
2. **Result summary required** after run (`AdminBulkResultSummary`).
3. **Dry-run / preview first** — domain actions should support preview counts before `--apply` where writes are heavy.
4. **`isPublished=true`** — highest scrutiny; skip rows that fail `wouldPublishDraft` / `wouldPublishBlocked`.
5. **Forbidden globally:**
   - `aiUsable` bulk `true`
   - File-upload bulk import
   - Customer PII / medical record bulk import
   - Insurance payout / loss-adjustment misleading content import
   - Production auto-publish without review

## Foundation behavior (BULK-00)

- `AdminBulkFoundation` with `previewMode={true}` (default) performs **zero** database writes.
- Confirm shows `ADMIN_BULK_FOUNDATION_NOTICE` and result summary reports `succeeded: 0`, `skipped: N`.

## Next PRs (recommended)

| PR | Focus | Risk |
|----|-------|------|
| PR-ADMIN-BULK-01 | Insurers bulk server actions + list integration | medium |
| PR-ADMIN-BULK-02 | Claim documents bulk actions | medium |
| PR-ADMIN-BULK-03 | Knowledge articles bulk actions | high (publish + archive) |
| PR-ADMIN-BULK-04 | Disclosure links (after admin CRUD exists) | low |
| PR-ADMIN-BULK-05 | Message templates (after admin CRUD exists) | medium |

Each follow-up PR should:

1. Add `app/admin/<domain>/bulk-actions.ts` with RBAC guards.
2. Wire checkboxes on list pages to `AdminBulkSelectionBar` / `AdminBulkToolbar`.
3. Set `previewMode={false}` only after integration tests pass.

## References

- `lib/admin/bulk-policies.ts`
- `lib/auth/access.ts` — `requireContentManagerAccess`, `requirePublisherAccess`
- `docs/KNOWLEDGE_CONTENT_POLICY.md`
