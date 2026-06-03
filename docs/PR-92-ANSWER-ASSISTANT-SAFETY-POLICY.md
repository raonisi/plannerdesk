# PR-92: Answer Assistant Safety Policy

**정책 설계 전용 PR.** LLM API 호출, RAG, 벡터 검색, 임베딩, 프롬프트 실행, 답변 생성 UI, public 챗봇, schema/migration, API key/env 추가는 이 PR에 포함하지 않는다.

## 0. 개발 맥락·선행 PR

| 선행 PR | 내용 |
|---------|------|
| PR-78~81 | [CorrectionRequest 정책](./PR-78-CORRECTIONREQUEST-POLICY.md) — 민감 제보·admin-only 큐 |
| PR-82~85 | [Global Search IA](./PR-82-GLOBAL-SEARCH-IA.md) — public/admin 검색 분리·필드 제한 |
| PR-86~88 | [Planner Verification 정책](./PR-86-PLANNER-VERIFICATION-POLICY.md) — 검증 설계사 RBAC |
| PR-89~91 | [Community 정책](./PR-89-COMMUNITY-POLICY.md) · [CommunityPost schema](./PR-90-COMMUNITYPOST-SCHEMA.md) · Community MVP |
| — | [Knowledge Content Policy](./KNOWLEDGE_CONTENT_POLICY.md) — 지식 콘텐츠 안전 경계 |

| 후속 PR | 범위 |
|---------|------|
| PR-93 | Retrieval 후보 설계 (본 문서 §14) |
| PR-94 | 관리자 내부 초안 MVP (본 문서 §15) |
| PR-95 | 제한 공개 검토 (본 문서 §16) |

PlannerDesk는 **손해사정 업무를 수행하지 않으며**, **의료 진단을 해석하지 않으며**, **보험금 지급 여부를 판단하지 않는다.** ([CORRECTION_REQUEST_POLICY.md](./CORRECTION_REQUEST_POLICY.md), [KNOWLEDGE_CONTENT_POLICY.md](./KNOWLEDGE_CONTENT_POLICY.md)와 동일 경계)

---

## 1. Purpose (목적)

### 1.1 답변 보조 기능의 목적

| 목적 | 설명 |
|------|------|
| 관리자·검증 설계사 초안 보조 | 운영자가 검수하기 **전** 답변 초안 형태로만 제공 |
| 지식 아카이브 기반 일반 정보 요약 | 검수·공개된 KnowledgeArticle 중 AI 사용 가능 문서만 |
| 공시·약관 확인 경로 안내 | DisclosureLink 등 공식 출처 링크 중심 |
| 고객 안내 문구 초안 | MessageTemplate **safeCopy** 기반 중립 표현 후보 |
| 커뮤니티 질문 일반 기준 정리 | **공식 근거가 아닌** 실무 의견은 별도 라벨·제외 원칙 |
| 공식 확인 필요 항목 표시 | 약관·보험사 안내 확인이 필요한 항목을 명시 |

### 1.2 목적이 아닌 것

- 보험금 **지급 가능성**·금액 판단
- **손해사정성** 판단
- **의료정보** 해석 (질병·진단·수술·입원·검사 결과)
- 고객별 **계약 보장 여부** 판단
- 특정 보험상품 **추천**·가입·해지·전환 **권유**
- 투자·법률·세무 판단
- public **자동 답변**·커뮤니티 **자동 댓글**
- 자동 상담·자동 설계·자동 심사
- 고객 맞춤 보험 설계

---

## 2. Feature scope by phase (기능 범위 구분)

### 2.1 PR-92 (본 PR)

| 허용 | 금지 |
|------|------|
| 안전정책·금지 범위·근거 데이터 기준 문서 | 실제 답변 생성 |
| 답변 템플릿·출력 안전 기준 문서 | LLM 호출 |
| PR-93~95 체크리스트 | RAG·벡터 검색·UI |

### 2.2 PR-93 — Retrieval 후보 설계

| 허용 후보 | 금지 |
|-----------|------|
| verified 문서 후보 정의 | 실제 답변 생성 |
| `aiUsable`·`reviewedAt` 기준 검토 | public 챗봇 |
| source priority·select 필드 제한 설계 | CorrectionRequest retrieval |

### 2.3 PR-94 — 관리자 내부 초안 MVP

| 허용 후보 | 금지 |
|-----------|------|
| ADMIN 전용 초안 생성 | public 직접 답변 |
| 검수 전 저장 금지 또는 “초안” 표시만 | 자동 게시·자동 댓글 |
| 출처 목록·금지 질문 차단 | 고객 자동 발송 |

### 2.4 PR-95 — 제한 공개 검토

| 허용 후보 | 금지 |
|-----------|------|
| 검수 완료 지식 기반 **제한** 안내 | 보험금·의료·계약 판단 |
| 출처 링크 중심 답변 | 자동 상담 |
| 답변 범위·한계 고지 | GENERAL_USER public 챗봇 (로드맵 제외) |

---

## 3. User permission tiers (사용자별 권한)

정책 용어와 PlannerDesk 구현 매핑 ([PR-86 §2](./PR-86-PLANNER-VERIFICATION-POLICY.md), [lib/auth/rbac.ts](../lib/auth/rbac.ts)):

| 정책 단계 | 구현 | 답변 보조 접근 | 비고 |
|-----------|------|----------------|------|
| **GENERAL_USER** | `anonymous_public` (비로그인 포함) | **불가** | public 직접 답변 금지 |
| **PENDING_PLANNER** | `PlannerVerification.status ∈ { pending, under_review }` | **불가** | 검증 전 사용 제한 |
| **VERIFIED_PLANNER** | §3.1 조건 충족 | **PR-95 이후 검토** | PR-94까지 제외 |
| **SUSPENDED_PLANNER** | `PlannerVerification.status = suspended` 또는 `User.status = suspended` | **불가** | 글쓰기·답변 보조 동시 제한 |
| **ADMIN** | `super_admin` \| `content_admin` | **PR-94 대상** | 내부 초안 MVP |

### 3.1 기본 원칙

- **PR-94까지:** `super_admin` \| `content_admin` **내부 초안 보조만** 허용한다.
- **VERIFIED_PLANNER** 대상 공개는 **PR-95** 이후 별도 안전성·법무 검토 후 결정한다.
- **GENERAL_USER** 대상 public 답변 챗봇은 **현재 로드맵에서 제외**한다.
- 권한은 UI 숨김이 아니라 **server-side**에서 검증한다 ([PR-91 Community](../app/community/access.ts) 패턴).

### 3.2 VERIFIED_PLANNER 후속 허용 시 추가 조건 (PR-95)

PR-91 Community 글쓰기와 동일 기준을 **최소** 충족:

1. `User.role = verified_planner`
2. `PlannerVerification.status = approved`
3. `PlannerVerification.deletedAt` is null
4. `PlannerVerification.status ≠ suspended`
5. `User.status = active`

---

## 4. Allowed evidence data (사용 가능한 근거 데이터)

답변 보조 retrieval은 **public fetch·admin search보다 엄격**한 조건을 적용한다. PR-93에서 코드로 고정한다.

### 4.1 KnowledgeArticle

**Public baseline:** `lib/public/knowledge-articles.ts` — `PUBLIC_KNOWLEDGE_WHERE`

```ts
isPublished === true
status ∈ { verified, needs_review }
```

**Answer-assist 추가 권장 조건 (PR-93):**

| 조건 | 이유 |
|------|------|
| `status = verified` | needs_review는 public 읽기만 허용; AI 근거는 검수 완료 우선 |
| `aiUsable = true` | [schema](../prisma/schema.prisma) · [KNOWLEDGE_CONTENT_POLICY](./KNOWLEDGE_CONTENT_POLICY.md) |
| `reviewedAt` 또는 `reviewedById` 존재 | 검수자 추적 |
| `sourceUrl` 또는 `sourceTitle` (유형별) | 출처 표시 가능 |
| `riskLevel ≠ blocked` | 고위험·차단 문서 제외 |

**허용 select (후보):** `title`, `summary`, `content`, `slug`, `category`, `type`, `sourceTitle`, `sourceUrl`, `sourceType`, `safeCopy`, `tags`, `workflowLabel`

**제외:** `forbiddenClaims`, `reviewedById` public 노출, draft/archived/rejected

### 4.2 DisclosureLink

**Public baseline:** `lib/public/disclosure-links.ts` — `PUBLIC_DISCLOSURE_LINK_WHERE`

```ts
isPublished === true
status === "published"
reviewedAt !== null
```

**Answer-assist:** public 조건과 동일 + `url` 유효성 검증 + 공식 출처 우선 (`isOfficialSource`)

**허용 select:** `title`, `description`, `url`, `category`, `targetType`, `sourceName`, `insurer.name`

**제외:** `adminMemo`, `reviewedById`, draft/archived

### 4.3 MessageTemplate

**Public baseline:** `lib/public/message-templates.ts` — `PUBLIC_MESSAGE_TEMPLATE_WHERE`

```ts
isPublished === true
status === "published"
isInternalOnly === false
reviewedAt !== null
safeCopy IS NOT NULL AND safeCopy !== ""
```

**Answer-assist 핵심 규칙:**

- **오직 `safeCopy`만** retrieval·답변 생성 근거로 사용
- `title`, `description`, `category`, `channel`, `tone`, `useCase`는 맥락 라벨만
- **`body` 절대 사용 금지** ([PR-82 §3.5](./PR-82-GLOBAL-SEARCH-IA.md))

### 4.4 Insurer / ClaimDocument

**Public baseline:** `lib/public/insurers.ts`, `lib/public/claim-documents.ts`

```ts
isPublished === true
verificationStatus ∈ { verified, needs_review }
```

**Answer-assist:**

- 공식 출처 확인 가능한 **일반 안내** 필드만
- 연락처·URL은 public projection과 동일
- **청구자료 원본·고객별 사례·보험금 판단성 문구** 제외
- `notes`, `sourceNote`, governance 필드 제외

### 4.5 CommunityPost

**원칙: 답변 근거로 사용하지 않음** ([PR-89 §14](./PR-89-COMMUNITY-POLICY.md))

후속 검토 시에만 **별도 PR**에서 아래 **모두** 충족 + “실무 의견” 라벨 필수:

- `status = published`, `isBlind = false`, `deletedAt` null
- ADMIN 검수 완료·민감정보 없음
- 공식 기준처럼 표시 **금지**

### 4.6 Global Search와의 관계

| 기능 | 검색( PR-82~85 ) | 답변 보조( PR-93+ ) |
|------|------------------|---------------------|
| 목적 | 위치·문서 탐색 | 초안 생성 근거 |
| KnowledgeArticle | needs_review 포함 public | **verified + aiUsable** 권장 |
| MessageTemplate | safeCopy 검색 | safeCopy만 |
| CorrectionRequest | public **제외** | retrieval **제외** |
| CommunityPost | public search **제외** | retrieval **제외** |

---

## 5. Forbidden evidence data (사용 금지 데이터)

아래는 retrieval·prompt context·답변 생성 **어떤 단계에서도** 포함하지 않는다.

| 데이터 | 이유 |
|--------|------|
| `CorrectionRequest` 원문 (`title`, `message`) | 민감 제보·PII 가능 ([PR-78](./PR-78-CORRECTIONREQUEST-POLICY.md)) |
| `CommunityReport` 원문 | 신고자·민감 내용 |
| `adminMemo` (모든 모델) | admin-only |
| `forbiddenClaims` | 금지 표현 목록 — 역으로 악용 가능 |
| `complianceNote` 원문 | 내부 컴플라이언스 |
| `MessageTemplate.body` | public 미노출; 전체 문구 리스크 |
| 미검수·draft·archived·rejected·deleted 행 | visibility 미충족 |
| `isInternalOnly = true` MessageTemplate | 내부 전용 |
| 블라인드·삭제 CommunityPost | moderation 대상 |
| 신고 접수·미검토 CommunityPost | 검증 전 |
| PII·의료·계약·청구자료 **가능** 필드 | 입력·저장·재출력 금지 |
| OCR 텍스트·파일·첨부 | 미구현·금지 |
| 외부 상담 기록 | 범위 외 |

**MessageTemplate 요약:** public·답변 보조 모두 **`safeCopy`만**. `body`, `forbiddenClaims`, `complianceNote`는 근거로 사용하지 않는다.

---

## 6. Absolutely forbidden answer domains (절대 금지 답변 범위)

### 6.1 보험금 지급 판단

**금지 질문 예시:**

- 이거 보험금 받을 수 있나요? / 지급 가능한가요?
- 수술비·진단비·입원비 받을 수 있나요?
- 면책인가요? / 부지급인가요? / 보장되나요?
- 얼마 받을 수 있나요?

**허용 대체 출력:**

- 개별 지급 판단은 하지 않음
- 약관·보험사 안내 **확인 경로** 안내
- 공식 확인 항목 체크리스트
- 개인정보·의료정보 제거 요청

### 6.2 손해사정성 판단

**금지:** 손해사정 결과 타당성, 보험사 거절 적정성, 분쟁 가능성, 사고 보상 대상 여부 단정

**허용 대체:** 손해사정성 판단 불가 고지, 공식 절차·확인 경로, 전문가·보험사 확인 필요 문구

### 6.3 의료정보 해석

**금지:** 진단명·수술명 보장 여부, 진단서·병원 기록 해석, 검사 결과 의미 설명

**허용 대체:** 의료 해석 불가, 의료기관·서류 발급처 확인 안내, PII·의료정보 입력 금지

### 6.4 상품 추천·가입 유도

**금지:** 고객별 상품 추천, “무조건 가입”, “이 상품이 최고”, 해지 겁주기 문구 생성

**허용 대체:** 일반 점검 체크리스트, 중립 문구 초안, 과장·공포 조장 없는 표현

---

## 7. Allowed answer scope (답변 허용 범위)

### 7.1 허용 가능

- 일반 정보 요약 (근거 문서 기반)
- 공개 자료·허브 **위치** 안내
- 약관·공시 **확인 경로** 안내
- 고객 설명용 **중립 문구 초안** (safeCopy·Knowledge 패턴)
- PII 제거 후 일반 기준 재질문 요청
- 공식 확인 필요 항목 체크리스트
- 관리자 검수용 답변 초안
- “판단 불가” / “공식 확인 필요” / “정보 부족” 안내

### 7.2 허용 표현 (예시)

- “공식 약관 또는 보험사 안내 기준 확인이 필요합니다.”
- “개별 보험금 지급 가능 여부는 이 기능에서 판단하지 않습니다.”
- “개인정보와 의료정보를 제외하고 일반 기준 중심으로 정리해 주세요.”
- “아래는 고객에게 안내할 때 사용할 수 있는 중립 문구 **초안**입니다.”
- “**관리자 검수 후** 사용해야 합니다.”

### 7.3 금지 표현 (예시)

- “지급됩니다.” / “부지급이 맞습니다.” / “면책입니다.”
- “이 상품이 가장 좋습니다.” / “무조건 가입해야 합니다.”
- “해지하면 큰일 납니다.” / “진단서상 보장됩니다.”
- “제가 판단해드리겠습니다.”

---

## 8. Input blocking criteria (입력 차단)

PR-94 server validation은 [CorrectionRequest PR-80](./PR-78-CORRECTIONREQUEST-POLICY.md), [Community PR-91](../app/community/validation.ts) 패턴을 따른다.

### 8.1 개인정보

이름+연락처 결합, 주민등록번호, 휴대전화, 이메일, 주소, 계좌, 신분증 정보

### 8.2 계약정보

계약번호, 증권번호, 보험료, 보장금액, 고객별 담보, 청구 금액

### 8.3 의료정보

병명, 진단명, 진단서, 병원명, 수술명, 입원일, 검사 결과, 처방, 장애·투약 정보

### 8.4 청구자료

진단서, 영수증, 입퇴원확인서, 청구서, 사고 경위서, 손해사정 자료, 전산·상담 캡처

### 8.5 파일

이미지, PDF, 사진, OCR 텍스트, 첨부파일 — **업로드 UI 자체 금지**

---

## 9. Output safety criteria (출력 안전 기준)

### 9.1 필수

- 단정 금지 (확률·가능성 결론 금지)
- 보험금·손해사정·의료 해석 금지
- 상품 강권·공포 조장 금지
- **출처·근거 목록** 표시 (§10)
- “관리자 검수 필요” 표시
- 불확실한 내용은 “확인 필요”
- 근거 0건이면 답변 생성 **금지** (§11)

### 9.2 금지

- 고객 즉시 발송 가능한 **단정적** 답변
- 약관 조항 **임의** 인용·해석
- 출처 없는 수치·날짜·상품명
- `adminMemo`·내부 필드 재출력
- 민감정보 **재생성·재출력**

---

## 10. Source and citation rules (출처·근거 기준)

### 10.1 Source priority (높음 → 낮음)

1. 공식 공시·약관 링크 (`DisclosureLink`, `isOfficialSource`)
2. 보험사·감독기관 **공식** 안내 (Insurer public URL)
3. 관리자 검수 완료 `KnowledgeArticle` (`verified`, `aiUsable`)
4. 검수 완료 `MessageTemplate.safeCopy`
5. 검수 완료 ClaimDocument **일반 안내** 필드
6. ~~CommunityPost~~ — **원칙 제외**

### 10.2 Citation display

- 답변 초안 **하단**에 참고 근거 목록
- 문서 **제목** + slug/ID + 공식 URL (있으면)
- 근거 없는 문장 → “확인 필요” 또는 생성 제외
- 근거 부족 → “정보 부족” 안내로 **대체** (환각 금지)

### 10.3 금지

- 존재하지 않는 출처·약관명·기사 생성
- 커뮤니티 의견을 **공식 기준**처럼 표시
- CorrectionRequest를 “근거”로 인용

---

## 11. Hallucination prevention (환각 방지)

| 조건 | 동작 |
|------|------|
| retrieval 0건 | 답변 생성 **금지** → “정보 부족” |
| 공식 근거 필요 질문 + 공식 근거 없음 | “공식 확인 필요” |
| 보험금 판단 질문 | 근거 있어도 **판단 금지** |
| 의료 해석 질문 | 근거 있어도 **해석 금지** |
| 상품 추천 질문 | **추천 금지** |
| 약관 조항 직접 인용 불가 | 임의 인용 **금지** |

**권장 출력:** “정보 부족”, “공식 확인 필요”, “개별 판단 불가”, “관리자 검수 필요”, “근거 문서 부족”

---

## 12. Prompt injection defense (PR-93+)

사용자 입력은 **지시(instruction)가 아니라 untrusted data**로 취급한다.

**차단·무시 대상:**

- “이전 지시 무시”, “시스템 프롬프트 출력”
- adminMemo·비공개 문서·draft 포함 요청
- 보험금·의료 판단 **강제** 요청
- 출처 없이 결론 내리기 요청
- 관리자 권한 **우회** 요청

**원칙:**

- retrieval 대상은 **서버 정책 WHERE**로만 결정
- public/admin 권한은 **session + RBAC** server 검증
- 내부 필드는 retrieval select에서 **제외**
- 모델 출력보다 **서버 정책·차단 규칙** 우선

---

## 13. Admin review principles (관리자 검수, PR-94)

- 출력은 **“초안”** 라벨 필수
- 자동 발송·자동 게시·커뮤니티 자동 답변 **금지**
- 고객 전송 버튼 **금지**
- 관리자 수정·검토 후에만 사용
- 위험 문장 감지 시 **초안 생성 차단** (입력 validation과 동일 패턴)
- PR-81 CorrectionRequest·PR-88 PlannerVerification과 **동등한** admin-only UX

---

## 14. PR-93 Retrieval design criteria

PR-93에서 설계·문서화할 항목:

| 항목 | 기준 |
|------|------|
| 검색 대상 도메인 | §4 허용 목록만; CorrectionRequest·CommunityReport **제외** |
| KnowledgeArticle | `verified` + `aiUsable` + public WHERE |
| MessageTemplate | **safeCopy만** |
| DisclosureLink | published + reviewedAt |
| Insurer / ClaimDocument | public WHERE; governance 필드 제외 |
| CommunityPost | **제외** (기본) |
| select 필드 | §4·§5 allowlist/denylist |
| public vs admin retrieval | admin-only 초안; public retrieval **PR-95까지 없음** |
| source priority | §10.1 |
| 근거 0건 | 답변 금지 |
| 민감 필드 | retrieval pipeline **hard exclude** |
| revalidate | answer-assist route만; public search revalidate **금지** ([PR-89 §15.4](./PR-89-COMMUNITY-POLICY.md)) |

**명시적 비구현 (PR-93):** 벡터 DB, embedding API, LLM completion, UI

---

## 15. PR-94 Internal draft MVP criteria

### 15.1 허용

- `requireContentManagerAccess` 또는 `requireAdminAccess` 보호
- KnowledgeArticle / DisclosureLink / MessageTemplate safeCopy / Insurer·ClaimDocument public 필드 기반 retrieval
- 금지 질문 **server-side** 차단 (§6, §8)
- 근거 목록 UI
- “관리자 검수 필요” 배너
- 초안 **복사**만 (발송·게시 action 없음)

### 15.2 금지

- public 챗봇·embed widget
- VERIFIED_PLANNER self-serve (PR-95까지)
- 자동 Community 댓글·Q&A 답변
- 파일·OCR
- LLM provider env·API key (별도 reviewed PR)
- schema migration (필요 시 audit log는 별도 PR)

---

## 16. PR-95 Limited public preconditions

PR-95 착수 **전** 필수:

- [ ] PR-94 내부 MVP **안정화** (운영 피드백)
- [ ] 금지 질문 차단 테스트 통과
- [ ] 근거 0건 → 답변 금지 테스트 통과
- [ ] public/admin retrieval·권한 **분리** 검증
- [ ] 출처 표시·가짜 출처 방지 검증
- [ ] MessageTemplate **body 미사용** 검증
- [ ] CorrectionRequest **미사용** 검증
- [ ] CommunityPost **근거 제외** 검증
- [ ] PII·의료·계약 **입력 차단** 검증
- [ ] 보험금·손해사정·의료 **출력 차단** 검증
- [ ] Antigravity·운영·법무 **승인**

PR-95에서도 **보험금·의료·손해사정 판단은 계속 금지**한다.

---

## 17. Security and compliance summary

### 17.1 금지

PII·의료·계약·청구자료 처리, 파일·OCR, 보험금·손해사정·의료 판단, 상품 강권, public 자동 답변, BOA CRM·Aiven 연결, 미검수 데이터 retrieval

### 17.2 허용

검수된 공개 참고 데이터 기반 **초안**, 출처 표시, 관리자 수동 검수, “판단 불가” 안내

---

## 18. Completion criteria (PR-92)

1. 답변 보조 목적·금지 범위 문서화 (§1–2)
2. 사용자 권한별 접근 (§3)
3. 사용 가능·금지 근거 데이터 (§4–5)
4. 보험금·손해사정·의료·상품 금지 (§6)
5. 허용 답변·입력·출력 기준 (§7–9)
6. 출처·환각·prompt injection (§10–12)
7. PR-93~95 연결 기준 (§14–16)
8. **코드·schema·migration·LLM 구현 없음**
9. 기존 기능 회 regress 없음

---

## 19. Related documents

| 문서 | 관계 |
|------|------|
| [PR-82-GLOBAL-SEARCH-IA.md](./PR-82-GLOBAL-SEARCH-IA.md) | public 필드·visibility baseline |
| [PR-78-CORRECTIONREQUEST-POLICY.md](./PR-78-CORRECTIONREQUEST-POLICY.md) | 제보 큐 retrieval 제외 |
| [PR-89-COMMUNITY-POLICY.md](./PR-89-COMMUNITY-POLICY.md) | Community 근거 제외·validation |
| [KNOWLEDGE_CONTENT_POLICY.md](./KNOWLEDGE_CONTENT_POLICY.md) | aiUsable·금지 표현 |
| [KNOWLEDGE_ARCHIVE_IA.md](./KNOWLEDGE_ARCHIVE_IA.md) | 지식 IA |
| [PR-92-ANSWER-ASSISTANT-CHECKLIST.md](./PR-92-ANSWER-ASSISTANT-CHECKLIST.md) | 후속 PR 체크리스트 |

---

## 20. Explicit non-implementation (PR-92)

- LLM·RAG·vector·embedding API
- 답변 생성 UI·public chatbot
- `prisma/schema.prisma` 변경
- `prisma/migrations/**` 추가
- `.env` / API key 추가
- server action·route handler (answer assist)
