# PR-123 — 기존 관리자 운영 구조 분석

**범위:** 코드·문서·fixture 기준 정적 분석. 운영 DB 미접근.

---

## 관리자 역할 기준

| 항목 | 현재 상태 |
| --- | --- |
| **코드 RBAC** | `super_admin`, `content_admin` only — `lib/auth/rbac.ts`, `ADMIN_PERMISSION_MATRIX` |
| **super_admin** | `/admin` 전체, 콘텐츠 CRUD·publish, 사용자/역할 관리(향후) |
| **content_admin** | `/admin` shell, 콘텐츠 CRUD·publish, **manageUsers 불가** |
| **reviewer / data_admin / viewer** | **코드 역할 없음** — PR123에서 **운영 워크플로 분업**으로 정의. 실제 권한은 super/content_admin 계정으로 수행 |
| **moderator / verified_planner** | 커뮤니티·AA 등 비-admin — `/admin` 차단 |
| **정보 부족** | reviewer·data_admin 전용 계정 — **후속 Auth PR**에서 RBAC 분리 검토 |

---

## 보험사 운영 기준

| 항목 | 출처 |
| --- | --- |
| Admin CRUD | `/admin/insurers`, `requireInsurerContentManager` / `requireInsurerPublisher` |
| Public fetch | `getPublicInsurers()` — `lib/public/insurers.ts` |
| Visibility | `isPublished && verificationStatus ∈ {verified, needs_review}` |
| Publish guard | draft + published 조합 서버 거부 |
| Fixture | `lib/content/insurers.ts` 49건 — PR119/122: `lastVerifiedAt` null, `claimPageUrl` null 다수 |
| Safety copy | `lib/admin/safety-copy.ts`, `AdminSafetyNotice` |

---

## 청구서류 운영 기준

| 항목 | 출처 |
| --- | --- |
| Admin CRUD | `/admin/claim-documents` |
| Public fetch | `getPublicClaimDocuments()` |
| Visibility | 보험사와 동일 predicate |
| Fixture fallback | `claim-document-candidates.ts` 35건, `insurerId` null 다수 (PR119 #7) |
| 문구 | payout·확정 표현 금지 — `safety-copy.ts` |

---

## 지식 아카이브 운영 기준

| 항목 | 출처 |
| --- | --- |
| 정책 | [KNOWLEDGE_CONTENT_POLICY.md](./KNOWLEDGE_CONTENT_POLICY.md) |
| Public fetch | `lib/public/knowledge-articles.ts`, `PUBLIC_KNOWLEDGE_WHERE` |
| Admin | `/admin/knowledge` |
| Seed | `KNOWLEDGE_SEED_ITEMS` 10건 (fixture) |
| Archive/reject | bulk publish 차단 대상 — [ADMIN_BULK_ACTION_POLICY.md](./ADMIN_BULK_ACTION_POLICY.md) |

---

## 일괄작업 운영 기준

| 항목 | 출처 |
| --- | --- |
| Policy | [ADMIN_BULK_ACTION_POLICY.md](./ADMIN_BULK_ACTION_POLICY.md) |
| Server gate | `validateServerBulkAction` — `lib/admin/bulk-policies.ts` |
| QA | [PR-107-ADMIN-BULK-SAFETY-QA.md](./PR-107-ADMIN-BULK-SAFETY-QA.md) |
| Forbidden | `importDrafts` toolbar 미활성, PII·의료·payout 오도 bulk, production auto-publish |
| Domains | insurers, claimDocuments, knowledgeArticles, disclosureLinks, messageTemplates |

---

## 데이터 최신성 처리 기준

| 항목 | 출처 |
| --- | --- |
| 루틴 | [PR-122-DATA-FRESHNESS-OPS.md](./PR-122-DATA-FRESHNESS-OPS.md) |
| 상태값 | [PR-122-DATA-STATUS-VALUES.md](./PR-122-DATA-STATUS-VALUES.md) |
| PR124 이관 | [PR-122-PR124-HANDOFF-CRITERIA.md](./PR-122-PR124-HANDOFF-CRITERIA.md) |
| 점검표 | [PR-122-FRESHNESS-CHECK-SHEET.md](./PR-122-FRESHNESS-CHECK-SHEET.md) |

---

## 사용자 피드백 처리 기준

| 항목 | 출처 |
| --- | --- |
| 체계 | [PR-121-USER-FEEDBACK-OPS.md](./PR-121-USER-FEEDBACK-OPS.md) |
| Registry | [PR-121-FEEDBACK-INTAKE-REGISTRY.md](./PR-121-FEEDBACK-INTAKE-REGISTRY.md) |
| 라우팅 | [PR-121-FEEDBACK-TO-PR-ROUTING.md](./PR-121-FEEDBACK-TO-PR-ROUTING.md) (PR123 반영) |
| PII | [PR-121-SENSITIVE-DATA-RULES.md](./PR-121-SENSITIVE-DATA-RULES.md) |
| AA feedback | `/admin/answer-assistant/feedback` — PR121 Registry와 **별도** |

---

## public visibility 기준

| 항목 | 상태 |
| --- | --- |
| Canonical | `lib/public/visibility.ts` |
| Tests | `tests/public/public-visibility.test.ts` — **pass** (PR119/122) |
| draft 미노출 | query filter + publish guard |
| needs_review | public 가능 + 검수 배지 |
| Critical | 미검수·비공개 노출 — **별도 긴급 PR** |

---

## PR119 이관 항목 (운영 매뉴얼 관점)

| PR119 # | 매뉴얼 연결 |
| ---: | --- |
| 2–5 | 보험사·청구 등록/검수 기준 + PR124 |
| 7 | 청구 fallback 연결 — 등록 시 insurer 연결 필수 |
| 8,10,11 | 공식 출처 확인 — 보류·확인 필요 |
| visibility | 배포 전 체크리스트 §public |

---

## 정보 부족 항목

| 항목 | 비고 |
| --- | --- |
| reviewer/data_admin/viewer 전용 RBAC | 코드 미구현 — 워크플로만 |
| 운영 DB 행별 실제 링크·팩스 유효성 | HTTP 미실행 |
| disclosure-links / message-templates 상세 SOP | ADMIN CRUD 문서 일부만 |
| 자동 freshness URL checker | PR122 backlog |
