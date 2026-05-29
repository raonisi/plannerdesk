# Auth.js & Admin RBAC — Production Readiness (PR-AUTH-01)

Operational memo for PlannerDesk admin authentication and role-based access control before DB-backed Admin CRUD expansion.

## Roles

| Role | `/admin` access | Content CRUD | Publish | User/role management |
|------|-----------------|--------------|---------|----------------------|
| `super_admin` | Yes | Yes | Yes | Yes (future) |
| `content_admin` | Yes | Yes | Yes | No |
| All others | No | No | No | No |

Role values are stored on `User.role` in PostgreSQL and mirrored into the JWT/session via `auth.ts` callbacks.

## Environment variables

Set in Railway Variables or local `.env.local` only. **Never commit real values.**

| Variable | Required | Purpose |
|----------|----------|---------|
| `AUTH_SECRET` | Production yes | Signs session cookies and JWT |
| `AUTH_URL` | Production yes | Canonical app URL for Auth.js |
| `DATABASE_URL` | Yes (with adapter) | Prisma user/account persistence |
| `AUTH_GOOGLE_ID` | For Google login | OAuth client ID |
| `AUTH_GOOGLE_SECRET` | For Google login | OAuth client secret |

Legacy aliases `NEXTAUTH_SECRET` / `NEXTAUTH_URL` are accepted for migration.

Generate a secret locally: `npx auth secret`

## Protection layers

1. **`app/admin/layout.tsx`** — Server layout calls `getAdminAccess()`. Unauthenticated users see `AdminLockedState`; non-admin roles see `AdminAccessDeniedState`.
2. **`lib/auth/access.ts`** — Shared helpers: `getAdminAccess`, `requireAdminAccess`, `requireContentManagerAccess`, `requirePublisherAccess`, `requireSuperAdminAccess`.
3. **`lib/auth/rbac.ts`** — Pure permission checks (`canAccessAdmin`, `canManageContent`, etc.).
4. **Server actions** — Insurer and claim-document modules call `requireInsurerContentManager` / `requireClaimDocumentPublisher` (re-exported from `lib/auth/access.ts`) before any write.

Public routes (`/`, `/directory`, `/claim-documents`, `/knowledge`, etc.) remain unauthenticated. No edge middleware blocks public pages.

## Operator QA checklist

- [ ] Unauthenticated visit to `/admin` → login required screen
- [ ] Authenticated user without admin role → access denied + sign-out option
- [ ] `content_admin` → dashboard, insurers, claim-documents CRUD
- [ ] `super_admin` → same as content_admin today; future user management gated by `canManageUsers`
- [ ] Public pages load without session
- [ ] `AUTH_SECRET` set in Railway before production cutover
- [ ] Google OAuth credentials set before enabling sign-in

## Out of scope (this PR)

- Prisma schema / migrations
- New Admin CRUD modules
- KnowledgeArticle / CorrectionRequest models
- Community, AI API, customer PII, medical data
