# PR-90: CommunityPost Prisma Schema

Schema-only PR. No community UI, comments, reactions, file upload, OCR, AI auto-moderation, or external notifications in this change set.

Policy baseline: [PR-89 Community policy](./PR-89-COMMUNITY-POLICY.md) ¡¤ [Checklist](./PR-89-COMMUNITY-CHECKLIST.md)

## 1. Purpose

Add safe, moderation-ready database models for community posts and reports before PR-91 UI.

- `CommunityPost`: verified planner community posting core
- `CommunityReport`: manual report queue for moderation

`CommunityPost` stores only generalized text content. It does **not** store customer PII, contract, medical, claim-doc payloads, files, OCR text, or payout/loss-adjustment judgments.

## 2. Added models

### 2.1 `CommunityPost`

| Field | Type | Notes |
|------|------|------|
| `id` | `String` @id cuid | Primary key |
| `authorId` | `String` | Author `User.id` |
| `author` | `User` | `onDelete: Restrict` (keep post integrity) |
| `category` | `CommunityPostCategory` | Board category |
| `title` | `String` | Plain text title |
| `content` | `String` @db.Text | Plain text body (PR-91 server validation required) |
| `status` | `CommunityPostStatus` | default `draft` |
| `visibility` | `CommunityPostVisibility` | default `verified_only` |
| `isPinned` | `Boolean` | default false |
| `isBlind` | `Boolean` | default false |
| `blindReason` | `CommunityReportReason?` | Structured blind reason |
| `blindReasonText` | `String?` @db.Text | Internal detail, admin-only |
| `blindedAt` | `DateTime?` | Blind timestamp |
| `blindedById` | `String?` | Admin actor |
| `blindedBy` | `User?` | `onDelete: SetNull` |
| `reviewedAt` | `DateTime?` | Moderation review timestamp |
| `reviewedById` | `String?` | Moderator/admin actor |
| `reviewedBy` | `User?` | `onDelete: SetNull` |
| `deletedAt` | `DateTime?` | Soft delete |
| `deletedById` | `String?` | Delete actor |
| `deletedBy` | `User?` | `onDelete: SetNull` |
| `adminMemo` | `String?` @db.Text | Admin-only note |
| `reportCount` | `Int` default 0 | Lightweight report count cache |
| `createdAt` / `updatedAt` | `DateTime` | Audit |

### 2.2 `CommunityReport`

| Field | Type | Notes |
|------|------|------|
| `id` | `String` @id cuid | Primary key |
| `postId` | `String` | FK to `CommunityPost` |
| `post` | `CommunityPost` | `onDelete: Cascade` |
| `reporterId` | `String` | FK to `User` |
| `reporter` | `User` | `onDelete: Cascade` |
| `reason` | `CommunityReportReason` | Structured report reason |
| `status` | `CommunityReportStatus` | default `new` |
| `message` | `String?` @db.Text | Optional note (PR-91 validation required) |
| `reviewedAt` | `DateTime?` | Moderation review timestamp |
| `reviewedById` | `String?` | Admin reviewer |
| `reviewedBy` | `User?` | `onDelete: SetNull` |
| `adminMemo` | `String?` @db.Text | Admin-only note |
| `deletedAt` | `DateTime?` | Soft delete |
| `createdAt` / `updatedAt` | `DateTime` | Audit |

## 3. Added enums (snake_case convention)

### 3.1 `CommunityPostCategory`

`notice`, `field_tips`, `claim_guide`, `system_links`, `knowledge_qa`, `script_review`, `community_qa`, `other`

### 3.2 `CommunityPostStatus`

`draft`, `published`, `under_review`, `blinded`, `archived`, `deleted`

### 3.3 `CommunityPostVisibility`

`public`, `verified_only`, `admin_only`

### 3.4 `CommunityReportReason`

`personal_info`, `medical_info`, `contract_info`, `claim_document`, `claim_judgment`, `loss_adjustment`, `product_solicitation`, `fear_marketing`, `spam`, `external_contact`, `abuse`, `misinformation`, `duplicate`, `other`

### 3.5 `CommunityReportStatus`

`new`, `reviewing`, `accepted`, `rejected`, `closed`, `deleted`

## 4. Relation design

### 4.1 `CommunityPost.author`

- `authorId` required
- `onDelete: Restrict`
- Rationale: keep moderation/audit continuity; avoid orphaning or silent post loss on author delete

### 4.2 Moderation actor relations

- `reviewedBy`, `blindedBy`, `deletedBy` are nullable
- all use `onDelete: SetNull`
- follows existing `resolvedBy` / `reviewedBy` safety pattern

### 4.3 `CommunityReport` relations

- `post` uses `onDelete: Cascade` (hard-deleted post removes dependent reports)
- `reporter` uses `onDelete: Cascade`
- `reviewedBy` uses `onDelete: SetNull`

## 5. Index and unique strategy

### 5.1 `CommunityPost` indexes

Single:
- `authorId`, `category`, `status`, `visibility`, `isPinned`, `isBlind`, `createdAt`, `updatedAt`, `deletedAt`

Composite:
- `[status, createdAt]`
- `[category, status, createdAt]`
- `[visibility, status, createdAt]`
- `[authorId, createdAt]`
- `[isBlind, status, createdAt]`

### 5.2 `CommunityReport` indexes

Single:
- `postId`, `reporterId`, `reason`, `status`, `createdAt`, `reviewedAt`

Composite:
- `[postId, status]`
- `[status, createdAt]`
- `[reporterId, postId]`

Unique:
- `@@unique([postId, reporterId, reason])`
- prevents same user repeatedly filing same-reason reports on same post

## 6. Public visibility candidate (for PR-91)

Candidate baseline query:
- `status = published`
- `deletedAt = null`
- `isBlind = false`
- `visibility` allowed in request context

Default exclusion: `under_review`, `blinded`, `archived`, `deleted`

## 7. Explicitly forbidden fields (not added)

- Customer: `customerName`, `customerPhone`, `customerEmail`, `customerAddress`, `customerId`
- Contract: `contractNumber`, `policyNumber`, `premium`, `coverageAmount`
- Medical: `diagnosis`, `diseaseName`, `hospitalName`, `surgeryName`, `medicalRecord`
- Claim docs: `claimAmount`, `claimDocumentUrl`, `diagnosisFileUrl`
- File/OCR: `fileUrl`, `attachmentUrl`, `imageUrl`, `screenshotUrl`, `ocrText`
- Automation/judgment: `aiAnswer`, `aiSummary`, `autoBlind`, `autoDelete`, `payoutDecision`, `lossAssessmentResult`, `medicalJudgment`

## 8. PR-91 connection notes

- Server-side write guard must enforce `verified_planner` + approved verification + non-suspended conditions
- SUSPENDED_PLANNER must be blocked from post creation
- Report create/update must enforce authenticated user and non-admin data exposure boundaries
- `adminMemo`, blind text/reasons, moderation actor IDs must remain admin-only in APIs

## 9. Migration safety

| Item | PR-90 |
|------|-------|
| `prisma/schema.prisma` | Updated (enums + models + User relations) |
| `prisma/migrations/*` | Not added in this PR |
| Destructive changes | None |
| Existing models | No field/enum removals |
| Existing auth/RBAC enums | No changes |

No `DROP TABLE`, `DROP COLUMN`, or enum value removal introduced.

## 10. Out of scope

- Community UI/routes/server actions
- Comment/reaction models
- File/image upload
- OCR and auto-moderation
- Auto sanctions or notifications
