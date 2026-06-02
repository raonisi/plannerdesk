# PR-89: Community 운영 정책

**정책 설계 전용 PR.** Prisma schema, migration, `CommunityPost`·댓글 모델, 게시판 UI, Q&A, 파일 업로드, OCR, AI 자동 답변·블라인드·신고 자동 처리, 외부 알림은 이 PR에 포함하지 않는다.

## 0. 개발 맥락·선행 PR

| 선행 PR | 내용 |
|---------|------|
| PR-86 | [Planner Verification 정책](./PR-86-PLANNER-VERIFICATION-POLICY.md) — 검증 목적·권한·금지 수집 |
| PR-87 | [PlannerVerification schema](./PR-87-PLANNER-VERIFICATION-SCHEMA.md) — DB 모델 |
| PR-88 | `/admin/planner-verifications` — 검증 큐 수동 처리 (**User.role 자동 변경 없음**) |
| PR-78~81 | [CorrectionRequest 정책](./PR-78-CORRECTIONREQUEST-POLICY.md) — 신고 큐·민감정보·adminMemo 패턴 참조 |

| 후속 PR | 범위 |
|---------|------|
| PR-90 | `CommunityPost`·신고 모델 DB schema (본 문서 §14) |
| PR-91 | Community MVP UI·server action (본 문서 §15) |

### 0.1 기존 RBAC ([prisma/schema.prisma](../prisma/schema.prisma), [lib/auth/rbac.ts](../lib/auth/rbac.ts))

| `User.role` | 커뮤니티 (본 PR 확정) |
|-------------|----------------------|
| `anonymous_public` | 읽기 MVP 기본 **허용** (블라인드·삭제 제외) |
| `verified_planner` | 글쓰기·댓글·Q&A **후보** — 아래 §2.2 추가 조건 |
| `moderator` | PR-91+ 게시 중재 **예약** (Verification 승인과 별개) |
| `content_admin` \| `super_admin` | 공지·블라인드·삭제·신고 처리 |

PlannerDesk는 **손해사정 업무를 수행하지 않으며**, **의료 진단을 해석하지 않으며**, **보험금 지급 여부를 판단하지 않는다.** ([KNOWLEDGE_CONTENT_POLICY.md](./KNOWLEDGE_CONTENT_POLICY.md), [CORRECTION_REQUEST_POLICY.md](./CORRECTION_REQUEST_POLICY.md)와 동일 경계)

---

## 1. Purpose (목적)

### 1.1 Community의 목적

| 목적 | 설명 |
|------|------|
| 실무 노하우 공유 | 검증 설계사 간 전산·청구·공시·운영 팁 |
| public 콘텐츠 보완 | 디렉토리·지식 아카이브·고객문구 개선 의견 |
| Q&A 효율 | **일반 기준** 중심 업무 질문 (개별 계약 판단 아님) |
| 현장 기준 문서화 | 커뮤니티 → 지식 아카이브 반영 **수동** 검토 후보 |
| 악용 방지 | 미검증·익명·광고성 게시 억제 |

### 1.2 목적이 아닌 것

- 고객 **개별** 계약 상담
- 보험금 **지급 가능성**·금액 판단
- **손해사정성** 판단
- **의료정보** 해석
- 특정 보험상품 **판매 권유**·가입 강권
- 고객 **개인정보** 수집·게시
- 청구서류·진단서 **원본** 접수·검토
- 외부 영업 **DB 모집**·리크루팅
- **AI 자동 답변** 서비스
- 법적 설계사 자격 **보증**

---

## 2. User permission tiers (사용자 권한 기준)

정책 용어와 PlannerDesk 구현 매핑 ([PR-86 §2](./PR-86-PLANNER-VERIFICATION-POLICY.md#2-user-permission-tiers-사용자-권한-구분)):

| 정책 단계 | 구현 | 읽기 (MVP 기본) | 글쓰기 | 댓글·Q&A |
|-----------|------|-----------------|--------|----------|
| **GENERAL_USER** | `anonymous_public` (비로그인 포함) | **허용**¹ | 불가 | 불가 |
| **PENDING_PLANNER** | `PlannerVerification.status ∈ { pending, under_review }` | **허용**¹ | 불가 | 불가 |
| **VERIFIED_PLANNER** | §2.2 조건 충족 | 허용 | **가능** | **가능** |
| **SUSPENDED_PLANNER** | `PlannerVerification.status = suspended` 또는 `User.status = suspended` | 제한² | 불가 | 불가 |
| **ADMIN** | `super_admin` \| `content_admin` | 허용 | 공지만³ | 공지·운영 답변³ |

¹ 블라인드(`isBlind`/`visibility`)/soft delete(`deletedAt`)·비공개 게시글 제외.  
² 정지 사용자에게 기존 공개 글 읽기 허용 여부 — PR-91에서 `visibility`로 확정; 기본은 non-blind만.  
³ ADMIN 일반 커뮤니티 잡담 글쓰기는 PR-91에서 제한; **공지·운영 안내**만 허용 권장.

### 2.1 VERIFIED_PLANNER의 의미

- PlannerDesk **내부 커뮤니티 권한**일 뿐, 외부 기관 공식 자격 보증 **아님**
- 보험금·손해사정·의료 판단 권한 **아님**
- 보험상품 판매 적격성 보증 **아님**

### 2.2 글쓰기·답변 가능 조건 (PR-91 server-side 필수)

PR-88에서 `User.role` **자동 변경 없음**. PR-91은 아래 **모두** 검증한다.

| # | 조건 |
|---|------|
| 1 | `User.role = verified_planner` **또는** (후속 PR) role sync 완료 전까지 **`PlannerVerification.status = approved`** 단독 허용 여부를 PR-90·91에서 코드로 확정 — **권장: 둘 다** |
| 2 | `PlannerVerification.status = approved` |
| 3 | `PlannerVerification.deletedAt` is null |
| 4 | `PlannerVerification.status ≠ suspended` |
| 5 | `User.status = active` |
| 6 | `User.status ≠ suspended` / `disabled` |

**권장 기본값 (PR-91):** `verified_planner` **AND** `approved` **AND** active — PR-86·87·88 정책과 일치.

### 2.3 `moderator` 역할 (후속)

- 게시글 중재·신고 1차 검토 **예약** ([RBAC_FOUNDATION_PLAN.md](./RBAC_FOUNDATION_PLAN.md))
- Verification **승인**과 혼동 금지
- PR-91 MVP: `content_admin` \| `super_admin`만 블라인드·삭제

---

## 3. Community access policy (접근 정책)

### 3.1 MVP 기본값 (본 PR 확정)

| 기능 | GENERAL / PENDING | VERIFIED | SUSPENDED | ADMIN |
|------|-------------------|----------|-----------|-------|
| 게시글 읽기 | **허용** | 허용 | 제한² | 허용 |
| 게시글 작성 | 불가 | **가능** | 불가 | 공지만 |
| 댓글 작성 | 불가 | **가능** | 불가 | 운영용 |
| Q&A 답변 | 불가 | **가능** | 불가 | 운영용 |
| 신고 | 로그인 시 **가능**⁴ | 가능 | 가능 | — |
| 블라인드 | 불가 | 불가 | 불가 | **가능** |
| 삭제 | 불가 | 본인 글 **제한**⁵ | 불가 | **가능** |
| 공지 작성 | 불가 | 불가 | 불가 | **가능** |

⁴ 신고는 로그인 사용자만 — 스팸 방지; 비로그인은 CorrectionRequest 패턴의 별도 제보 경로 유지.  
⁵ 본인 글 수정·삭제: 민감정보·신고 접수 후에는 PR-91에서 **제한**; soft delete만.

### 3.2 미검증 사용자 글쓰기

- PR-91 MVP: **제외** (운영 리스크)
- PENDING_PLANNER·GENERAL_USER: server action **차단**

### 3.3 public 노출 조건 (PR-90·91)

게시글 public 목록·상세 fetch:

- `status = published` (enum PR-90)
- `isBlind = false`
- `deletedAt` is null
- `visibility = public` (또는 동등)

---

## 4. Board categories (게시판 카테고리)

PR-90 enum 후보 — **snake_case** ([CorrectionRequest](./PR-78-CORRECTIONREQUEST-POLICY.md) 관례):

| Enum 후보 | 한글 | 허용 목적 | 금지 |
|-----------|------|-----------|------|
| `notice` | 공지 | ADMIN 운영 안내 | — |
| `field_tips` | 실무 노하우 | 전산·응대·업무 흐름 | 고객 특정·판단 |
| `claim_guide` | 청구 안내 | **안내 문구**·분류 개선 의견 | 청구자료 업로드·지급 판단 |
| `system_links` | 전산·링크 | 전산·공시·약관 URL 변경 공유 | 로그인 계정·고객 URL |
| `knowledge_qa` | 지식 Q&A | 지식 아카이브 보완 질문 | 의료·계약 판단 |
| `script_review` | 문구 검토 | MessageTemplate 개선 (일반화) | 고객 사례·병력 |
| `community_qa` | 설계사 Q&A | 일반 업무 질문 | **개별 계약·보험금 판단** |
| `other` | 기타 | 운영 의견 | 민감정보·판단 요청 |

**만들지 않는 카테고리:** 보험금 판단, 의료 해석, 고객 계약 상담, 상품 추천, 청구자료 접수.

---

## 5. Allowed content (허용 콘텐츠)

### 5.1 허용 예시

- 보험사 전산 사용 경로·주의사항 (계정 정보 제외)
- 공시·약관·청구양식 **링크 변경** 제보
- 청구서류 **안내 페이지** 개선 의견 (원본 서류 아님)
- 고객 설명 시 **중립** 표현·금지 표현 논의 ([MessageTemplate](./KNOWLEDGE_CONTENT_POLICY.md) 경계)
- 해지·유지 **일반 확인 순서** (개별 계약 아님)
- 지식 아카이브 오탈자·출처·분류 보완
- 설계사 업무 효율화 팁
- PlannerDesk 운영 개선 요청

### 5.2 허용 조건

- 개인 **고객 특정** 없음
- 병명·진단명·계약번호·연락처 **미포함**
- 보험금 지급 **단정** 없음
- 특정 상품 **강권** 없음
- **공포 조장** 없음
- 공식 기준 필요 시 “**확인 필요**”·“약관·보험사 기준 확인” 표현

---

## 6. Prohibited content (금지 콘텐츠)

### 6.1 개인정보

고객명, 연락처, 이메일, 주소, 주민등록번호, 계약번호, 증권번호, 계좌번호, 가족정보, 고객별 상담 **전문**

### 6.2 의료정보

병명, 진단명, 진단서 내용, 병원명, 수술명, 입원일, 처방, 진료기록, 검사 결과, 장애·투약 정보

### 6.3 청구·손해 자료

진단서·영수증·입퇴원확인서·청구서 **이미지**, 청구 금액, 사고 상세 진술, 손해사정 자료

### 6.4 보험금·손해사정 판단

“받을 수 있나요?”, “지급될까요?”, “면책인가요?”, “부지급 맞나요?”, “이 진단으로 보장되나요?”, 손해사정 결과 판단 요청

### 6.5 영업·광고

특정 상품 강권, “무조건 가입”, “지금 안 하면 손해”, 과장 수익 홍보, 외부 상담·DB 모집, **연락처 유도**, 리크루팅 반복

### 6.6 금지 파일·첨부 (PR-91~ 전 구간)

신분증, 증권, 청구서류, 진단서, 영수증, 명함, 고객 상담·카카오톡 **캡처**, 개인정보 포함 전산 캡처 — **업로드 UI 자체 금지**

---

## 7. Compose screen copy (게시글 작성 안내)

PR-91 작성 화면 **필수** 문구:

- “고객명, 연락처, 계약번호, 병명, 진단명, 청구서류 이미지는 입력하지 마세요.”
- “이 커뮤니티는 실무 정보 공유용이며 **보험금 지급 가능 여부를 판단하지 않습니다**.”
- “특정 상품 가입을 강권하거나 **공포를 조장**하는 표현은 제한됩니다.”
- “개인정보·의료정보·계약정보가 포함된 게시글은 **블라인드 또는 삭제**될 수 있습니다.”

**금지 UI 문구 (사용하지 않음):**

- “진단서를 올려주세요.” / “계약 내용을 올리면 판단해드립니다.” / “보험금 가능 여부를 확인해드립니다.” / “청구자료를 첨부해주세요.”

서버 validation: [CorrectionRequest PR-80](./PR-78-CORRECTIONREQUEST-POLICY.md) 패턴 — PII·의료·판단 키워드 **서버 차단**, client-only 의존 금지.

---

## 8. Comments and Q&A (댓글·답변)

게시글과 **동일** 금지 기준.

### 8.1 허용 답변

- 일반 기준·확인 **순서** 안내
- 공식 기준·약관·보험사 안내 **확인 필요** 안내
- 지식 아카이브·디렉토리 **링크** 안내
- “개인정보 제거 후 일반 상황으로 다시 질문해 주세요.”
- “보험금 판단은 이 커뮤니티에서 **처리하지 않습니다**.”

### 8.2 금지 답변

지급 가능성 **단정**, 면책·부지급 판단, 의료 해석, 상품 강권, PII·진단서·청구서류 **요구**, 외부 상담·연락처 유도

### 8.3 권장 답변 문구

- “개별 보험금 지급 가능 여부는 이 커뮤니티에서 판단하지 않습니다. 개인정보와 의료정보를 제외하고 일반 기준 중심으로 질문해 주세요.”
- “공식 약관과 보험사 안내 기준 확인이 필요한 사안입니다.”
- “고객 식별 정보는 삭제하고 일반적인 상황 기준으로만 정리해 주세요.”

PR-91 MVP: 댓글을 Q&A와 **동일 모델**로 할지, 게시글 `content`만 할지 — **게시글 중심 MVP 권장**, 댓글은 PR-91 또는 직후 PR.

---

## 9. Report policy (신고)

### 9.1 신고 사유 enum 후보 (`CommunityReportReason`, PR-90)

| Value | 설명 |
|-------|------|
| `personal_info` | 개인정보 포함 |
| `medical_info` | 의료정보 포함 |
| `contract_info` | 계약정보 포함 |
| `claim_document` | 청구자료 포함 |
| `payout_judgment` | 보험금 판단 요청 |
| `loss_adjustment` | 손해사정성 판단 |
| `product_push` | 상품 강권 |
| `fear_mongering` | 공포 조장 |
| `spam_ad` | 광고·스팸 |
| `external_contact` | 외부 연락 유도 |
| `abuse` | 비방·욕설 |
| `misinformation` | 허위정보 의심 |
| `duplicate` | 중복 게시 |
| `other` | 기타 |

### 9.2 처리 원칙

- 신고 접수 → **관리자 수동** 검토 (CorrectionRequest 큐 패턴)
- **자동 삭제·자동 블라인드 없음** (MVP)
- 명백한 PII·의료정보: 관리자 **즉시 블라인드** 가능
- 반복 위반 → [§12](#12-user-sanctions-사용자-제재) · PR-88 `PlannerVerification` **suspended** 연결 검토
- 신고 form에 PII **입력 유도 금지** — “해당 게시글 URL/ID만”

---

## 10. Blind policy (블라인드)

### 10.1 즉시 블라인드 후보

주민등록번호, 고객 연락처, 계약번호, 진단명·진단서, 청구서류 이미지, 보험금 판단 요청, 외부 상담 연락처, 명백한 광고·스팸

### 10.2 검토 후 블라인드

과장 상품 권유, 공포 조장 해지방어, 허위정보 의심, 논쟁성·반복 홍보

### 10.3 블라인드 후

- 작성자 수정 요청: PR-91에서 `status`/`isBlind` 해제 정책 확정
- `adminMemo` 기록 ([PR-88](./PR-86-PLANNER-VERIFICATION-POLICY.md) 패턴)
- 원문 **외부 공유·로그 전체 기록** 금지
- **자동 블라인드 MVP 미구현**

---

## 11. Deletion policy (삭제)

### 11.1 삭제 기준

- PII·의료·계약정보 포함 후 **수정 불가**
- 청구·진단서·영수증 **이미지** (텍스트라도 해당 내용)
- 반복 광고·스팸, 유료 상담 유도
- 보험금·손해사정 판단 **반복**
- 운영 기준 **반복 위반**

### 11.2 삭제 방식

- **soft delete** 우선 — `deletedAt` (PR-90)
- `adminMemo`·내부 `deletionReason` (admin-only)
- hard delete: 별도 운영·법무 검토
- 작성자 자진 삭제: 신고·민감정보 접수 **후** 제한

---

## 12. User sanctions (사용자 제재)

PR-89는 **정책만** 정의. 제재 전용 DB는 PR-90 또는 별도 PR.

| 단계 | 의미 | 구현 후보 |
|------|------|-----------|
| **WARNING** | 1차 경고 | `adminMemo` / 향후 `CommunitySanction` |
| **WRITE_RESTRICTED** | 기간 글쓰기 제한 | `User.status` 또는 verification flag |
| **SUSPENDED_PLANNER** | 검증 정지 | `PlannerVerification.status = suspended` ([PR-88](../app/admin/planner-verifications/)) |
| **BANNED** | 계정 조치 | `User.status = disabled` — **super_admin**, 별도 정책 |

### 12.1 정지 연결

- 개인정보·의료정보 **반복** 게시
- 보험금 판단 답변 **반복**
- 상품 강권·외부 유도·광고 **반복**
- 운영자 경고 **불이행**

PR-91: 제재 action은 **관리자 수동**; 자동 제재 없음.

---

## 13. Admin operations (관리자 운영)

### 13.1 허용

- 블라인드·삭제·신고 처리·공지·카테고리 변경·상태 변경
- `PlannerVerification` **suspended** 연결 **검토** (PR-88 화면)
- `moderator` 역할 확장 (후속)

### 13.2 금지

- 게시글 PII를 다른 시스템·로그에 **복사**
- 진단서·청구자료 **저장**
- 보험금·의료 **답변**
- 상품 **권유**
- AI **자동 답변** 생성

### 13.3 adminMemo

- **admin-only**; public API·fetch **미포함**
- 민감정보 원문 **복사 금지**

---

## 14. PR-90 CommunityPost DB model criteria

### 14.1 모델 후보

```txt
CommunityPost
CommunityReport   // 신고 — post FK, reporterId, reason, status (optional separate model)
```

댓글 `CommunityComment`: PR-90 **포함 여부 검토** — MVP는 **게시글 only** 권장.

### 14.2 `CommunityPost` 필수 후보

| 필드 | 비고 |
|------|------|
| `id` | cuid |
| `authorId` | → `User`; `PlannerVerification` join은 app layer |
| `category` | §4 enum |
| `title` | plain text, 길이 제한 |
| `content` | plain text @db.Text; **no HTML upload** |
| `status` | `draft` \| `published` \| `blinded` \| `archived` \| `deleted` — PR-90 확정 |
| `visibility` | `public` \| `members_only` — MVP `public` only |
| `isPinned` | 공지용 |
| `isBlind` | 블라인드 플래그 |
| `blindReason` | admin-only 또는 internal code |
| `containsSensitiveData` | server scan flag |
| `deletedAt` | soft delete |
| `createdAt` / `updatedAt` | audit |
| `reviewedById` / `reviewedAt` | 블라인드·삭제 처리자 |
| `adminMemo` | admin-only |

선택: `deletionReason`, `retentionUntil`, `lastReportedAt`

### 14.3 Enum 후보 (snake_case)

- `CommunityPostCategory` — §4
- `CommunityPostStatus` — §14.2
- `CommunityPostVisibility` — `public`, `members_only`
- `CommunityReportReason` — §9.1
- `CommunityReportStatus` — `new`, `triaged`, `resolved`, `dismissed`, `archived`

### 14.4 금지 필드

§6 전 항목 및: `customerName`, `customerPhone`, `contractNumber`, `diagnosis`, `hospitalName`, `claimAmount`, `fileUrl`, `attachmentUrl`, `ocrText`, `aiAnswer`, `payoutDecision`, `autoBlind`, `autoModerationScore`

### 14.5 Relation·migration

- `authorId` → `User` `onDelete`: Restrict 또는 SetNull — cascade hard delete 검토
- **파일 relation 없음**
- **additive migration only**

---

## 15. PR-91 Community MVP implementation criteria

### 15.1 허용

- `/community` (경로 PR-91 확정) 목록·상세
- **VERIFIED_PLANNER** (§2.2) 글쓰기
- 카테고리 필터·검색 (제목·본문; PII 검색 도구 아님)
- 신고 버튼 → DB 또는 CorrectionRequest-style 큐 (PR-90 모델)
- ADMIN 블라인드·삭제 (`/admin/community` 후보)
- 본인 수정·삭제 **제한** (신고 후 lock)

### 15.2 금지

- 파일·이미지 업로드, OCR, AI 자동 답변·요약
- 보험금 판단 **카테고리**
- PII·의료·계약 **입력 필드**
- 외부 상담 CTA
- public **자동** 블라인드
- 이메일·카카오 **자동 알림**

### 15.3 권한 (server-side)

| Action | Guard |
|--------|-------|
| Read public list | non-blind published |
| Create post | §2.2 |
| Comment | §2.2 (if implemented) |
| Report | authenticated |
| Blind / delete | `requireAdminAccess` |
| Notice pin | ADMIN |

### 15.4 Revalidation

- `/community`, `/community/[id]`, `/admin/community*` only
- **public search·directory·knowledge revalidate 금지** (CorrectionRequest PR-88 패턴)

---

## 16. Security and compliance

### 16.1 금지

개인·의료·계약·청구자료 게시, 파일·OCR, 보험금·손해사정 판단, 상품 강권, 공포 조장, 외부 상담 유도, 자동 답변·블라인드·제재, BOA CRM·Aiven 연결

### 16.2 허용

검증 설계사 실무 공유, 공개 정보 기준 안내, 공시·약관 확인 경로, 지식 보완 의견, **관리자 수동** 신고·블라인드

---

## 17. Completion criteria (PR-89)

1. Community 목적 문서화 (§1)
2. 권한별 읽기/쓰기/답변 (§2–3)
3. VERIFIED_PLANNER + `approved` 글쓰기 기준 (§2.2)
4. 카테고리 (§4)
5. 허용·금지 콘텐츠 (§5–6)
6. PII·의료·계약 차단 (§6–7)
7. 보험금·손해사정 금지 (§6, §8)
8. 광고·공포·강권 금지 (§6)
9. 신고·블라인드·삭제 (§9–11)
10. 사용자 제재 (§12)
11. 관리자 운영 (§13)
12. PR-90·91 기준 (§14–15)
13. **schema/migration/코드 구현 없음**
14. 기존 기능 회 regress 없음

---

## 18. Related documents

| 문서 | 관계 |
|------|------|
| [PR-86-PLANNER-VERIFICATION-POLICY.md](./PR-86-PLANNER-VERIFICATION-POLICY.md) | 검증·커뮤니티 §11 |
| [PR-87-PLANNER-VERIFICATION-SCHEMA.md](./PR-87-PLANNER-VERIFICATION-SCHEMA.md) | author·verification join |
| [PR-78-CORRECTIONREQUEST-POLICY.md](./PR-78-CORRECTIONREQUEST-POLICY.md) | 신고 큐·민감정보 |
| [KNOWLEDGE_CONTENT_POLICY.md](./KNOWLEDGE_CONTENT_POLICY.md) | 안전 경계·금지 표현 |
| [CORRECTION_REQUEST_POLICY.md](./CORRECTION_REQUEST_POLICY.md) | 제보 금지 항목 |
| [RBAC_FOUNDATION_PLAN.md](./RBAC_FOUNDATION_PLAN.md) | `moderator`·`verified_planner` |

---

## 19. Explicit non-implementation (PR-89)

- `prisma/schema.prisma` 변경
- `CommunityPost` / Comment / Reaction 모델
- `/community` UI·server action
- 파일 storage·OCR·AI·알림
