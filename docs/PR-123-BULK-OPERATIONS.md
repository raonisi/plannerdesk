# PR-123 — 일괄작업 운영 기준

**코드:** `lib/admin/bulk-policies.ts` · [ADMIN_BULK_ACTION_POLICY.md](./ADMIN_BULK_ACTION_POLICY.md) · [PR-107-ADMIN-BULK-SAFETY-QA.md](./PR-107-ADMIN-BULK-SAFETY-QA.md)

**원칙:** PR123은 **실행하지 않음**. 아래는 운영자가 bulk UI·server action 사용 **전** 확인할 기준.

---

## 작업별 허용·금지

| 작업 | 허용 기준 | 금지 기준 |
| --- | --- | --- |
| **일괄등록** | 검수 전 초안·대기 상태로만 (`importDrafts` — **planned**, toolbar 미활성) | 등록 즉시 public 공개 |
| **일괄검수** | 대상 **수 확인** 후 `markNeedsReview` / `markVerified` | 빈 선택, 전체 대상 무확인 실행 |
| **일괄상태변경** | 대상 수·상태값·권한 확인 후 | 대량 **공개** 무승인, 삭제성·되돌리기 어려운 작업 |
| **일괄비공개** | `setPublishedFalse` — 오류·중복·부정확 정리 | 근거 없는 비공개 |
| **일괄공개** | `setPublishedTrue` — **high risk**, row별 publish guard 통과 | 검수 없이 공개, draft/archived/rejected publish |

---

## Action ID (요약)

| Action | Risk | Permission |
| --- | --- | --- |
| markNeedsReview | low | manageContent |
| markVerified | medium | manageContent |
| setPublishedFalse | low | manageContent |
| setPublishedTrue | **high** | publishContent |
| archive | medium | manageContent (knowledge 등) |
| importDrafts | **blocked** | superAdmin planned — **미실행** |

---

## 필수 안전 기준

1. **대상 수 확인** — selection bar count
2. **빈 선택 실행 방지** — UI + server validation
3. **전체 선택 실수 방지** — confirm dialog copy (`bulk-policies.ts`)
4. **서버 RBAC** — `requireContentManagerAccess` / `requirePublisherAccess` — **클라이언트만 믿지 않음**
5. **`validateServerBulkAction`** — domain + actionId gate (PR107)
6. **draft publish skip** — `wouldPublishDraft` / blocked status
7. **운영 데이터 대량 변경** — super_admin 승인·PR124/별도 PR과 분리 검토
8. **public visibility guard** — bulk 후 public route smoke

---

## 전역 금지 (Forbidden)

- `aiUsable` bulk true
- 파일·PII·의료 bulk import
- payout/손해사정 오도 콘텐츠 import
- production **auto-publish without review**

---

## Domain 지원

| Domain | Route | Bulk |
| --- | --- | --- |
| insurers | `/admin/insurers` | ✓ |
| claimDocuments | `/admin/claim-documents` | ✓ |
| knowledgeArticles | `/admin/knowledge` | ✓ (archive) |
| disclosureLinks | `/admin/disclosure-links` | ✓ |
| messageTemplates | `/admin/message-templates` | ✓ |

---

## 실행 전 체크리스트

- [ ] previewMode=false **통합 PR 승인 후**만 (BULK-00 foundation은 preview only)
- [ ] confirm dialog 읽고 **대상 N건** 확인
- [ ] setPublishedTrue 시 row별 verificationStatus 확인
- [ ] 결과 summary (succeeded/skipped/failed) 기록
- [ ] `revalidatePublicContentPaths()` 후 public spot check

**연계:** [PR-123-OPERATOR-MISTAKE-PREVENTION.md](./PR-123-OPERATOR-MISTAKE-PREVENTION.md)
