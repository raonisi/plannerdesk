# Auth Database Schema Plan

## A. Purpose
PlannerDesk requires a dedicated Auth database schema plan before implementing database-backed authentication. This prevents security regressions and configuration errors.
The future auth database layer will eventually support:
- Admin user identity mapping
- Admin privilege scopes and roles
- Session and account persistence
- Role-based admin access control
- Audit log actor tracking
- Future verified planner accounts

## B. Current Status
- **Auth.js v5 Foundation**: Installed and configured with Prisma Adapter (`@auth/prisma-adapter`).
- **`/admin` Protected Shell**: Minimal server-side protected route implemented (gated by session existence).
- **Prisma Foundation**: Prisma configured with active `User`, `Account`, `Session`, and `VerificationToken` models.
- **Neon PostgreSQL**: Connected and schema applied via migration (`20260526045824_init_auth`).
- **Auth DB Schema**: Implemented.
- **Prisma Adapter**: Installed and configured.
- **User/Account/Session/VerificationToken Models**: Defined in `schema.prisma`.
- **RBAC Runtime**: Still not implemented.
- **Admin CRUD**: Still not implemented.
- **Customer Data**: No customer data is stored, processed, or handled.
- **Customer Medical Documents**: No medical files, OCR workflows, or sensitive customer claims exist.
- **System Separation**: PlannerDesk is completely separate from BOA CRM. No connection to Aiven or the BOA CRM database exists.

## C. Auth Persistence Options
We evaluate the conceptual persistence configurations:

### Option 1: JWT-only session without database persistence
- **Pros**: Lower initial database complexity. Does not require Auth DB tables. Faster response times as no DB reads are triggered on each request.
- **Cons**: Cannot track user states (such as active logins), cannot invalidate sessions centrally, and makes it harder to link actions to persistent user IDs for audit records.

### Option 2: Auth.js Prisma Adapter with database-backed users/accounts/sessions
- **Pros**: Better long-term stability. Standardized Auth.js schema, user identity persistence, easy role assignment, and robust database audit records.
- **Cons**: Requires active database migrations, setup of multiple tables, and manual schema verification.

### Option 3: Custom minimal admin identity table
- **Pros**: Potentially simpler than a full Auth.js adapter setup.
- **Cons**: High custom logic and security validation burden.
- **Verdict**: Not recommended.

### Recommendation
For PlannerDesk admin expansion, we plan to adopt **Option 2 (Auth.js Prisma Adapter)** carefully once real admin credentials and content curation tools ship. Do not implement any code in this PR.

## D. Future Auth.js Models Planning
Proposed models for `schema.prisma` mapping standard NextAuth structures conceptually:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(anonymous_public)
  status        UserStatus @default(active)
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

*Note: Do not add these models to the schema file in this planning PR.*

## E. PlannerDesk-Specific User Fields
We define the custom user fields conceptually:
- `role`: `super_admin` | `content_admin` | `moderator` | `verified_planner`
  - `super_admin`: Full admin controls.
  - `content_admin`: Editorial content management.
  - `moderator`: Reserved for future community moderation.
  - `verified_planner`: Standard planner account (non-admin).
- `status`: `active` | `invited` | `suspended` | `disabled`
- `verificationStatus`: `unverified` | `pending` | `verified`
  - Used for verified planner verification cycles later.

**Enforcement:**
- `verified_planner` is NOT an admin role and has no `/admin` access.
- Role checks must be server-side.

## F. Session Strategy Planning
- **JWT Strategy**: Kept as default for early phase. Simplifies environment testing without session writes.
- **Database Session Strategy**: Re-evaluated once multi-admin invitation features are planned. We will decide on database-backed sessions later. Do not change the session strategy in this PR.

## G. Admin Role Relationship
- `super_admin`: Platform operator (super-admin access).
- `content_admin`: Curates public insurers, claims, templates, and links. Excluded from role management and billing configs.
- `moderator`: Excluded from MVP admin panels; reserved for community posts only.
- `verified_planner`: Excluded from all `/admin` routes.
- `anonymous_public`: Excluded from all `/admin` routes and write APIs.

## H. Future Prisma Schema Impact
- Adding adapter models requires Prisma migrations.
- Schema adjustments (e.g. adding role/status/verificationStatus to `User`) require migration.
- Auditing models (`AuditLog`) will require reference mappings.
- No database migrations or schema updates are allowed in this PR.

## I. Railway and Environment Variables
- `AUTH_SECRET` and `AUTH_URL` must be set in Railway.
- `DATABASE_URL` and `DIRECT_URL` must be configured in Railway.
- OAuth keys (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, etc.) must live in Railway Variables.
- No real credentials may be committed or written in documents.

## J. BOA CRM / Aiven Separation
- PlannerDesk's authentication store must reside in its own Neon PostgreSQL instance.
- Absolutely no database connections to BOA CRM or Aiven.
- No customer credentials or medical files must be stored.

## K. Security Requirements Before Implementation
- Enforce server-side role validation on all protected Dynamic routes.
- Prevent automatic elevation of logins to `super_admin`.
- Verify oauth provider emails against an allowlist before permitting admin role assignment.
- Audit all role modification events.

## L. Initial Admin Bootstrap Planning
We compare bootstrap options for the first `super_admin`:
- **Option 1: Environment allowlist**: Validate early login emails against a list of pre-approved emails in the environment variables (conceptual only).
- **Option 2: DB seeding**: Run a seed script inserting the first `super_admin` record. (Requires strict seed file checks to avoid committing real emails).
- **Option 3: Invitation workflow**: Super-admin invites others. (Too complex for early MVP).

### Recommendation
Start with a manual, peer-reviewed bootstrap seed script (Option 2) or env allowlist check. Do not commit real admin emails.

## M. Testing Requirements for Future Auth DB PR
- Public routes must remain accessible without active session.
- Unauthenticated access to `/admin` returns HTTP 401.
- Non-admin role access to `/admin` returns HTTP 403.
- No prisma queries or database modifications can be executed without validating role constraints first.
- Migration files must be validated in local environments before production execution.

## N. Manual Approval Required
Any future PR containing code in these categories must undergo manual review:
- Prisma Adapter configurations.
- Models setup (`User`, `Account`, `Session`, `VerificationToken`).
- Role enum migrations.
- Admin bootstrap scripts or admin seed files.
- Credentials login or OAuth provider setup.
- BOA CRM connections.

## O. Recommended Future Implementation Order
1. ~~**PR-22**: Auth DB schema + adapter implementation~~ ✅ Done
2. **PR-23**: Minimal RBAC helper implementation, manual approval required (Current)
3. **PR-24**: Admin route server-side role protection, manual approval required
4. **PR-25**: Insurer model + migration, manual approval required
5. **PR-26**: Insurer admin CRUD, manual approval required
6. **PR-27**: Audit log planning or foundation, manual approval required

## P. Out of Scope
This planning PR does not implement:
- Auth.js Prisma adapter
- `schema.prisma` models
- DB migrations
- RBAC validation helpers
- Admin CRUD
- Admin bootstrap scripts
