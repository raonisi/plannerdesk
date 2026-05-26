# RBAC Foundation Plan

## A. Purpose
PlannerDesk requires a structured Role-Based Access Control (RBAC) foundation prior to implementing any admin CRUD operations. 
An authorization framework prevents security regressions, accidental data exposure, or integration leakage.
RBAC will protect:
- `/admin` dashboard shell access
- Content management panels and forms
- Write actions (create, update, publish, archive) on public resources
- Record verification status changes
- Future audit logging systems
- Future administrator and user role management

## B. Current Status
- **Public MVP Surface**: Active and composed primarily of static or client-side placeholder directories.
- **Auth.js v5 Foundation**: Installed (PR-17) using `next-auth@5.0.0-beta.31` and configured with a JWT session strategy (no DB tables required).
- **Minimal /admin Shell**: Implemented (PR-18) using server-side session checks via `auth()`.
- **Prisma Foundation**: Configured (from PR-14) in `prisma/schema.prisma` with no active business or user models.
- **Neon PostgreSQL**: Planned and prepared, but **not utilized** by public runtime pages yet.
- **RBAC**: Not implemented.
- **Admin CRUD**: Not implemented.
- **Customer Data**: No customer data is stored, processed, or handled.
- **Customer Medical Documents**: No medical files, OCR workflows, or sensitive customer claims exist.
- **System Separation**: PlannerDesk is completely separate from BOA CRM. No connection to Aiven or the BOA CRM database exists.

## C. Planned Roles
The following roles are conceptually planned to govern platform access:

### 1. `super_admin`
- **Scope**: Platform owner/operator.
- **Privileges**:
  - Full read and write permissions across all content management modules.
  - Can publish, archive, restore, and verify any content.
  - Can manage other administrators (content admins) and modify roles later.
  - Can review system configurations and audit logs.
- **Boundary**: Strict access control limited only to system operators.

### 2. `content_admin`
- **Scope**: Public content managers and curators.
- **Privileges**:
  - Can view, create, edit, and update content resources (insurers, claims, disclosure links, message templates).
  - Can flag content for review (`needs_review`) or submit verification requests.
  - Can publish content if explicitly authorized by policy, but cannot modify system settings.
- **Boundary**:
  - Cannot manage system billing.
  - Cannot manage user accounts or modify permissions.
  - Cannot access customer-facing data or settings.

### 3. `moderator`
- **Scope**: Reserved for future verified planner community features.
- **Privileges**: Can moderate planner posts, comments, and community discussions.
- **Boundary**:
  - No access to insurer directories, claim document warehouses, or reference links.
  - Not needed for the initial Admin CRUD launch.
  - Should not be implemented until community features are officially introduced.

### 4. `verified_planner`
- **Scope**: Premium public user account (verified insurance planners).
- **Privileges**: Accesses premium tools and verified community features.
- **Boundary**:
  - **Not an admin role.**
  - Absolutely no access to administrative dashboards, CRUD pages, or server-side write endpoints.

### 5. `anonymous_public`
- **Scope**: Default public visitor (unauthenticated).
- **Privileges**: Can view only fully published resources on public-facing screens.
- **Boundary**: Blocked from all administrative routes and draft content.

## D. Role Hierarchy
The administrative role hierarchy is defined as:
```
[super_admin] ──> [content_admin]
```
- `super_admin` has system-wide permissions and supersedes `content_admin`.
- `moderator` is a separate, future-only track for community interactions.
- `verified_planner` is a public-facing role with no administrative privileges.
- `anonymous_public` is public-only.

**Hierarchy Rules:**
- A higher role does not automatically inherit every future permission unless explicitly declared.
- Broad implicit permissions should be avoided; instead, prefer explicit permission checks per action.

## E. Permission Matrix
Conceptual layout for administrative resources and roles:

| Resource / Action | `super_admin` | `content_admin` | `moderator` | `verified_planner` | `anonymous_public` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Access `/admin` Shell** | Yes | Yes | No | No | No |
| **Create/Edit Resources** | Yes | Yes | No | No | No |
| **Publish/Unpublish** | Yes | Yes (Conditional) | No | No | No |
| **Archive/Restore** | Yes | No | No | No | No |
| **Verify Status Change** | Yes | Yes | No | No | No |
| **View Audit Logs** | Yes | No | No | No | No |
| **User Role Management** | Yes | No | No | No | No |
| **Community Moderation** | Later | No | Later (Only) | No | No |

## F. Server-Side Authorization Principles
- **Never rely only on frontend visibility**: Direct route access, Next.js Server Actions, and API Route handlers must check authentication and roles on the server. Hiding components in the UI is a user experience enhancement, not a security boundary.
- **API and Action Gatekeeping**: Any administrative API or Server Action must immediately throw an HTTP `401 Unauthorized` or `403 Forbidden` if the session's role is insufficient.
- **Public/Private Separation**: Public-facing views must never query or load draft content or admin-specific configurations.
- **Centralized Authorization Helpers**: Avoid duplicated checking logic across files. Role validation should be performed using centralized helpers.

## G. Future RBAC Helper Planning
Future codebases will implement helpers to enforce authentication checks. These helper interfaces are planned as follows:

```typescript
// Proposed helpers (Not to be implemented in this PR)
export async function getCurrentUser();
export async function requireAdmin();
export async function requireRole(role: string);
export async function requireAnyRole(roles: string[]);
export async function canManageContent(user: any): boolean;
export async function canPublishContent(user: any): boolean;
export async function canManageUsers(user: any): boolean;
```

## H. Public and Admin Boundary
Clear boundaries between public and admin routes:

### Public Routes (Accessible without authentication)
- `/` (Landing Page)
- `/directory` (Insurer Directory)
- `/claim-documents` (Claim Form Library)
- `/disclosure-links` (Disclosure Directory)
- `/message-templates` (Message Template Library)

### Protected Routes (Require active authentication & role authorization)
- `/admin` (Dashboard Shell)
- `/admin/insurers` (Insurer Directory CRUD)
- `/admin/claim-documents` (Claim Documents CRUD)
- `/admin/disclosure-links` (Disclosure Link Curation)
- `/admin/message-templates` (Template Curation)
- `/admin/audit-logs` (System Audit Curation - future)
- `/admin/users` (Administrator accounts management - future super_admin only)

## I. Data Model Planning
Conceptual role storage models:

### Option 1 (Recommended for MVP)
Add a `role` field directly to the `User` table:
```prisma
enum Role {
  super_admin
  content_admin
  moderator
  verified_planner
}
```
This is simple, fast, and does not require complex relations for an early MVP.

### Option 2
Separate `Role` and `Permission` tables joined by relations. Recommended only when permission demands grow significantly. Not needed for MVP.

*Note: No migrations or Prisma schema changes should be added in this planning PR.*

## J. Admin CRUD Permission Planning
Action matrices for resources:

### 1. Insurer Directory
- `super_admin`: Create, Read, Update, Publish, Archive, Restore
- `content_admin`: Create, Read, Update, Request Publish, Publish (if approved)
- `moderator` / `verified_planner` / `anonymous_public`: Read (Published only)

### 2. Claim Documents
- `super_admin`: Create, Read, Update, Publish, Archive, Restore
- `content_admin`: Create, Read, Update, Request Publish, Publish (if approved)
- `moderator` / `verified_planner` / `anonymous_public`: Read (Published only)

### 3. Disclosure Links
- `super_admin`: Create, Read, Update, Publish, Archive, Restore
- `content_admin`: Create, Read, Update, Request Publish, Publish (if approved)
- `moderator` / `verified_planner` / `anonymous_public`: Read (Published only)

### 4. Message Templates
- `super_admin`: Create, Read, Update, Publish, Archive, Restore
- `content_admin`: Create, Read, Update, Request Publish, Publish (if approved)
- `moderator` / `verified_planner` / `anonymous_public`: Read (Published only)

## K. Verification and Publishing Workflow
- **Draft Defaults**: All new records must default to `draft`.
- **Draft Protection**: Drafts are completely hidden from public pages.
- **Review Requests**: When editing is complete, status changes to `needs_review`.
- **Manual Verification**: Status is set to `verified` only after manual review of the official source.
- **Public Visibility**: The `isPublished` Boolean flag controls public display.
- **Fallback Content**: Missing fields display `"공식 확인 후 업데이트 예정"`.

## L. Audit Log Requirements
Administrative changes must log the following structure:
- `actorUserId`: ID of the admin making the change.
- `actorRole`: Role of the admin.
- `action`: `CREATE` | `UPDATE` | `PUBLISH` | `UNPUBLISH` | `ARCHIVE` | `RESTORE` | `VERIFY` | `ROLE_CHANGE`.
- `targetType`: Affected resource model.
- `targetId`: Resource ID.
- `beforeValue`: JSON snapshot before update.
- `afterValue`: JSON snapshot after update.
- `createdAt`: Timestamp.
- `metadata`: IP, Browser Client.

## M. Security Rules
- **No secrets in GitHub**: Real variables must live only in Railway.
- **No `.env` commits**: `.env` and `.env.local` must remain ignored.
- **No external database connections**: Absolutely no BOA CRM or Aiven connections allowed.
- **No customer data in test files**: Test seeds must use placeholder values.
- **No sensitive customer files**: File uploads or medical records are disallowed.
- **No client-side routing bypass**: Navigation guards must check authorization server-side.

## N. Manual Approval Required Before Implementation
The following changes are excluded from auto-merges:
- RBAC validation code or middleware
- Schema migrations adding roles or permissions
- Prisma user, account, session tables
- NextAuth adapters
- Server actions with write permissions
- Admin CRUD layout or logic files
- OAuth provider secrets or configurations
- Environment variable updates
- Billing or checkout system integration
- File uploads or storage integration
- Customer data schemas or APIs
- Direct DB queries by public components

## O. Recommended Future Implementation Order
1. ~~**PR-20**: RBAC implementation planning~~ ✅ Done
2. **PR-21**: Auth database schema planning, manual approval required
3. **PR-22**: Auth DB schema + migration, manual approval required
4. **PR-23**: Minimal RBAC helper implementation, manual approval required
5. **PR-24**: Admin route server-side role protection, manual approval required
6. **PR-25**: Insurer model + migration, manual approval required
7. **PR-26**: Insurer admin CRUD, manual approval required

## P. Out of Scope
This planning PR does not implement:
- Auth or RBAC code
- Session verification middleware
- Prisma migrations or database tables
- Insurer, claim, template, or link CRUD code
- OAuth providers or login pages
- Customer files or medical document ingestion
