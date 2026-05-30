# PR-73: MessageTemplate Prisma Schema

Schema-only PR. No migration file, admin CRUD, public DB fetch, bulk actions, seed, or AI in this change set.

## 1. Purpose

Move customer guidance copy from `lib/content/message-templates.ts` static data toward a database-backed model that supports:

- Channel-specific templates (Kakao, SMS, phone script, email, social, etc.)
- Situation and audience classification
- Editorial review before public exposure
- Risk labeling, safe copy, forbidden phrases, and compliance notes for operators
- Internal-only templates separate from public catalog

## 2. Model: `MessageTemplate`

| Field | Type | Notes |
|-------|------|--------|
| `id` | `String` @id cuid | Primary key |
| `title` | `String` | Admin / planner display title |
| `description` | `String` @db.Text | Planner-facing summary; not sent to customers as-is |
| `body` | `String` @db.Text | Template body; placeholders only, no real customer values |
| `category` | `MessageTemplateCategory` | Business taxonomy (greeting, claim guide, etc.) |
| `channel` | `MessageTemplateChannel` | Delivery channel |
| `audienceType` | `MessageTemplateAudienceType` | Target audience segment |
| `useCase` | `String` @db.Text | When to use (maps static `situation`) |
| `tone` | `MessageTemplateTone` | Voice / style |
| `status` | `MessageTemplateStatus` | Editorial lifecycle |
| `isPublished` | `Boolean` | Publish flag (default false) |
| `isInternalOnly` | `Boolean` | When true, never public even if published |
| `riskLevel` | `MessageTemplateRiskLevel` | Operator risk hint (low / medium / high) |
| `safeCopy` | `String?` @db.Text | Reviewed safe wording baseline |
| `forbiddenClaims` | `String[]` | Phrases to avoid (admin-only) |
| `complianceNote` | `String?` @db.Text | Usage cautions for operators (admin-only) |
| `allowedVariables` | `String[]` | Permitted placeholders e.g. `{고객명}` |
| `sortOrder` | `Int` | Listing order |
| `reviewedAt` | `DateTime?` | Last review completion |
| `reviewedById` | `String?` | Operator user id (no User FK; matches other content models) |
| `publishedAt` | `DateTime?` | Publish timestamp (PR-74) |
| `createdAt` / `updatedAt` | `DateTime` | Audit |
| `createdById` / `updatedById` | `String?` | Operator audit (PR-74 forms) |

### Relations

None in PR-73. Templates are not tied to Insurer rows to avoid storing contract or customer identifiers on the template record.

## 3. Enums (snake_case, project convention)

### `MessageTemplateCategory`

`greeting`, `follow_up`, `appointment`, `policy_review`, `claim_guide`, `contract_maintenance`, `cancellation_defense`, `rebalancing`, `customer_care`, `notice`, `other`

Static `MessageSituation` values map in PR-74 import (e.g. `claim_documents_request` → `claim_guide`, `consultation_schedule` → `appointment`).

### `MessageTemplateChannel`

`kakao`, `sms`, `phone_script`, `email`, `blog`, `threads`, `instagram`, `general`

### `MessageTemplateAudienceType`

`new_customer`, `existing_customer`, `dormant_customer`, `claim_customer`, `cancellation_risk`, `referral`, `general`

### `MessageTemplateTone`

Includes PR-73 spec tones plus static-data tones for migration: `formal`, `warm`, `concise`, `consultative`, `reassuring`, `neutral`, `professional`, `careful`, `calm`.

### `MessageTemplateRiskLevel`

`low`, `medium`, `high` — separate from `KnowledgeRiskLevel` (no `blocked`; domain-specific).

### `MessageTemplateStatus`

Aligned with `DisclosureLinkStatus` (not `KnowledgeArticleStatus` which uses `verified`):

- `draft` — not ready for public
- `needs_review` — awaiting operator check (maps “REVIEW” in product copy)
- `published` — review-complete, eligible for public when other flags allow
- `archived` — retained but not public

**Why not reuse `DisclosureLinkStatus`?** Separate enum keeps Prisma models independent and avoids cross-domain coupling; values are identical for consistent server guards in PR-74.

## 4. Public exposure conditions (PR-76, not implemented in PR-73)

A row may appear on public `/message-templates` only when **all**:

1. `isPublished === true`
2. `status === published`
3. `isInternalOnly === false`

Never public:

- `draft`, `needs_review`, `archived`
- `isPublished === false`
- `isInternalOnly === true`

Never expose on public API (PR-76 select list):

- `forbiddenClaims`, `complianceNote`, `reviewedById`, `createdById`, `updatedById`

## 5. Fields reserved for PR-74 Admin CRUD

- All writable fields above except system timestamps
- Server validation: URL N/A; no file upload; prohibited payout/medical/PII **values** in `body` / `safeCopy`
- Placeholder policy enforced in PR-74 validators on `body`, `safeCopy`, `allowedVariables`
- Publish guard: reject `isPublished=true` unless `status=published` and not `isInternalOnly` conflict
- `reviewedAt` / `reviewedById` set when moving to `published`

## 6. Safety design

### `safeCopy`

Optional reviewed wording operators can compare against `body` before publish.

### `forbiddenClaims`

`String[]` — admin review list (e.g. “무조건 지급”, “반드시 보장”). Not shown on public pages.

### `complianceNote`

Operator usage notes (e.g. avoid payout guarantees, product solicitation). Admin-only.

### `allowedVariables`

`String[]` — permitted placeholders. PR-74 will block sensitive names such as `{주민등록번호}`, `{병명}`, `{계약번호}`, `{보험금액}`, etc.

Recommended allow list (documented, enforced in PR-74):

- `{고객명}`, `{담당자명}`, `{상담일}`, `{보험사명}`, `{점검항목}`, `{연락처}` (planner/company contact only)

### `riskLevel` / `isInternalOnly`

`riskLevel` guides review priority; `isInternalOnly` keeps training or sensitive scripts off the public catalog.

## 7. Security and compliance

| Risk | Mitigation |
|------|------------|
| Customer PII in DB | No fields for phone, RRN, diagnosis, claim amounts, contract/account numbers |
| Medical data | No diagnosis / prescription / medical record columns |
| Payout / coverage guarantees | `forbiddenClaims` + PR-74 phrase scanners (reuse message-template admin patterns) |
| Product solicitation | `complianceNote` + category/tone review in PR-74 |
| Fear-based cancellation copy | High `riskLevel` + compliance notes; operator review required |

Schema does **not** store uploaded files, OCR output, or AI-generated answers.

## 8. PR-74 follow-up work

1. Create **non-destructive** migration: `MessageTemplate` table + enums
2. Admin routes: `/admin/message-templates` list, create, edit, publish, archive
3. Optional static → DB import (separate PR; no mass seed on deploy)
4. Wire bulk domain `messageTemplates` after persist layer exists (PR-77+)
5. `revalidatePath("/message-templates")` on writes (PR-76)

## 9. Migration risks

| Risk | Mitigation |
|------|------------|
| New table only | No ALTER on existing tables in PR-73 |
| Enum additions | PostgreSQL enum types created with table in PR-74 |
| Existing data | Static `lib/content` unchanged until PR-74/76 |
| Production apply | Run migrate only in controlled PR-74 window with backup |

**Destructive migration in PR-73:** None (schema file only; no `prisma/migrations` change).

**Migration file:** Create in **PR-74** (or dedicated migration PR), not PR-73.

## 10. Out of scope (PR-73)

- Admin UI / server actions
- Public DB fetch (still static `lib/content`)
- Bulk actions, seed mass insert, AI, file upload
- `CorrectionRequest`, global search, community

## 11. Verification (local)

```bash
npx prisma format
npx prisma validate
npm run typecheck
npm run lint
npm run build
```

Do **not** run `prisma migrate dev` against production in PR-73.
