# PlannerDesk Operating QA Checklist

This document is the QA checklist for PlannerDesk MVP deployment, verification, and operation. It establishes standard guidelines for validating build integrity, route stability, role protection, and environment safety boundaries.

---

## A. Code and Build Integrity

Run the following checks from the repository root before every release merge:

- [ ] **Prisma Schema Validation**
  ```bash
  npx prisma validate
  ```
  *Expectation: Output reports `The schema at prisma/schema.prisma is valid`.*

- [ ] **Prisma Client Generation**
  ```bash
  npx prisma generate
  ```
  *Expectation: Client generates successfully under `node_modules/@prisma/client`.*

- [ ] **TypeScript Typecheck**
  ```bash
  npm run typecheck
  ```
  *Expectation: Output reports `Types generated successfully` and exits with `0` compilation errors.*

- [ ] **ESLint Code Quality Check**
  ```bash
  npm run lint
  ```
  *Expectation: Linter completes with zero errors or warnings.*

- [ ] **Production Next.js Build**
  ```bash
  npm run build
  ```
  *Expectation: Next.js compiles cleanly and lists `/directory` and `/claim-documents` as dynamic routes (`ƒ`).*

- [ ] **Security Vulnerability Audit**
  ```bash
  npm audit --audit-level=moderate
  ```
  *Expectation: No moderate or higher vulnerabilities are detected in dependencies.*

---

## B. Public Route Smoke Checklist

Run a local or staging instance of PlannerDesk, and verify that the public routes return `200` and satisfy the product safety requirements.

### Target Routes
- [ ] `/` (Landing Page)
- [ ] `/directory` (Insurer Directory)
- [ ] `/claim-documents` (Claim Document Library)
- [ ] `/disclosure-links` (Disclosure Link Center)
- [ ] `/message-templates` (Customer Message Templates)

### Route Verification Criteria
- [ ] **Access**: Accessible without authentication (no login popup/gate).
- [ ] **Failover Handling**: `/directory` and `/claim-documents` handle database connectivity failure gracefully by displaying a calm Korean notification (e.g., `"정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요."`) instead of exposing raw database errors.
- [ ] **Empty States**: If database tables are empty, the pages render a descriptive Korean placeholder (e.g., `"공개된 정보가 아직 없습니다."`).
- [ ] **Guidance Compliance**: No customer-facing text implies claim outcomes, payout guarantees, or medical decisions. Verify that the following forbidden phrases are not present on public routes:
  - `"보험금 지급됩니다"`
  - `"무조건 받을 수 있습니다"`
  - `"청구하면 나옵니다"`
  - `"확정"`
  - `"100%"`
  - `"반드시 지급"`
- [ ] **External Links**: All external links opening in new tabs use `target="_blank" rel="noopener noreferrer"` to prevent security vulnerability.
- [ ] **No OCR/Upload**: No file upload inputs, OCR processes, or personal data submission fields are present.

---

## C. Admin Route Protection Checklist

Verify that the administration interface is strictly protected by Auth.js and RBAC.

### Target Routes
- [ ] `/admin` (Admin Shell / Dashboard)
- [ ] `/admin/insurers` (Insurer List Management)
- [ ] `/admin/insurers/new` (Create Insurer)
- [ ] `/admin/insurers/[id]/edit` (Edit Insurer)
- [ ] `/admin/claim-documents` (Claim Document Management)
- [ ] `/admin/claim-documents/new` (Create Claim Document)
- [ ] `/admin/claim-documents/[id]/edit` (Edit Claim Document)

### Protection Criteria
- [ ] **Unauthenticated Users**: Visiting any `/admin` path without logging in redirects to `/api/auth/signin` or triggers a `307`/`308` redirect.
- [ ] **Incorrect Roles**: Authenticated users with roles like `verified_planner`, `anonymous_public`, or missing/unassigned roles are blocked from entering `/admin` paths and receive a clear access-denied error (status `403` or redirect to access-denied route).
- [ ] **Server-Side Enforcement**: All CRUD actions (under `app/admin/claim-documents/actions.ts` and `app/admin/insurers/actions.ts`) explicitly invoke server-side RBAC validation (`requireClaimDocumentContentManager`, `requireClaimDocumentPublisher`, etc.). They must throw errors or redirect if unauthorized.
- [ ] **No Delete Affordances**: The admin interface must not offer destructive hard delete actions (only publish toggling and content edits).

---

## D. Environment and Secret Safety

Before deploying, ensure that the environment variables and secrets are handled securely.

- [ ] **Gitignore Integrity**: Confirm that `.env` and `.env.*` files are present in `.gitignore` and are not tracked by Git.
- [ ] **Placeholder Check**: Confirm `.env.example` contains only placeholder values (e.g. `DATABASE_URL="postgresql://..."`) and contains no real production tokens, keys, or passwords.
- [ ] **Secrets Verification**: Ensure no production PostgreSQL strings, Auth.js secrets (`AUTH_SECRET`), or OAuth keys are written in documentation files, code comments, or committed files.
- [ ] **Separation boundaries**: Check that there is no reference to BOA CRM databases or Aiven services in configuration profiles.
