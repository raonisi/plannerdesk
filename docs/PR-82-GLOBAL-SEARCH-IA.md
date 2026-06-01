# PR-82: Global Search IA (Information Architecture)

**설계 전용 PR.** 전역 검색 UI, API, Prisma 쿼리, full-text migration, route, AI/RAG/vector 검색은 포함하지 않는다.

| 후속 PR | 범위 |
|---------|------|
| PR-83 | Public Global Search 구현 |
| PR-85 | Admin 통합 검색 고도화 |

**코드 계약:** `lib/search/types.ts` (타입·도메인 상수만, 실행 함수 없음)

---

## 1. 목적

### 1.1 Global Search의 목적

PlannerDesk **public** 사용자와 **관리자**가 이미 검수·공개된 참고 콘텐츠의 **위치를 빠르게 찾는** 탐색 도구.

| 목적 | 설명 |
|------|------|
| 보험사 정보 탐색 | 디렉토리에 공개된 보험사·연락처·링크 |
| 청구서류 안내 탐색 | 공개된 청구서류 라이브러리 |
| 지식 아카이브 탐색 | 공개·검수된 KnowledgeArticle |
| 공시·약관 링크 탐색 | PR-75 public 조건을 충족한 DisclosureLink |
| 고객문구 탐색 | PR-76 public 조건 + **safeCopy만** |
| 범위 분리 | public 검색 vs admin 검색 권한·필드 분리 |
| 안전 | 미검수·비공개·내부·민감 데이터 검색·노출 차단 |

### 1.2 목적이 아닌 것

- 개인정보·의료정보·계약정보 검색
- 보험금 지급 가능성·손해사정·의료 판단
- CorrectionRequest **public** 검색
- AI 답변·RAG·벡터·파일/OCR 검색
- 제보/검수 큐의 자동 반영·자동 수정

PlannerDesk는 보험금 지급 여부를 판단하지 않으며, 손해사정 업무를 수행하지 않는다.

---

## 2. 검색 대상 도메인

### 2.1 Public 검색 대상 (5개)

| 도메인 | Prisma 모델 | Public 허브 |
|--------|-------------|-------------|
| 보험사 | `Insurer` | `/directory` |
| 청구서류 | `ClaimDocument` | `/claim-documents` |
| 지식 아카이브 | `KnowledgeArticle` | `/knowledge`, `/knowledge/[slug]` |
| 공시·약관 | `DisclosureLink` | `/disclosure-links` |
| 고객문구 | `MessageTemplate` | `/message-templates` |

### 2.2 Public 검색 제외

| 제외 대상 | 이유 |
|-----------|------|
| `CorrectionRequest` | 제보 큐·민감정보 가능; PR-78~81 정책 |
| `adminMemo`, `complianceNote`, `forbiddenClaims` (raw) | 내부 검수·컴플라이언스 |
| `reviewedById`, `resolvedById`, `createdById` 등 | 운영자 식별자 |
| `containsSensitiveData`, `redactionRequired`, CorrectionRequest.message | 민감 제보 |
| `MessageTemplate.body` | public 미노출; 검색·결과 모두 금지 |
| draft / archived / unpublished / internal-only | visibility 미충족 |
| Work-tools API, Auth tables | 범위 외 |

---

## 3. 도메인별 public visibility 조건

**원칙:** PR-83은 아래 조건을 **기존 public fetch의 WHERE/헬퍼와 동일**하게 재사용한다. 규칙 이중 정의 금지.

### 3.1 Insurer

**출처:** `lib/public/insurers.ts`, `lib/public/visibility.ts`

```ts
isPublished === true
verificationStatus ∈ { verified, needs_review }  // VerificationStatus enum
```

Prisma (현행 `getPublicInsurers`):

```ts
where: {
  isPublished: true,
  verificationStatus: { in: ["verified", "needs_review"] },
}
```

**참고:** `isActive` 필드는 Insurer 모델에 없음. 공개 여부는 `isPublished` + `verificationStatus`로만 판단.

**Public 검색 허용 필드 (후보):**

- `name`, `category`
- public projection에 이미 노출되는 URL·전화·팩스·주소·카드납 안내 등 (`PublicInsurer` 타입 동기)

**검색 제외:**

- `notes`, `sourceNote`, `createdById`, `updatedById`, 미공개 행 전체

### 3.2 ClaimDocument

**출처:** `lib/public/claim-documents.ts`

```ts
isPublished === true
verificationStatus ∈ { verified, needs_review }
```

**Public 검색 허용 필드:**

- `title`, `slug`, `category`, `summary`, `requiredDocuments`, `optionalDocuments`
- `customerMessageTemplate`, `cautionNote` (public select에 포함된 필드만)
- `insurer.name` (relation)

**검색 제외:**

- governance 필드, 미공개 행, 보험금 판단성 문구는 결과 요약에서 금지 표현 필터 검토 (PR-83)

### 3.3 KnowledgeArticle

**출처:** `lib/public/knowledge-articles.ts`

```ts
isPublished === true
status ∈ { verified, needs_review }   // KnowledgeArticleStatus enum
```

**참고:** KnowledgeArticle에는 `isInternalOnly` 필드가 **없음** (MessageTemplate 전용). 내부 전용 구분은 `status` + `isPublished`로 관리.

**Public 검색 허용 필드:**

- `title`, `summary`, `slug`, `category`, `type`, `tags`, `workflowLabel`
- `sourceTitle`, `sourceType` (public list projection)
- 상세 검색 시 `content`는 **public 상세 페이지에 이미 노출**되므로 PR-83에서 검색 대상 포함 여부를 팀이 확정 (기본: summary 우선, content는 visibility 통과 행만)

**검색 제외 (public 결과 카드):**

- `reviewedById`, `createdById`, `updatedById`
- `forbiddenClaims` 원문 배열 전체 노출 금지 (상세 페이지 정책과 정렬)

### 3.4 DisclosureLink (PR-75)

**출처:** `lib/public/disclosure-links.ts` — `PUBLIC_DISCLOSURE_LINK_WHERE`

```ts
isPublished === true
status === "published"           // DisclosureLinkStatus.published
reviewedAt !== null
```

**Public 검색 허용 필드:**

- `title`, `description`, `sourceName`, `category`, `targetType`
- `insurer.name` (relation)

**검색 제외:**

- `adminMemo`, `reviewedById`, `createdById`, `updatedById`, `url` raw가 invalid면 public fetch와 동일하게 sanitize

### 3.5 MessageTemplate (PR-76)

**출처:** `lib/public/message-templates.ts` — `PUBLIC_MESSAGE_TEMPLATE_WHERE`

```ts
isPublished === true
status === "published"             // MessageTemplateStatus.published
isInternalOnly === false
reviewedAt !== null
safeCopy IS NOT NULL AND safeCopy !== ""
```

추가 런타임 필터 (현행 public list):

- `findProhibitedPhrase(safeCopy)` 통과 행만 노출

**Public 검색·표시:**

- **오직 `safeCopy`** (+ title, description, category, channel, audienceType, useCase, tone)
- **`body`는 검색 대상도, 결과 스니펫도 아님**

**검색 제외:**

- `body`, `forbiddenClaims`, `complianceNote`, `allowedVariables`, `reviewedById`, 내부 검수 메타

### 3.6 CorrectionRequest

| 범위 | 정책 |
|------|------|
| Public search | **절대 포함하지 않음** |
| Admin search (PR-85) | 관리자 전용; message 전문 검색·preview 제한; PR-81 인박스 정책 준수 |

---

## 4. Admin 검색 범위 (PR-85 설계)

### 4.1 대상

| 도메인 | Admin 검색 |
|--------|------------|
| Insurer | 허용 |
| ClaimDocument | 허용 |
| KnowledgeArticle | 허용 |
| DisclosureLink | 허용 |
| MessageTemplate | 허용 (body는 admin UI에서만; 검색 preview 정책 PR-85에서 확정) |
| CorrectionRequest | 허용하되 **별도 제한** |

### 4.2 CorrectionRequest admin 검색 제한

- `requireContentManagerAccess` 이상
- `containsSensitiveData` / `redactionRequired` 행: title·message **미리보기 최소화**
- message 전문 검색은 PR-85에서 성능·컴플라이언스 검토 후 결정
- 외부 복사·공유 UI 없음 (PR-81과 동일)
- public API/검색 경로에 **절대 노출하지 않음**

### 4.3 adminMemo 검색 (PR-85 결정 사항)

| 도메인 | 기본 설계 |
|--------|-----------|
| DisclosureLink, MessageTemplate, CorrectionRequest | admin 전용 인박스·편집 화면에서만; **통합 검색 기본 제외** 권장 |
| 통합 검색에 포함 시 | content_admin 이상, 결과에 “내부 메모” 뱃지, public 경로 미노출 |

---

## 5. 검색 결과 타입

**구현 파일:** `lib/search/types.ts`

### 5.1 Public

```ts
type GlobalSearchResultType =
  | "insurer"
  | "claim_document"
  | "knowledge_article"
  | "disclosure_link"
  | "message_template";

interface GlobalSearchResult {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  summary?: string;
  url: string;
  categoryLabel?: string;
  sourceLabel?: string;
  updatedAt?: string;
  publishedAt?: string;
}
```

**Public 결과에 넣지 않는 것:** `status`, `isPublished`, `adminMemo`, `reviewedBy`, `containsSensitiveData`, `body`, 내부 enum raw 값(필요 시 `categoryLabel`만)

### 5.2 Admin (PR-85)

```ts
type AdminSearchResultType = GlobalSearchResultType | "correction_request";

interface AdminSearchResult extends GlobalSearchResult {
  type: AdminSearchResultType;
  status?: string;
  isPublished?: boolean;
  isInternalOnly?: boolean;
  riskBadge?: string;
  adminUrl: string;
  containsSensitiveData?: boolean;
  redactionRequired?: boolean;
}
```

---

## 6. 검색 결과 URL 정책

**코드베이스 기준 (2026-05).** 개별 public 상세 route가 없는 도메인은 **허브 + 쿼리/앵커**로 안내.

| type | Public `url` | Admin `adminUrl` |
|------|--------------|----------------|
| `insurer` | `/directory?search={encodeURIComponent(name)}` | `/admin/insurers/{id}/edit` |
| `claim_document` | `/claim-documents` (PR-83: slug hash 또는 목록 내 하이라이트 검토) | `/admin/claim-documents/{id}/edit` |
| `knowledge_article` | `/knowledge/{slug}` | `/admin/knowledge/{id}/edit` |
| `disclosure_link` | `/disclosure-links` (목록; 카드 스크롤/필터는 PR-83) | `/admin/disclosure-links/{id}/edit` |
| `message_template` | `/message-templates` | `/admin/message-templates/{id}/edit` |
| `correction_request` | *(public 없음)* | `/admin/corrections/{id}` |

**금지:** public 결과 URL에 admin 경로, 제보 원문 deep link, 자동 반영 action URL

---

## 7. 검색어 처리 기준 (PR-83)

| 규칙 | 값 |
|------|-----|
| trim | 필수 |
| 최소 길이 | **2자** (한글 1음절 제외 권장) |
| 최대 길이 | **100자** (CorrectionRequest title 상한과 정렬) |
| HTML/script | 제거·차단 (`lib/correction-request/sanitize.ts` 패턴 재사용 검토) |
| SQL | Prisma parameterized query only |
| URL spam | 검색어에 URL 3개 이상 → validation 실패 또는 무시 |

### 7.1 민감 검색어 차단

PR-80 `lib/correction-request/validation.ts` 키워드·패턴을 **공유 모듈로 추출**하는 것을 PR-83에서 권장.

차단 시 public 응답 예:

> 개인정보, 의료정보, 보험금 지급 판단 관련 검색은 제공하지 않습니다. 정보 위치 안내 목적의 일반 키워드로 다시 검색해 주세요.

**금지 UX:** “보험금 가능 여부를 검색해 드립니다”, AI 답변형 placeholder

---

## 8. 검색 결과 노출 기준

### 8.1 Public 카드 허용

- 제목, 짧은 summary (safeCopy/summary/description 등 public 필드만)
- 도메인 라벨, categoryLabel, sourceLabel
- updatedAt / publishedAt (ISO date, YYYY-MM-DD)
- public url (§6)

### 8.2 Public 카드 금지

- adminMemo, body, forbiddenClaims, complianceNote
- reviewedBy*, resolvedBy*, status badge (내부 워크플로)
- CorrectionRequest 일체
- 민감정보·계약·의료 원문

---

## 9. UI IA (PR-83)

```
[ Global search input — placeholder: "보험사, 청구서류, 공시, 지식, 고객문구 검색" ]

[ 도메인 필터 chips ]
  전체 | 보험사 | 청구서류 | 지식 | 공시·약관 | 고객문구

[ 결과 리스트 ]
  - 도메인 뱃지
  - title (link)
  - summary (2~3 lines max)
  - category / source
  - updated date

[ Empty state ]
[ Sensitive query blocked banner ]
[ Loading skeleton ]
```

**배치 후보:** `components/header.tsx` 확장 또는 `/search` 전용 페이지 (PR-83에서 단일안 선택)

**모바일:** 필터 가로 스크롤, 카드 full-width, 입력 `min-height` 44px

**금지:** 파일 첨부, 채팅형 AI UI, 보험금 판단 CTA

---

## 10. Ranking (초기 — 비-AI)

도메인별 단순 점수 (PR-83):

1. title exact match
2. title contains
3. category / tags match
4. description / summary / safeCopy contains
5. `sortOrder` asc (해당 모델)
6. `updatedAt` desc

**도메인 부스트 (휴리스틱):**

| 검색어 힌트 | 우선 도메인 |
|-------------|-------------|
| 보험사명 패턴 | insurer |
| 청구, 서류 | claim_document |
| 약관, 공시 | disclosure_link |
| 문자, 카톡, 안내문구 | message_template |
| 기준, 지식, 설명 | knowledge_article |

벡터·학습형 ranking **제외**.

---

## 11. Pagination / Limit

| 항목 | 권장 |
|------|------|
| 페이지당 결과 | ≤ 20 |
| 도메인별 cap | 각 5~10 (domain=all 시) |
| 빈 검색어 | PR-83: “최근 공개” 추천은 optional; 무제한 전체 목록 **금지** |
| Rate limit | PR-83: IP/세션 기초 제한 검토 (CorrectionRequest 제출과 유사) |

---

## 12. 보안·컴플라이언스

- Public: **검수·공개 조건 통과 행만** — §3 WHERE 재사용
- Admin: RBAC `canAccessAdmin` + `canManageContent` (도메인별 기존 access.ts)
- Public/admin 검색 **함수 분리** (`getPublicGlobalSearchResults` vs `getAdminGlobalSearchResults`)
- AuditLog: PR-82 범위 외; PR-85에서 필요성 검토

---

## 13. PR-83 구현 전 체크리스트

`docs/PR-82-GLOBAL-SEARCH-CHECKLIST.md` 참조.

핵심:

- [ ] 도메인별 visibility = 기존 `lib/public/*` 와 동일
- [ ] MessageTemplate = safeCopy only
- [ ] CorrectionRequest public 제외
- [ ] Insurer URL = `/directory?search=`
- [ ] 민감 검색어 차단 모듈
- [ ] 타입 = `lib/search/types.ts`
- [ ] AI/RAG/vector/migration 없음

---

## 14. PR-85 Admin Search 전 체크리스트

- [ ] `requireCorrectionContentManager` 등 서버 guard
- [ ] CorrectionRequest preview 제한
- [ ] adminMemo 통합 검색 포함 여부 확정
- [ ] deleted/archived CorrectionRequest 필터
- [ ] AuditLog 필요성

---

## 15. 기존 코드 참조 맵

| 관심사 | 경로 |
|--------|------|
| Insurer public | `lib/public/insurers.ts` |
| ClaimDocument public | `lib/public/claim-documents.ts` |
| Knowledge public | `lib/public/knowledge-articles.ts` |
| Disclosure public | `lib/public/disclosure-links.ts` |
| MessageTemplate public | `lib/public/message-templates.ts` |
| Shared published rule | `lib/public/visibility.ts` |
| Correction policy | `docs/PR-78-CORRECTIONREQUEST-POLICY.md` |
| Admin RBAC | `lib/auth/access.ts`, `lib/auth/rbac.ts` |
| Admin list filter 패턴 | `app/admin/disclosure-links/page.tsx` |
| Search types | `lib/search/types.ts` |

---

## 16. PR-82 범위 외 (명시적 비구현)

- `app/search/*`, `app/api/search/*`
- `getGlobalSearchResults()` 및 Prisma `contains`/`search` 쿼리
- Full-text index migration
- Header 검색 UI wiring
- Admin 통합 검색 UI
- Autocomplete, AI, RAG, vector
- CorrectionRequest public endpoint
