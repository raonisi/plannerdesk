# Admin CRUD Operations — Permissions & Visibility (PR-ADMIN-01)

Operational memo for PlannerDesk admin content management after Auth/RBAC production hardening (PR-AUTH-01).

## Prerequisites

- PR-AUTH-01 merged: `/admin` layout guards, `lib/auth/access.ts`, Auth.js production config
- Admin roles assigned in `User.role`: `super_admin` or `content_admin`

## Role permissions

| Action | super_admin | content_admin | Others |
|--------|-------------|---------------|--------|
| Access `/admin` shell | Yes | Yes | No (locked / denied UI) |
| Insurer CRUD | Yes | Yes | Blocked (server action) |
| Claim document CRUD | Yes | Yes | Blocked (server action) |
| Publish / unpublish | Yes | Yes | Blocked (`requirePublisherAccess`) |
| User/role management | Yes (future) | No | No |

## Protection layers

1. **`app/admin/layout.tsx`** — `getAdminAccess()` blocks unauthenticated and non-admin users
2. **Module pages** — `getInsurerAdminAccess` / `getClaimDocumentAdminAccess` before Prisma reads (defense in depth)
3. **Server actions** — `requireInsurerContentManager`, `requireInsurerPublisher`, etc. (re-exported from `lib/auth/access.ts`)
4. **Unauthorized handling** — `lib/admin/actions.ts` → Korean error redirect, no silent failure

## Public visibility rule (canonical)

Defined in `lib/public/visibility.ts` and `lib/public/insurers.ts`:

```
visible ⟺ isPublished === true AND verificationStatus ∈ { verified, needs_review }
```

- **draft** — never on public routes (query filter + publish guard)
- **unpublished** — never on public routes (`isPublished: false`)
- **needs_review** — may appear publicly with review badge
- **verified** — may appear publicly

Public read helpers:

- `getPublicInsurers()` — `/directory`, home, disclosure-links
- `getPublicClaimDocuments()` — `/claim-documents`

Admin draft/unpublished rows are never returned by these helpers.

## Publish guards

Server-side (authoritative):

- `parseInsurerForm` / `parseClaimDocumentForm` — reject `isPublished=true` + `verificationStatus=draft`
- `setInsurerPublished` / `setClaimDocumentPublished` — re-read verification status before publish

After any write or publish toggle, `revalidatePublicContentPaths()` refreshes `/`, `/directory`, `/claim-documents`, `/disclosure-links`.

## Operator safety copy

Shared copy in `lib/admin/safety-copy.ts`, surfaced via `AdminSafetyNotice` on admin pages:

- Official source verification before publish
- Draft never appears on public surfaces
- needs_review may appear with review badge
- No customer PII or medical records in admin fields
- PlannerDesk does not judge claim payout eligibility or amounts

## QA checklist

- [ ] Unauthenticated `/admin` → login required
- [ ] Non-admin authenticated user → access denied
- [ ] content_admin can CRUD insurers and claim documents
- [ ] Publish draft record → server rejection with Korean message
- [ ] Public `/directory` and `/claim-documents` show no draft/unpublished DB rows
- [ ] needs_review published records visible on public with badge

## Out of scope

- Prisma schema / migrations
- KnowledgeArticle, CorrectionRequest, CommunityPost models
- AI, community, file upload, customer PII storage, medical data handling
