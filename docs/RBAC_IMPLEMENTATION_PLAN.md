# RBAC Implementation Plan

## A. Purpose
PlannerDesk requires a detailed implementation plan before writing any Role-Based Access Control (RBAC) runtime code. 
This ensures we map database relationships, server actions, route middleware, and helpers accurately, preventing security bypasses or authorization leakage.

## B. Current State
- **Auth.js v5 Foundation**: Installed and configured with Prisma Adapter (`@auth/prisma-adapter`) and a JWT session strategy.
- **`/admin` Shell**: Server-side role-protected admin shell page implemented (PR-24) using centralized helpers.
- **RBAC**: Centralized role helper utilities (`lib/auth/rbac.ts`) are implemented (PR-23) and applied to `/admin` shell (PR-24).
- **Admin CRUD**: Still not implemented.
- **Prisma Foundation**: Prisma is configured with active `User`, `Account`, `Session`, and `VerificationToken` models (PR-22).
- **Neon PostgreSQL**: Connected and database-backed auth schema applied via migration (PR-22).
- **Public MVP Surface**: Fully operational and static. Public pages must remain completely accessible.

## C. Recommended Implementation Order
1. **Auth Database Schema Planning**: Plan `User`, `Account`, `Session`, and `VerificationToken` tables. See [docs/AUTH_DATABASE_SCHEMA_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/AUTH_DATABASE_SCHEMA_PLAN.md).
2. **Auth Database Schema Migration**: Execute migrations to configure these tables in Neon PostgreSQL.
3. **Minimal Role Field Design**: Introduce `role` and `status` properties to the `User` schema.
4. **Centralized Authorization Helper Planning**: Centralized auth helpers are implemented in [lib/auth/rbac.ts](file:///c:/work/plannerdesk/plannerdesk-main/lib/auth/rbac.ts).
5. **Server-Side Admin Route Protection**: Gate admin shell layout and inner routes `/admin/*`.
6. **Admin CRUD Write Protection**: Apply role checking directly to Next.js Server Actions and APIs.
7. **Audit Log Foundation**: Build the schema and hook validation actions for logging admin writes.
8. **Role Management UI**: Introduce super-admin screens to manage permissions and admin users.

## D. Role Storage Options
We compare two conceptual approaches for role storage:

### Option 1: `role` field on the `User` table (Recommended for MVP)
- **Mechanism**: Add a simple string/enum field `role` directly to the `User` schema.
- **Pros**: Low complexity, fast queries, zero join queries, easy integration with NextAuth JWT callback.
- **Cons**: Less flexible if we need dynamic custom permission groupings.
- **Verdict**: Start with this option for the PlannerDesk MVP to maintain velocity and minimize DB complexity.

### Option 2: Separate `Role` and `Permission` tables
- **Mechanism**: Models representing Roles linked to Users, containing many-to-many relationships with specific Permissions.
- **Pros**: Highly granular, supports runtime customization of role scopes.
- **Cons**: High initial migration risk, complex prisma schema joins.
- **Verdict**: Revisit only after the verified planner community or agency billing layers ship.

## E. Future Role Values
Planned string values for roles:
- `super_admin`: Platform administrator (operates system settings, role controls, full CRUD, audits).
- `content_admin`: Editorial manager (curates public insurer directory and claims, cannot manage settings/users).
- `moderator`: Community manager (future community-only posts moderation, no access to admin CRUD).
- `verified_planner`: Authenticated insurance planner (non-admin, accesses verified-only public features).
- `anonymous_public`: Public visitor (unauthenticated, read-only access to published content).

**Rules:**
- `verified_planner` must never receive admin permissions.
- `moderator` is community-only and has no directory access.
- `anonymous_public` is blocked from `/admin` and API write actions.

## F. Authorization Helper Design
Centralized auth helpers are implemented in [lib/auth/rbac.ts](file:///c:/work/plannerdesk/plannerdesk-main/lib/auth/rbac.ts).
They define role constants (`ROLE_SUPER_ADMIN`, `ROLE_CONTENT_ADMIN`, etc.), type definitions (`PlannerDeskRole`, `AdminRole`, `NonAdminRole`), and pure validator functions:
- `normalizeRole(role)`: Normalizes dynamic role strings into valid role types with fallback.
- `isAdminRole(role)`: Validates if a role belongs to the administrative set.
- `isSuperAdmin(role)`: Confirms if a role matches the super administrator.
- `isContentAdmin(role)`: Confirms if a role matches the content manager.
- `canAccessAdmin(userOrSession)`: Evaluates general access to the administrative module.
- `canManageContent(userOrSession)`: Evaluates read/write capabilities on directory schemas.
- `canPublishContent(userOrSession)`: Validates publishing access for directories.
- `canManageUsers(userOrSession)`: Validates user directory creation and permissions.

## G. Server-Side Enforcement Rules
- **Never rely on UI hiding**: Frontend checks (hiding menus or tabs) are solely for UI/UX. The backend APIs, Server Actions, and dynamic server components must independently check active roles.
- **Validate on every write**: All creates, updates, status modifications, publish actions, and archives must invoke role validators server-side.
- **Sanitize admin state**: Drafts, verification audits, and internal logging state must not leak to public API responses.
- **Public data constraints**: Public pages must read only database records where `isPublished = true` and `verificationStatus = 'verified'`.

## H. Future Admin Route Protection
We will protect routes under `/admin` using Next.js layouts or middleware checking:
- `/admin` (Dashboard Shell) - Requires role `super_admin` or `content_admin`.
- `/admin/insurers` (Insurers CRUD) - Requires role `super_admin` or `content_admin`.
- `/admin/claim-documents` (Forms CRUD) - Requires role `super_admin` or `content_admin`.
- `/admin/disclosure-links` (Links CRUD) - Requires role `super_admin` or `content_admin`.
- `/admin/message-templates` (Templates CRUD) - Requires role `super_admin` or `content_admin`.
- `/admin/audit-logs` (Audit Viewer) - Requires role `super_admin` only.
- `/admin/users` (Roles Manager) - Requires role `super_admin` only.

## I. Future Permission Matrix Implementation
Our code should map the permission matrix cleanly:
- `super_admin` matches wildcard permissions `*` for admin pages and system tools.
- `content_admin` matches restricted resources (`insurer`, `claim-document`, `disclosure-link`, `message-template`).
- `moderator` is blocked from all `/admin` routes.
- `verified_planner` is blocked from all `/admin` routes.
- `anonymous_public` is blocked from all `/admin` routes.

## J. Prisma Impact Planning
When database storage for user profiles is approved:
- `schema.prisma` will be updated to define the default NextAuth models (`User`, `Account`, `Session`, `VerificationToken`).
- The `User` model will include a `role` field (e.g. enum or string).
- Resource schemas (`Insurer`, `ClaimDocument`, etc.) will include auditing fields:
  - `createdBy` string (user ID reference)
  - `updatedBy` string (user ID reference)
- All schema updates will require manual migration validation.

## K. Audit Requirements
All write events under `/admin` must log:
- `actorUserId` (String)
- `actorRole` (String)
- `action` (e.g. `CREATE`, `UPDATE`, `PUBLISH`, `ARCHIVE`)
- `targetType` (e.g. `Insurer`, `ClaimDocument`)
- `targetId` (String)
- `beforeValue` (JSON Snapshot)
- `afterValue` (JSON Snapshot)
- `createdAt` (DateTime)
- `metadata` (JSON - IP addresses, user agent)

## L. Testing Requirements for Future RBAC PR
Unit/Integration test scenarios:
1. **Anonymous Public**: Attempting to fetch `/admin` redirects to login or fails with HTTP 401.
2. **Verified Planner**: Attempting to fetch `/admin` returns HTTP 403.
3. **Content Admin**: Accessing `/admin/insurers` succeeds, but accessing `/admin/users` or `/admin/audit-logs` returns HTTP 403.
4. **Super Admin**: Accessing `/admin/*` succeeds.
5. **Direct API Attacks**: Performing Server Actions for updates directly via fetch with non-admin sessions returns HTTP 403.
6. **Static Safety**: Confirm no static build paths expose authenticated state templates.

## M. Security Rules
- **Railway Variables only**: No OAuth secrets, database passwords, or auth secrets in git.
- **No Aiven or BOA CRM**: We must not reuse connections, user logins, or databases from BOA CRM.
- **Strict Role Verification**: Do not permit client-side authentication bypasses.
- **Safe Defaults**: Any user without an explicit role must default to the lowest privilege (`anonymous_public`).

## N. Manual Approval Required
Future PRs containing code in these categories require manual review:
- RBAC implementations and validation middleware.
- Schema migrations adding tables/fields for roles.
- NextAuth adapters and user/session tables.
- Server Actions with write operations.
- Admin UI layout files.
- Environment variables or secrets config.
- Billing integration.
- File upload handlers.
- customer personal data or medical records.
- BOA CRM connections.

## O. Recommended Next PRs
1. ~~**PR-21**: Auth database schema planning~~ ✅ Done
   - See [docs/AUTH_DATABASE_SCHEMA_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/AUTH_DATABASE_SCHEMA_PLAN.md)
2. ~~**PR-22**: Auth DB schema + adapter implementation~~ ✅ Done
3. ~~**PR-23**: Minimal RBAC helper implementation~~ ✅ Done
4. **PR-24**: Admin route server-side role protection, manual approval required (Current)
5. **PR-25**: Insurer model + migration, manual approval required
6. **PR-26**: Insurer admin CRUD, manual approval required
7. **PR-27**: Audit log planning or foundation, manual approval required
