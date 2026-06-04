# PR-119 — 운영 데이터 구조 분석

**범위:** 코드·문서·fixture 기준. **운영 DB 행 데이터는 정보 부족.**

---

## 보험사 데이터 구조

| 계층 | 경로 | 비고 |
| --- | --- | --- |
| Schema | `prisma/schema.prisma` → `Insurer` | `verificationStatus`, `isPublished`, 링크·전화·팩스 필드 |
| Fixture/seed | `lib/content/insurers.ts` → `insurerDirectoryEntries` (49건) | `scripts/seed-db.ts` upsert |
| Public fetch | `lib/public/insurers.ts` → `getPublicInsurers` | `isPublished` + `PUBLIC_VERIFICATION_STATUSES` |
| Admin | `app/admin/insurers/*`, `visibility.ts` | publish guard·`createdById` admin only |
| Mock fallback | `getMockInsurers()` + `dedupePublicInsurers` | `DATABASE_URL` 없거나 DB 실패 시 |

**Public select:** `createdById`, `notes`, `sourceNote` **미포함**.

---

## 청구서류 데이터 구조

| 계층 | 경로 | 비고 |
| --- | --- | --- |
| Schema | `ClaimDocument` | `insurerId`, `category`, `verificationStatus`, `isPublished` |
| Import 후보 | `lib/content/claim-document-candidates.ts` | 35건 fallback, `insurerId: null` |
| Public fetch | `lib/public/claim-documents.ts` | DB 필수 (`DATABASE_URL` 없으면 `error`) |
| Admin | `app/admin/claim-documents/*` | bulk: `lib/admin/bulk-policies.ts` |
| PDF 참고 | `lib/content/claim-form-files.ts` | 별도 정적 파일 목록 (운영 DB와 분리) |

---

## 업무 링크 구조

| 필드 (Insurer) | 용도 |
| --- | --- |
| `officialWebsiteUrl` | 공식 홈페이지 |
| `plannerPortalUrl` | 설계사 포털 |
| `systemUrl` | 전산 |
| `claimPageUrl` | 청구안내 페이지 |
| `claimFormUrl` | 청구서 양식 URL |
| `termsUrl` | 약관/공시 |

청구서류: `claimFormUrl`, `officialSourceUrl` on `ClaimDocument`.

---

## 전산/앱/홈페이지/팩스/헬프데스크 필드

| 필드 | Insurer |
| --- | --- |
| 전산 | `systemUrl` |
| 앱/포털 | `plannerPortalUrl` (fixture 대부분 null) |
| 홈페이지 | `officialWebsiteUrl` |
| 고객센터 | `customerCenterPhone` |
| 헬프데스크 | `helpdeskPhone` |
| 청구 팩스 | `claimFaxNumber`, `claimFaxHandlingType` |
| 일반 팩스 | `faxNumber` |
| 청구 우편 | `mailingAddress`, `registeredMailAddress` |

---

## 지식 아카이브 구조

| 계층 | 경로 |
| --- | --- |
| Schema | `KnowledgeArticle` — `status`, `isPublished`, `category`, `tags`, `sourceUrl` |
| UI seed (참고) | `app/knowledge/knowledge-seed.ts` — 10건, 전부 `needs_review` |
| Starter import | `lib/content/knowledge-starter-drafts.ts` |
| Public | `lib/public/knowledge-articles.ts` — `PUBLIC_KNOWLEDGE_WHERE` |
| Admin | `app/admin/knowledge/*`, `lib/knowledge/workflow-labels.ts` |

**Public 조건:** `isPublished: true` AND `status ∈ { verified, needs_review }`.

---

## 카테고리/태그 구조

- **지식:** Prisma `KnowledgeArticleCategory`, `tags: String[]`, seed `KNOWLEDGE_CATEGORIES` 8종
- **청구서류:** `ClaimDocumentCategory` (입원/통원/진단/수술 등)
- **보험사:** `InsurerCategory` (`life` / `non_life`)

---

## public visibility guard

| 엔티티 | Guard |
| --- | --- |
| Insurer / ClaimDocument | `isPublished` + `verified` \| `needs_review` |
| Knowledge | `PUBLIC_KNOWLEDGE_WHERE` |
| Disclosure / Message | `reviewedAt` + published status (별도 WHERE) |
| Draft publish | `wouldPublishDraft` 차단 (`lib/public/visibility.ts`) |

**테스트:** `tests/public/public-visibility.test.ts`, `tests/public/public-routes-smoke.test.ts`

---

## 검수 상태 구조

- Prisma `VerificationStatus`: draft, verified, needs_review, unverified, pending
- **Public 허용:** verified, needs_review only
- Fixture 보험사 49건: 전부 `needs_review`, `isPublished: true` (public 표시 **가능**, 단 출처 미검수)

---

## seed/sample/fixture

| 자산 | 건수 | 용도 |
| --- | ---: | --- |
| `insurerDirectoryEntries` | 49 | 디렉터리 mock/seed |
| `claimDocumentCandidateFallback` | 35 | 청구 참고 fallback |
| `KNOWLEDGE_SEED_ITEMS` | 10 | UI/문서 참고 seed |
| `claim-form-files.ts` | 다수 PDF href | 정적 파일 링크 |
| Answer Assistant | `tests/answer-assistant/fixtures.ts` | 테스트 전용 |

**주의:** fixture ≠ 운영 DB. 운영 행 수·검수 상태는 **정보 부족**.

---

## Answer Assistant 운영 데이터 (메타만)

- Usage audit / beta feedback: metadata-only (PR-100~102)
- Retrieval: `PUBLIC_VERIFICATION_STATUSES` 동일 필터 on insurers/claims
- **본 PR:** 콘텐츠 DB 품질과 분리; allowlist·gate **미변경**

---

## 정보 부족 항목

- 운영 DB 실제 행 수·중복·오탈자
- production URL·팩스·전산 링크 **현행성** (공식 출처 미확인)
- 보험사별 청구서류 DB 연결률 (`insurerId` 매핑)
- 지식 DB 게시·초안 비율
