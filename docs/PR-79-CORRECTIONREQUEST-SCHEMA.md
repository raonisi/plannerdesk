# PR-79: CorrectionRequest Prisma Schema

Schema-only PR. No migration file, public submit form, server action, admin inbox, file upload, OCR, or auto-apply in this change set.

Policy baseline: [PR-78 CorrectionRequest policy](./PR-78-CORRECTIONREQUEST-POLICY.md) · [Checklist](./PR-78-CORRECTIONREQUEST-CHECKLIST.md)

## 1. Purpose

Add a database-backed queue for **non-sensitive public feedback** about PlannerDesk reference content (insurers, claim documents, disclosure links, message templates, knowledge articles).

Rows are **admin-reviewed only**. `ACCEPTED` / `APPLIED` status does **not** mutate `Insurer`, `ClaimDocument`, `DisclosureLink`, `MessageTemplate`, or `KnowledgeArticle` automatically.

## 2. Model: `CorrectionRequest`

| Field | Type | Notes |
|-------|------|--------|
| `id` | `String` @id cuid | Primary key |
| `targetType` | `CorrectionTargetType` | Which catalog domain the report refers to |
| `targetId` | `String?` | Nullable cuid of target row; null when `targetType = general` |
| `requestType` | `CorrectionRequestType` | Kind of report (typo, broken link, etc.) |
| `title` | `String` | Short summary; validated in PR-80 (no PII/medical prompts) |
| `message` | `String` @db.Text | Free text; may contain sensitive data — flags + PR-80 scan |
| `status` | `CorrectionRequestStatus` | Admin workflow (default `new`) |
| `priority` | `CorrectionRequestPriority` | Triage priority (default `normal`) |
| `containsSensitiveData` | `Boolean` | Suspected PII/medical/contract content (default false) |
| `redactionRequired` | `Boolean` | Needs masking or deletion (default false) |
| `redactedAt` | `DateTime?` | When message was redacted (PR-81+) |
| `resolvedAt` | `DateTime?` | When admin closed the ticket |
| `resolvedById` | `String?` | Operator user id |
| `resolvedBy` | `User?` | `onDelete: SetNull` — user delete does not delete requests |
| `adminMemo` | `String?` @db.Text | **Admin-only**; do not paste sensitive originals |
| `retentionUntil` | `DateTime?` | Retention policy (dates TBD operationally) |
| `deletedAt` | `DateTime?` | Soft delete |
| `createdAt` / `updatedAt` | `DateTime` | Audit |

### Relations

- **`resolvedBy` → `User`** (optional, `SetNull` on user delete)
- **No FK** to `Insurer`, `ClaimDocument`, `DisclosureLink`, `MessageTemplate`, or `KnowledgeArticle` — `targetType` + `targetId` are validated in application code (PR-80) to avoid polymorphic Prisma coupling and cascade deletes.

## 3. Enums (snake_case, project convention)

### `CorrectionTargetType`

| Value | Meaning |
|-------|---------|
| `insurer` | Insurer directory entry |
| `claim_document` | Claim document warehouse entry |
| `disclosure_link` | Disclosure / terms link |
| `message_template` | Customer message template |
| `knowledge_article` | Knowledge archive article |
| `general` | No specific row (`targetId` null) |

### `CorrectionRequestType`

| Value | Meaning |
|-------|---------|
| `broken_link` | URL does not work |
| `outdated_info` | Stale information |
| `typo` | Spelling / wording |
| `wrong_category` | Wrong taxonomy |
| `document_requirement_update` | Claim **guidance** change only — not file upload |
| `disclosure_update` | Disclosure / terms link change |
| `message_template_feedback` | Template wording feedback (generalized) |
| `knowledge_article_feedback` | Knowledge content feedback |
| `other` | Other non-sensitive report |

### `CorrectionRequestStatus`

| Value | Meaning |
|-------|---------|
| `new` | Just submitted |
| `triaged` | First admin review |
| `needs_redaction` | Sensitive content — mask/delete |
| `accepted` | Approved for manual fix elsewhere |
| `rejected` | Will not apply |
| `applied` | Operator marked fix done in domain admin |
| `archived` | Archived |
| `deleted` | Deleted / closed out |

### `CorrectionRequestPriority`

`low`, `normal` (default), `high`, `urgent` — set by admin or PR-80 validation; no auto-classifier in PR-79.

## 4. Forbidden fields (not in schema)

The following are **intentionally absent**:

- Customer PII columns (name, phone, email, RRN, address, account, contract/policy numbers)
- Medical columns (diagnosis, hospital, surgery, records, etc.)
- Payout / loss-adjustment columns (`claimAmount`, `claimPayable`, etc.)
- File / attachment / OCR columns
- Auto-apply / AI decision columns (`autoApply`, `aiAnswer`, etc.)

See PR-78 §9.2 for the full list.

## 5. Sensitive-data flags

| Field | Use |
|-------|-----|
| `containsSensitiveData` | PR-80 keyword/regex hit or PR-81 manual flag |
| `redactionRequired` | Queue for masking; inbox sort key |
| `redactedAt` | Redaction completed |
| `deletedAt` | Soft delete / dispose |
| `retentionUntil` | Future retention job (not implemented in PR-79) |

**Logging:** Do not log full `message` on rejection paths (PR-80).

## 6. Retention and deletion

- `retentionUntil`: operational expiry (policy dates TBD)
- `deletedAt`: soft delete preferred over hard delete
- No automatic purge in PR-79

## 7. Admin workflow (status flow)

```text
new → triaged → needs_redaction? → accepted | rejected
accepted → applied (after manual edit in domain admin)
any → archived | deleted
```

Public content is updated only via existing admin CRUD routes, not via this table.

## 8. Indexes

Single-column: `status`, `targetType`, `requestType`, `priority`, `containsSensitiveData`, `redactionRequired`, `createdAt`, `resolvedAt`

Composite (inbox queries):

- `[status, createdAt]`
- `[targetType, createdAt]`
- `[redactionRequired, createdAt]`

## 9. PR-80 connection (submit server action)

- Validate `targetType` / `targetId` (existence when id present)
- Enforce title/message length and forbidden patterns
- Set `status = new`, flags on sensitive hit
- **No** file upload, **no** content table updates
- Optional: set `containsSensitiveData` / `redactionRequired` / `status = needs_redaction`

## 10. PR-81 connection (admin inbox)

- RBAC: content admin+
- Filter/sort by `status`, `redactionRequired`, `priority`, `createdAt`
- Transition `status`; set `resolvedAt`, `resolvedById`, `adminMemo`
- Link out to domain admin edit screens — **no** inline patch of target rows
- Minimize `message` display when flags are true

## 11. Migration safety

| Item | PR-79 |
|------|--------|
| `prisma/schema.prisma` | Updated |
| `prisma/migrations/*` | **Not added** — create in follow-up migration PR with backup |
| Destructive changes | **None** |
| Existing tables | Unchanged |
| Existing enums | No values removed |

Do **not** run `prisma migrate deploy` against production until a dedicated migration PR is reviewed.

## 12. Verification

```bash
npx prisma format
npx prisma validate
npx prisma generate   # optional locally
npm run typecheck
npm run lint
npx next build        # if migrate in build fails, use npx next build
```

## 13. Out of scope (PR-79)

- Public form UI
- Server actions / routes
- Admin inbox
- Seed data
- Retention cron
- Email / Kakao notifications
