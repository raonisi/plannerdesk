# PR-133-B — Change History DB Foundation (설계만 · 미구현)

**상태:** 별도 High-risk PR · **이번 PR133에서 migration 생성하지 않음**

## 제안 모델 (초안)

```prisma
// PR133-B ONLY — not applied in PR133-A
model ContentChangeEvent {
  id            String   @id @default(cuid())
  entityType    String   // insurer | claim_document | ...
  entityId      String
  actionType    String   // create | update | publish | bulk | ...
  changedById   String?
  changedAt     DateTime @default(now())
  reason        String?  @db.Text  // no PII — max length enforced in app
  beforeSummary String?  @db.Text  // redacted snapshot
  afterSummary  String?  @db.Text
  reviewStatus  String?
  sourceBasis   String?
  bulkRunId     String?
  @@index([entityType, entityId])
  @@index([changedAt])
}
```

## 저장 금지

[PR-133-PII-STORAGE-RULES.md](./PR-133-PII-STORAGE-RULES.md) 전체 목록 준수.

## Admin bulk

- `bulkRunId` + actionType `bulk_*`
- per-row event 또는 aggregate summary (운영 합의)

## Answer Assistant

- `AnswerAssistantUsageAudit` 유지 — ContentChangeEvent와 **병합하지 않음**

## RBAC

- insert: content_admin / super_admin server actions
- read: content_admin+ on admin routes only
- **public API 금지**

## Codex

PR133-B 착수 시 **필수** 제한검수.
