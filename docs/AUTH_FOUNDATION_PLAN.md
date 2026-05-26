# Auth Foundation Plan

## A. Purpose
PlannerDesk requires authentication before implementing any admin CRUD operations. Currently, the public MVP pages remain public and static.
Authentication will later protect:
- `/admin` shell
- Content management pages
- Create, update, publish, and archive actions
- Verification status changes
- Future audit logs
- Future user and role management

## B. Current Status
- Public MVP exists.
- Prisma foundation exists.
- Neon is prepared but public pages do not depend on DB queries yet.
- **Auth.js v5 foundation is installed** (PR-17): `next-auth@5.0.0-beta.31`.
- Auth.js config exists at `auth.ts` with JWT session strategy and no providers.
- Route handler exists at `app/api/auth/[...nextauth]/route.ts`.
- No real login providers are configured yet.
- No Prisma Adapter is connected.
- No database-backed auth tables exist.
- RBAC is not implemented.
- Admin UI is not implemented.
- Admin CRUD is not implemented.
- No customer data is stored.
- No customer medical documents are processed.
- No BOA CRM or Aiven connection exists.

## C. Recommended Auth Approach
Auth.js / NextAuth-based authentication may be introduced later.
- Start with minimal admin authentication.
- Use server-side checks for protected admin access.
- Use Railway Variables for `AUTH_SECRET` and `AUTH_URL`.
- Do not expose auth secrets to GitHub.

### Login Strategy Options
- **Option 1**: Email allowlist + provider login. Only allow pre-approved admin emails. Good for early private admin, lower complexity. Requires provider setup and allowlist handling.
- **Option 2**: Database-backed admin user roles. Better long-term, requires user/account/session tables and RBAC. Higher implementation risk, requires manual review.
- **Option 3**: Password-only admin login. Not preferred unless implemented carefully. Requires secure hashing, rate limiting, session protection, and lockout strategy. Avoid in early MVP unless there is a clear reason.

### Recommendation
- Do not implement auth in this PR.
- Plan Auth.js foundation first.
- Start with a minimal protected admin shell in a later PR.
- Add DB-backed roles only after schema and RBAC design are approved.

## D. Required Future Environment Variables
Future environment variables (conceptual only):
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXTAUTH_SECRET` (only if using NextAuth v4 compatibility)
- `NEXTAUTH_URL` (only if using NextAuth v4 compatibility)
- `AUTH_GOOGLE_ID` (if Google OAuth is introduced later)
- `AUTH_GOOGLE_SECRET` (if Google OAuth is introduced later)
- `AUTH_KAKAO_ID` (if Kakao OAuth is introduced later)
- `AUTH_KAKAO_SECRET` (if Kakao OAuth is introduced later)
- `AUTH_NAVER_ID` (if Naver OAuth is introduced later)
- `AUTH_NAVER_SECRET` (if Naver OAuth is introduced later)

**Rules:**
- Real values must be set only in Railway Variables.
- Real values must never be committed.
- Real values must never be written in docs.
- `.env.example` may contain placeholders only.
- Do not add or inspect actual secrets in this PR.

## E. Auth Data Model Planning
If Auth.js database adapter is used later, future schema may need:
- `User`
- `Account`
- `Session`
- `VerificationToken`

PlannerDesk-specific role fields may need:
- `role`
- `status`
- `verificationStatus`
- `createdAt`
- `updatedAt`

**Important:**
- Do not create these models in this PR.
- Do not add migrations in this PR.
- Do not decide final schema in this PR.
- Auth/RBAC schema must be reviewed manually before implementation.

## F. Admin Role Relationship
Connects auth plan to PR-15 admin access plan.

Future roles:
- `super_admin`: manages system-level settings and content admins.
- `content_admin`: can manage content only.
- `moderator`: later only, for future community features.
- `verified_planner`: later only.

**Rules:**
- `verified_planner` is not an admin.
- `content_admin` can manage content only.
- User roles must be checked server-side.
- Admin status must not rely only on frontend hiding.

## G. Protected Route Planning
Future protected routes may include:
- `/admin`
- `/admin/insurers`
- `/admin/claim-documents`
- `/admin/disclosure-links`
- `/admin/message-templates`

**Rules:**
- This PR must not create these routes.
- Future admin routes must reject unauthenticated users.
- Future admin write actions must check role server-side.
- Public pages must remain accessible without login.
- Public pages should not import server-only auth helpers unnecessarily.

## H. Server-Side Authorization Principles
- Never rely only on frontend visibility.
- Protected reads and writes must be enforced server-side.
- Admin write actions must validate role.
- Public pages must not expose private admin state.
- Admin sessions should not leak to public UI.
- Future admin APIs or server actions must reject unauthenticated users.
- Future role changes require audit logging.

## I. Security Requirements
- No secrets in GitHub.
- No `.env` commit.
- Railway Variables only.
- No real `AUTH_SECRET` in docs.
- No OAuth provider secrets in docs.
- No BOA CRM database connection.
- No Aiven connection.
- No customer data in seed/example files.
- No customer medical data.
- No file upload until upload security plan exists.
- Session/cookie security must be reviewed before auth implementation.
- Rate limiting strategy should be considered before public login.

## J. Manual Approval Required Before Implementation
Future PRs must not be auto-merged if they include:
- Auth.js / NextAuth package installation
- Auth route handlers
- Login/logout pages
- Middleware
- Session provider
- RBAC code
- User/session/account tables
- Prisma migrations
- Admin protected writes
- OAuth provider configuration
- Secrets/env changes
- Billing
- File upload
- Customer data
- Medical/sensitive data
- BOA CRM connection
- Aiven connection
- Destructive database changes
- Production data access

## K. Recommended Future Implementation Order
Recommend:
1. ~~**PR-17** Auth.js foundation implementation~~ ✅ Done
2. **PR-18** Minimal protected admin shell, manual approval required
3. **PR-19** Admin role/RBAC foundation, manual approval required
4. **PR-20** Insurer model + migration, manual approval required
5. **PR-21** Insurer directory admin CRUD, manual approval required
6. **PR-22** Audit log foundation, manual approval required

## L. Out of Scope
This planning PR does not implement:
- auth code
- login pages
- route protection
- RBAC
- database tables
- migrations
- OAuth
- admin UI
- admin CRUD
- customer data handling
