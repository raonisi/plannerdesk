# KnowledgeArticle Database Model Plan (PR-KNOW-DB-01)

## Purpose

Introduce a PostgreSQL-backed `KnowledgeArticle` model so PlannerDesk can later support admin-authored, reviewed, and published knowledge archive content. The current `/knowledge` route continues to use static seed data (`app/knowledge/knowledge-seed.ts`) until a separate PR wires DB fetch.

## Model summary

| Field | Role |
|-------|------|
| `slug` | Stable public URL key (unique) |
| `title`, `summary`, `content` | Editorial body (`content` is `@db.Text`) |
| `category`, `type` | IA taxonomy (enums aligned with archive IA) |
| `riskLevel` | Operator risk labeling (`blocked` for hard boundaries) |
| `status` | Editorial lifecycle (`draft` → `needs_review` → `verified`, etc.) |
| `isPublished` | Publication gate (paired with `status` for public visibility) |
| `aiUsable` | Future AI assist flag — **default `false`**, not enabled in this PR |
| `sourceType`, `sourceTitle`, `sourceUrl`, `sourceCheckedAt` | Official/internal source metadata (URL storage only; no external fetch) |
| `workflowLabel`, `tags` | Operator workflow and search tags |
| `safeCopy`, `forbiddenClaims` | Approved phrasing and blocked claim patterns |
| `publishedAt` | First/last publish timestamp for audit |
| `createdById`, `updatedById`, `reviewedById` | Operator IDs (no `User` relation in this PR) |

## Enums

- **KnowledgeArticleStatus:** `draft`, `needs_review`, `verified`, `archived`, `rejected`
- **KnowledgeArticleCategory:** `claim`, `underwriting`, `cancellation`, `disclosure`, `customer_message`, `operation_safety`, `plannerdesk_usage`
- **KnowledgeArticleType:** `faq`, `practical_standard`, `checklist`, `message_sample`, `link_guide`, `safety_boundary`
- **KnowledgeRiskLevel:** `low`, `medium`, `high`, `blocked`
- **KnowledgeSourceType:** `internal`, `official`, `insurer`, `regulator`, `mixed`

### Status definitions

| Status | Meaning | Public |
|--------|---------|--------|
| `draft` | Work in progress | Never |
| `needs_review` | Published candidate; needs operator review | Yes if `isPublished` |
| `verified` | Review complete | Yes if `isPublished` |
| `archived` | Retired from active use | Never |
| `rejected` | Not suitable for publication | Never |

## Public visibility rule (future DB fetch)

Defined in `lib/public/knowledge-articles.ts` for the next read-path PR:

```
visible ⟺ isPublished === true AND status ∈ { verified, needs_review }
```

Blocked from public surfaces:

- `draft`, `archived`, `rejected`
- `isPublished === false`

This mirrors Insurer / ClaimDocument patterns (`isPublished` + verification-like status) while using a dedicated `KnowledgeArticleStatus` enum for archive-specific lifecycle states.

## aiUsable principle

- Schema default: **`false`**
- No seed rows set `aiUsable: true` in this PR
- AI answer assist, RAG, and OpenAI integration are **out of scope**
- Future AI work must gate on `aiUsable === true` **and** `status === verified` (documented here; not enforced in code yet)

## Source management

- `sourceUrl` stores a reference URL for operators; PlannerDesk does not crawl or ingest remote content automatically
- Prefer `official` or `regulator` `sourceType` when citing external standards
- `sourceCheckedAt` records when an operator last confirmed the link

## Safety boundaries (schema design)

The model intentionally **does not** include:

- Customer PII fields (national ID, policy numbers tied to individuals, etc.)
- Medical record / diagnosis / prescription / lab result storage
- File upload or binary attachment columns
- Insurance payout eligibility or amount determination fields
- Loss-adjustment outcome storage

Editorial `content` and `safeCopy` are plain text for operator-authored guidance only.

## Static seed mapping (reference)

Current `app/knowledge/knowledge-seed.ts` categories map to `KnowledgeArticleCategory` for future import:

| Seed category (Korean) | DB enum |
|------------------------|---------|
| 청구서류·접수 기준 | `claim` |
| 고지·심사 전 확인 | `underwriting` |
| 계약관리·유지 실무 | `cancellation` |
| 공시·약관·공식 링크 | `disclosure` |
| 고객 안내문·응대 문구 | `customer_message` |
| 운영 안전·금지 영역 | `operation_safety` |
| PlannerDesk 사용법 | `plannerdesk_usage` |
| 보험사 전산·업무 포털 | `operation_safety` (grouped until a dedicated portal enum is needed) |

## Follow-up PRs (not in PR-KNOW-DB-01)

1. **Admin CRUD** — `/admin/knowledge` create/edit/publish with Auth/RBAC guards
2. **Public DB fetch** — replace static list/detail with `getPublicKnowledgeArticles()` Prisma read
3. **Seed import** — optional script to migrate static seed into `KnowledgeArticle` rows
4. **AI assist** — only after verified content policy and `aiUsable` governance

## Migration notes

- Migration: `20260529210000_add_knowledge_articles`
- Additive only: new enums + `KnowledgeArticle` table + indexes
- No `DROP`, no changes to `User`, `Insurer`, or `ClaimDocument`
- **Do not** run `prisma migrate deploy` or `prisma db push` against production from this PR; Railway applies migrations in a controlled release step

## Provider compatibility

- PostgreSQL via Neon: `String[]` → `TEXT[]` (supported)
- No JSON workaround required for `tags` / `forbiddenClaims`
