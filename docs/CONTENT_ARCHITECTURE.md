# PlannerDesk Phase 1 Content Architecture

PlannerDesk is a public B2B SaaS platform for Korean insurance planners. Phase 1 organizes static MVP content for practical planner workflows without adding a database, authentication, admin CRUD, billing, community, file upload, or Neon integration.

PlannerDesk is completely separate from BOA CRM. Content must not use BOA CRM data, BOA CRM databases, Aiven, customer sensitive data, or production secrets.

## Goals

- Define the content model for Phase 1 MVP modules.
- Prepare safe static TypeScript data for future PR-05 and PR-06 implementation.
- Keep all entries in draft status until official links and source details are verified.
- Avoid product behavior that could be interpreted as claim judgment, payout estimation, loss adjusting, or medical document processing.

## Content Modules

### Insurer Directory

Purpose: give planners a calm, structured place to find official insurer work links and contact references after verification.

Fields:

- `id`: stable slug for internal references
- `name`: insurer display name
- `category`: `life` or `non_life`
- `officialWebsiteUrl`: official public website
- `plannerPortalUrl`: official planner or partner portal, if public and appropriate
- `claimPageUrl`: official claim guidance page
- `customerCenterPhone`: official customer center number
- `faxNumber`: official fax number, if published
- `mailingAddress`: official mailing address, if published
- `notes`: editorial notes for planner context
- `lastVerifiedAt`: ISO date when source details were last verified
- `verificationStatus`: `draft`, `verified`, or `needs_review`

### Claim Document Library

Purpose: organize document names and source references so planners can check official claim document requirements before customer communication.

Fields:

- `id`: stable slug
- `title`: human-readable title
- `insurerId`: related insurer id, or `null` for common guidance
- `claimType`: `actual_medical`, `hospitalization`, `surgery`, `diagnosis`, `fracture`, `medication`, or `common`
- `documentName`: document or form name
- `sourceUrl`: official source URL
- `description`: short planner-facing explanation
- `cautionNote`: safety and verification warning
- `lastVerifiedAt`: ISO date when source details were last verified
- `verificationStatus`: `draft`, `verified`, or `needs_review`

### Disclosure And Policy Link Center

Purpose: collect official disclosure, policy, claim guidance, consumer notice, and regulatory reference links.

Fields:

- `id`: stable slug
- `title`: link title
- `category`: `product_disclosure`, `policy_terms`, `claim_guidance`, `consumer_notice`, or `regulatory_reference`
- `sourceUrl`: official source URL
- `description`: short explanation of the link destination
- `lastVerifiedAt`: ISO date when source details were last verified
- `verificationStatus`: `draft`, `verified`, or `needs_review`

### Customer Message Template Library

Purpose: help planners communicate routine workflow steps in a professional, careful, non-guarantee tone.

Fields:

- `id`: stable slug
- `title`: template title
- `situation`: when the message should be used
- `tone`: `professional`, `warm`, `concise`, `careful`, or `formal`
- `body`: message template body
- `safetyNote`: editorial safety note for the template
- `lastUpdatedAt`: ISO date when the template was last edited

## Verification Policy

All official links, phone numbers, fax numbers, mailing addresses, document names, and claim guidance references must be verified before public release.

Verification requirements:

- Use only official insurer, regulator, or public institution sources.
- Store source URLs in the relevant `sourceUrl`, `officialWebsiteUrl`, `plannerPortalUrl`, or `claimPageUrl` field.
- Set `lastVerifiedAt` only after a human verification pass.
- Keep unverified entries as `draft`.
- Mark outdated or uncertain entries as `needs_review`.
- Do not present draft content as authoritative.

The placeholder static data in `lib/content` is structural only and must not be used as complete insurer guidance.

## Content Safety Rules

PlannerDesk content must not:

- Judge whether a claim will be paid
- Estimate claim amounts
- Provide loss-adjusting workflow guidance
- Request, upload, store, or process customer medical documents
- Guarantee coverage, approval, payout, timing, or outcomes
- Replace insurer official guidance or licensed professional judgment

Customer-facing templates should use careful language such as:

- "공식 안내 기준으로 확인하겠습니다."
- "보험사별로 다를 수 있습니다."
- "최신 안내를 기준으로 다시 확인하겠습니다."

Avoid guarantee language such as:

- "지급됩니다"
- "보장됩니다"
- "반드시 받을 수 있습니다"
- "예상 보험금은 ..."

## Static Data Location

Phase 1 static content lives under:

- `lib/content/types.ts`
- `lib/content/insurers.ts`
- `lib/content/claim-documents.ts`
- `lib/content/disclosure-links.ts`
- `lib/content/message-templates.ts`
- `lib/content/safety-rules.ts`

This structure is intentionally database-free. Future PRs may use these types as the starting point for content pages, admin review workflows, or database-backed models after a separate security and product review.

## Explicit Non-Goals

This PR must not add:

- Neon PostgreSQL
- Prisma
- Database tables or migrations
- Authentication
- Admin CRUD
- Billing or subscriptions
- Community implementation
- File upload
- Customer medical document processing
- Claim payout judgment
- Claim amount estimation
- Loss-adjusting workflow
