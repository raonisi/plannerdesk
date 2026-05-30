# PR-71: DisclosureLink Prisma Schema

Schema-only PR. No migration file, admin CRUD, public DB fetch, bulk actions, or seed in this change set.

## 1. Purpose

Move disclosure and policy links from `lib/content/disclosure-links.ts` static data toward a database-backed model that supports:

- Per-insurer and global (regulator / association) links
- Editorial review before public exposure
- Official source metadata and verification timestamps
- Sort order for admin and public listing

## 2. Model: `DisclosureLink`

| Field | Type | Notes |
|-------|------|--------|
| `id` | `String` @id cuid | Primary key |
| `title` | `String` | Display title |
| `description` | `String` @db.Text | Planner-facing summary; not legal advice |
| `url` | `String` | Official HTTP(S) destination |
| `category` | `DisclosureLinkCategory` | Link taxonomy |
| `targetType` | `DisclosureLinkTargetType` | Scope: insurer, regulator, etc. |
| `insurerId` | `String?` | Nullable; set for insurer-specific links |
| `status` | `DisclosureLinkStatus` | Editorial lifecycle |
| `isPublished` | `Boolean` | Publish flag (default false) |
| `sourceName` | `String?` | Human-readable source label |
| `isOfficialSource` | `Boolean` | Marks insurer/regulator official channel |
| `lastVerifiedAt` | `DateTime?` | Last URL/source check (no auto-fetch in PR-71) |
| `publishedAt` | `DateTime?` | First/last publish timestamp (PR-72) |
| `reviewedAt` | `DateTime?` | Last review completion |
| `reviewedById` | `String?` | Operator user id (no User FK; matches KnowledgeArticle) |
| `sortOrder` | `Int` | Listing order |
| `adminMemo` | `String?` @db.Text | Internal operator notes only |
| `createdAt` / `updatedAt` | `DateTime` | Audit |
| `createdById` / `updatedById` | `String?` | Operator audit (PR-72 forms) |

### Relation

- `insurer` → `Insurer?` with `onDelete: SetNull`
- Deleting an insurer does **not** cascade-delete disclosure links; `insurerId` becomes null.

## 3. Enums (snake_case, project convention)

### `DisclosureLinkCategory`

Aligns with static `DisclosureCategory` where possible, plus PR-71 extensions:

- `product_disclosure`, `policy_terms`, `claim_disclosure`, `insurer_notice`
- `insurer_official_materials`, `insurance_association`, `regulator`
- `claim_compensation_reference`, `education_practice_reference`, `customer_guide`, `other`

### `DisclosureLinkTargetType`

- `insurer`, `regulator`, `association`, `internal`, `other`

### `DisclosureLinkStatus`

Distinct from `VerificationStatus` (Insurer / ClaimDocument) and `KnowledgeArticleStatus`:

- `draft` — not ready for public
- `needs_review` — awaiting operator check
- `published` — review-complete, eligible for public when `isPublished=true`
- `archived` — retained but not public

**Why not reuse `VerificationStatus`?** PR-75 public rule requires `status = published`, not `verified`. A dedicated enum avoids ambiguous mapping and keeps disclosure lifecycle explicit.

## 4. Public exposure conditions (PR-75, not implemented in PR-71)

A row may appear on public `/disclosure-links` only when **both**:

1. `isPublished === true`
2. `status === published`

Never public:

- `draft`, `needs_review`, `archived`
- `isPublished === false`

Indexes on `status`, `isPublished`, `category`, `insurerId`, `sortOrder` support filtered reads in PR-75.

## 5. Fields reserved for PR-72 Admin CRUD

- All writable fields above except system timestamps
- Server actions will enforce: no file upload, no payout/medical/PII fields
- Publish guard: reject `isPublished=true` unless `status=published`
- `lastVerifiedAt` set manually by operators (no URL fetch/crawl)

## 6. PR-72 follow-up work

1. Create **non-destructive** migration: `DisclosureLink` table + enums
2. Admin routes: list, filter, create, edit, publish toggle
3. Optional static → DB import script (separate PR; not bulk auto-run on deploy)
4. Wire `IMPLEMENTED_BULK_DOMAINS.disclosureLinks` after persist layer exists
5. `revalidatePath("/disclosure-links")` on writes

## 7. Migration risks

| Risk | Mitigation |
|------|------------|
| New table only | No ALTER on existing tables in PR-71 |
| Enum additions | PostgreSQL enum types created with table; no enum value drops |
| Insurer FK | `ON DELETE SET NULL` — no cascade wipe |
| Production apply | Run migrate only in controlled PR-72 window with backup |

**Destructive migration in PR-71:** None (schema file only; no `prisma/migrations` change).

## 8. Out of scope (PR-71)

- Admin UI / server actions
- Public DB fetch (still static `lib/content`)
- Bulk actions, seed mass insert, AI, file upload
- Customer PII, medical records, payout or loss-adjustment fields

## 9. Verification (local)

```bash
npx prisma format
npx prisma validate
npm run typecheck
npm run lint
npm run build
```

Do **not** run `prisma migrate dev` against production in PR-71.
