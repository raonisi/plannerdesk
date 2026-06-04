# PR-133 — 기존 변경 이력 구조 분석

## audit log model

| 모델 | 용도 | PR133 범위 |
| --- | --- | --- |
| **없음** (`ContentAuditLog` / `AdminAuditLog` 미구현) | 콘텐츠 변경 diff | **PR133-B** |
| `AnswerAssistantUsageAudit` | AA usage metadata only | **별도 PR** (PR133에서 미변경) |
| `AnswerAssistantBetaFeedback` | beta 피드백 | 별도 |

## admin action log

- Bulk 실행: `runBulkPerRow` 결과만 UI 반환 — **영구 audit row 없음**
- Server actions: `updatedById` 갱신만

## Row metadata (존재)

| 필드 | Insurer | Claim | Knowledge | Disclosure | Message |
| --- | --- | --- | --- | --- | --- |
| createdAt / updatedAt | ✓ | ✓ | ✓ | ✓ | ✓ |
| createdById / updatedById | ✓ | ✓ | ✓ | ✓ | ✓ |
| reviewedById | — | — | ✓ | ✓ | ✓ |
| verificationStatus / status | ✓ | ✓ | status | status | status |
| isPublished | ✓ | ✓ | ✓ | ✓ | ✓ |
| lastVerifiedAt | ✓ | ✓ | — | ✓ | — |

## 업무 링크

- 별도 테이블 없음 — **Insurer** URL·전화 필드에 포함
- 이력은 insurer row `updatedAt`에 반영

## Admin bulk

- [PR-107](./PR-107-ADMIN-BULK-SAFETY-QA.md) · [bulk-policies.ts](../lib/admin/bulk-policies.ts)
- 일괄 작업 **이력 테이블 없음** — Critical, PR133-B

## public visibility

- `lib/public/*` guards **미변경**
- 변경 이력 패널 **admin edit only**

## 정보 부족

- 운영 DB에서 bulk 이력 복구 가능 여부
- User.email을 audit에 매핑할지 (PR133-B 설계)
