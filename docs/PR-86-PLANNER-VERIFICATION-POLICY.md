# PR-86: Planner Verification 운영 정책

**정책 설계 전용 PR.** Prisma schema, migration, public 신청 form, 관리자 승인 화면, 커뮤니티 게시판, 파일 업로드, OCR, 외부 기관 자동 조회, AI 자동 검증은 이 PR에 포함하지 않는다.

## 0. 개발 맥락·기존 구조

PR-78~81 CorrectionRequest 운영 큐, PR-82~83 Public Global Search, PR-84 지식 아카이브 필터, PR-85 Admin Search, Auth/RBAC 기본 구조가 선행되어 있다.

| 기존 자산 | 경로·내용 |
|-----------|-----------|
| `User.role` | `super_admin` \| `content_admin` \| `moderator` \| `verified_planner` \| `anonymous_public` ([prisma/schema.prisma](../prisma/schema.prisma)) |
| `User.status` | `active` \| `invited` \| `suspended` \| `disabled` |
| `User.verificationStatus` | 콘텐츠 검수 enum과 이름이 겹침 — **설계사 검증 주 상태는 PR-87 `PlannerVerification` 모델로 분리** |
| Admin guard | `lib/auth/access.ts`, `lib/auth/rbac.ts` — `/admin`은 `super_admin`·`content_admin`만 |
| Role 변경 | `canManageUsers` → **`super_admin` 전용** |
| CorrectionRequest 정책 | [PR-78-CORRECTIONREQUEST-POLICY.md](./PR-78-CORRECTIONREQUEST-POLICY.md) — 보관·민감정보·adminMemo 분리 패턴 참조 |
| CommunityPost | [ADMIN_CRUD_OPERATIONS.md](./ADMIN_CRUD_OPERATIONS.md) §Out of scope — PR-89에서 정책·모델 확정 |

| 후속 PR | 범위 |
|---------|------|
| PR-87 | `PlannerVerification` DB 모델·migration (본 문서 §12 기준) |
| PR-88 | 관리자 검증 화면·상태 처리 (본 문서 §13 기준) |
| PR-89 | 커뮤니티 MVP·`CommunityPost`·글쓰기 권한 (본 문서 §11 기준) |

---

## 1. Purpose (목적)

### 1.1 Planner Verification의 목적

Planner Verification은 PlannerDesk **내부 운영 권한**을 부여하기 위한 관리자 승인 기반 설계사 신원 확인 절차이다.

| 목적 | 설명 |
|------|------|
| 커뮤니티·Q&A 글쓰기 제한 | 검증된 설계사만 게시·답변 가능 (세부는 PR-89) |
| 실무 노하우 공유자 신뢰 표시 | 프로필·배지 수준의 **플랫폼 내부** 신뢰 표시 |
| 권한 분리 | 일반 방문자·미검증 사용자와 설계사 사용자 분리 |
| 관리자 승인 기반 권한 | 자동 승인 없이 운영자 수동 검토 |
| 악용 방지 | 익명·광고성·민감정보 유입 게시 억제 |

### 1.2 목적이 아닌 것

아래는 Planner Verification으로 **보증하거나 대체하지 않는다.**

- 보험설계사 **법적** 자격 보증
- 보험협회·금융감독원 등 **외부 기관 공식 자격조회** 대체
- 고객 상담 **적격성** 보증
- 보험상품 **판매 권한** 인증
- 보험금 **지급 판단** 권한 부여
- **손해사정성** 판단 권한 부여
- **의료정보** 판단·해석 권한 부여
- 자동 심사·자동 승인·자동 거절

PlannerDesk는 **손해사정 업무를 수행하지 않으며**, **의료 진단을 해석하지 않으며**, **보험금 지급 여부를 판단하지 않는다.**

`APPROVED` 상태는 PlannerDesk **내부 RBAC 기준**일 뿐, 외부 기관의 공식 자격 보증이 아니다.

---

## 2. User permission tiers (사용자 권한 구분)

정책 문서의 개념적 단계와 **기존 PlannerDesk RBAC** 매핑:

| 정책 단계 | PlannerDesk 구현 (권장) | 커뮤니티 글쓰기 | `/admin` |
|-----------|-------------------------|-----------------|----------|
| **GENERAL_USER** | `User.role = anonymous_public` (로그인 여부와 무관 기본) | PR-89에서 읽기-only 여부 확정 | 차단 |
| **PENDING_PLANNER** | `anonymous_public` + `PlannerVerification.status ∈ { pending, under_review }` | **제한** (승인 전) | 차단 |
| **VERIFIED_PLANNER** | `User.role = verified_planner` + `PlannerVerification.status = approved` | PR-89: 전용 게시판·Q&A 후보 | 차단 |
| **SUSPENDED_PLANNER** | `PlannerVerification.status = suspended` 및/또는 `User.status = suspended`; role은 `verified_planner` 유지 또는 `anonymous_public`로 강등 — **PR-87·88에서 단일 규칙 확정** | **제한** | 차단 |
| **ADMIN** | `super_admin` \| `content_admin` | 공지·블라인드·삭제는 ADMIN (PR-89) | 허용 |

### 2.1 기존 Role enum (변경 없음 — PR-86)

```prisma
enum Role {
  super_admin
  content_admin
  moderator      // PR-89 커뮤니티 모더레이션 예약
  verified_planner
  anonymous_public
}
```

### 2.2 `moderator` 역할

`moderator`는 **커뮤니티 모더레이션 전용** 예약 역할이다 ([RBAC_FOUNDATION_PLAN.md](./RBAC_FOUNDATION_PLAN.md)). Planner Verification 승인·거절 권한과 혼동하지 않는다. PR-89에서 커뮤니티 게시글 중재와 연결한다.

### 2.3 User.role 변경 정책 (PR-87·88에서 구현)

| 이벤트 | `User.role` | `User.status` | `PlannerVerification.status` |
|--------|-------------|---------------|------------------------------|
| 신청 접수 | `anonymous_public` 유지 | `active` | `pending` |
| 검토 시작 | 변경 없음 | `active` | `under_review` |
| 승인 | → `verified_planner` | `active` | `approved` |
| 거절 | `anonymous_public` 유지 | `active` | `rejected` |
| 정지 | `verified_planner` 유지 또는 `anonymous_public` 강등 — PR-88에서 확정 | `suspended` 검토 | `suspended` |
| 만료·재확인 | PR-88에서 role 처리 규칙 확정 | `active` | `expired` |
| 삭제 처리 | PR-88에서 role 처리 규칙 확정 | — | `deleted` |

**`User.role` 변경은 `super_admin`만** (`canManageUsers`). 검증 큐 조회·상태 기록은 `super_admin`·`content_admin` 범위로 PR-88에서 확정한다.

### 2.4 `User.verificationStatus`와의 관계

`User.verificationStatus`(`unverified` \| `pending` \| `verified` \| `draft` \| `needs_review`)는 Auth 스키마에 존재하나, **Insurer·ClaimDocument 등 콘텐츠 검수 enum과 이름이 겹친다.** 설계사 검증의 **주 기록·상태 흐름은 `PlannerVerification` 모델**에 둔다. PR-87에서 `User.verificationStatus` 동기화 여부를 검토하되, 콘텐츠 `VerificationStatus`와 혼동되지 않도록 문서·코드 주석을 명확히 한다.

---

## 3. Minimal collection principle (최소 수집 원칙)

설계사 검증은 **운영에 필요한 최소 정보만** 수집한다.

### 3.1 수집 가능 후보

| 필드 개념 | 설명 |
|-----------|------|
| 신청자 사용자 ID | `User.id` FK |
| 표시 이름·닉네임 | 커뮤니티 표시용; `User.name`과 별도 `displayName` 검토 |
| 소속 구분 | 생명/손해/GA/법인대리점 등 **구분** (자격 증명 아님) |
| 활동 지역 | 시·도 수준 권장 |
| 보험업 관련 경력 구간 | 예: `1-3년`, `3-5년`, `5년+` (정확 연도·생년 불필요) |
| 검증 상태 | §6 enum |
| 검증 신청일 | `requestedAt` |
| 검증 처리일 | `reviewedAt` |
| 처리 관리자 | `reviewedById` |
| 관리자 메모 | admin-only |

### 3.2 신중 검토 후보 (PR-87에서 최종 결정)

| 필드 | 검토 기준 |
|------|-----------|
| 소속 회사명·보험대리점명 | 과장·허위·개인 식별 결합 위험 |
| 생명/손해 구분 | `plannerType` enum 후보 |
| 등록번호·모집종사자번호 | **전체 저장 지양**; 필요 시 마스킹·미저장·관리자 확인 후 폐기 우선 |
| 업무용 연락처 | 개인 휴대폰과 구분; **수집 지양** 또는 선택·마스킹 |

### 3.3 원칙

- 주민등록번호 수집 **금지**
- 신분증·자격증 **이미지 업로드 금지**
- 고객정보·계약정보 수집 **금지**
- 민감정보 수집 **금지**
- 확인에 **꼭 필요한 정보만** 저장
- CorrectionRequest와 동일하게 **서버 단 validation** 필수 (PR-87 이후 public form PR)

---

## 4. Absolutely prohibited data (절대 수집 금지)

아래 정보는 **저장·업로드·OCR·로그 기록**하지 않는다.

### 4.1 개인식별·민감정보

주민등록번호, 신분증 번호, 운전면허번호, 여권번호, 계좌번호, **개인 상세 주소**, **개인 휴대폰번호**, **생년월일 전체**, 가족정보

### 4.2 고객·계약정보

고객명, 고객 연락처, 계약번호, 증권번호, 보험료, 보험금 청구 내용, 고객 병력, 고객 진단명, 고객 청구서류

### 4.3 파일

신분증·자격증·위촉증명서·사업자등록증·명함·보험증권·청구서류·의료자료 **이미지·PDF·첨부 URL**

### 4.4 판단·자동화 결과

보험금 지급 가능성, 상품 적합성 자동 판단, 자격 진위 자동 보증, 손해사정성 판단, 의료정보 해석, OCR 텍스트, AI 검증 결과, 자동 승인/거절 결과

---

## 5. Application field criteria (검증 신청 정보 기준)

PR-87 모델 설계 전 **후보 필드**. enum은 프로젝트 **snake_case** 규칙을 따른다.

### 5.1 필수 후보

| 필드 | 타입·비고 |
|------|-----------|
| `userId` | `User` FK, onDelete 정책 PR-87에서 확정 |
| `status` | §6 enum |
| `displayName` | plain text, 길이 제한 |
| `plannerType` | enum 후보: `life`, `non_life`, `both`, `ga`, `other` — PR-87에서 확정 |
| `affiliationName` | plain text; 과장·허위 검토 |
| `activityRegion` | plain text; 시·도 수준 권장 |
| `careerRange` | enum 또는 plain text; 정확 연도 불필요 |
| `requestedAt` | DateTime |
| `reviewedAt` | DateTime? |
| `reviewedById` | String? (User FK, admin) |
| `adminMemo` | Text, **admin-only** |
| `rejectionReason` | Text?; 사용자 노출용과 분리 (§8) |
| `suspendedAt` | DateTime? |
| `deletedAt` | DateTime? soft delete |

### 5.2 선택 후보

| 필드 | 비고 |
|------|------|
| `licenseScope` | 생명/손해/변액 등 **구분**만; 번호 저장 아님 |
| `businessChannel` | GA·법인·개인대리점 등 |
| `verificationNote` | 신청자 자유 서술; **민감정보 패턴 서버 차단** |
| `retentionUntil` | 보관 만료 (§10) |
| `containsSensitiveData` | CorrectionRequest 패턴; 자동·수동 검출 |
| `userFacingRejectionSummary` | 사용자에게 노출할 **최소** 사유 (내부 `rejectionReason`·`adminMemo`와 분리) |

### 5.3 `licenseNumber` 주의

- **전체 번호 저장보다** 일부 마스킹·미저장·관리자 확인 후 즉시 폐기를 우선 검토한다.
- PR-87 기본 방향: **`licenseNumber` 필드 없음**; 운영상 불가피할 때만 별도 고위험 PR.

### 5.4 금지 필드

파일 URL, attachment relation, OCR 필드, `customerId`, `contractId`, `policyNumber`, 의료·판단 구조화 필드, `autoApproved`, `externalLookupResult`

---

## 6. Verification states (검증 상태)

### 6.1 상태 enum 후보 (PR-87, snake_case)

| Status | 의미 |
|--------|------|
| `pending` | 신청 접수 |
| `under_review` | 관리자 검토 중 |
| `approved` | 검증 승인 — **내부 권한 부여만** |
| `rejected` | 승인 거절 |
| `suspended` | 검증 정지 |
| `expired` | 재확인 필요 또는 만료 |
| `deleted` | 삭제 처리 (soft delete) |

TypeScript 정책 문서 표기: `PENDING`, `UNDER_REVIEW` 등 — PR-87 enum은 `pending`, `under_review`.

### 6.2 상태 전이 (권장)

```text
pending → under_review → approved
                      → rejected
approved → suspended
approved → expired → under_review (재확인)
any (non-deleted) → deleted
rejected → pending (재신청 정책 — PR-88에서 쿨다운·횟수 제한 확정)
```

- **자동 전이 없음** — 모든 `approved`·`rejected`·`suspended`는 관리자 수동 처리
- `pending` → `approved` 직접 전이는 PR-88 UI에서 허용 가능 (중간 `under_review` 생략)

### 6.3 동시 신청

사용자당 **활성 신청 1건** 원칙 (`pending` \| `under_review`). PR-87 unique 제약 검토.

---

## 7. Approval criteria (검증 승인 기준)

관리자가 `approved`로 전환하기 전 확인:

| 기준 | 설명 |
|------|------|
| 신청 정보 적합 | 운영 기준·필수 필드 충족 |
| 표시 이름 | 부적절·기만·타인 사칭 없음 |
| 소속 정보 | 과장·허위·홍보성 과다 없음 |
| 활동 목적 | 커뮤니티·실무 공유 목적 |
| 민감정보 미포함 | 개인정보·고객정보·의료정보 없음 |
| 스팸·광고 아님 | 가입·결제·연락처 유도 중심 아님 |

### 7.1 승인 시 부여 가능 (PlannerDesk 내부)

- `User.role` → `verified_planner`
- 커뮤니티 **전용 게시판** 글쓰기 (PR-89)
- Q&A **답변** 권한 후보 (PR-89)
- 실무 노하우 공유 권한 후보

### 7.2 승인해도 부여되지 않는 것

- 보험상품 판매 권한 보증
- 고객 상담 적격성 보증
- 보험금·손해사정·의료 판단 권한
- `/admin` 접근
- 외부 기관 자격 공식 인증

---

## 8. Hold and rejection criteria (보류·거절 기준)

PR-88 UI에서 **보류**는 `under_review` 유지 + `adminMemo` 또는 신청자 재작성 요청으로 운영한다. 별도 `on_hold` enum은 PR-87에서 필요 시 추가 검토.

### 8.1 보류(추가 확인) 기준

- 정보 불충분
- 표시명·소속 확인 필요
- 신청 목적 불명확
- 과도한 홍보성 표현
- 개인정보·민감정보 포함 → 삭제·재작성 요청

### 8.2 거절 기준

- 허위·과장 정보
- 스팸·홍보 목적
- 민감정보 반복 제출
- 고객정보 제출
- 보험금 판단성 활동 목적
- 커뮤니티 운영 기준 위반 가능성
- 관리자 판단상 신뢰도 부족

### 8.3 거절 시 기록·노출

| 구분 | 규칙 |
|------|------|
| `adminMemo` | 관리자 전용; public·API·로그 미노출 |
| `rejectionReason` | 내부 상세 사유 |
| 사용자 노출 | `userFacingRejectionSummary` 등 **최소·일반화** 문구만; 민감정보 재노출 금지 |

---

## 9. Suspension criteria (검증 정지 기준)

`approved` 이후 커뮤니티·운영 위반 시 `suspended`:

| 정지 사유 |
|-----------|
| 커뮤니티 운영 기준 위반 |
| 광고성 게시 반복 |
| 고객 개인정보 유도 |
| 의료정보·청구자료 유도 |
| 보험금 지급 판단성 답변 |
| 특정 상품 강권 |
| 공포 조장 영업성 게시 |
| 허위 경력·허위 소속 의심 |

### 9.1 정지 처리

- `PlannerVerification.status` → `suspended`
- `suspendedAt` 기록
- `adminMemo` 기록
- 글쓰기 권한 제한 (PR-89 RBAC)
- `User.status = suspended` 및 role 강등 여부 — PR-88에서 단일 규칙 확정
- **기존 게시글** 처리(블라인드·유지·아카이브) — PR-89

---

## 10. Retention and deletion (보관·삭제 기준)

CorrectionRequest([PR-78 §6](./PR-78-CORRECTIONREQUEST-POLICY.md#6-retention-and-deletion-보관삭제-기준))와 동일한 최소 보관 원칙.

### 10.1 기본 원칙

- 불필요한 자격정보 **장기 보관 금지**
- 거절·삭제 요청 시 **최소 보관**
- 민감정보 포함 신청 → **삭제·마스킹 우선**
- `expired` → 재확인 또는 삭제 정책 검토

### 10.2 보관 기간 (운영 정책 확정 필요)

구체 **일수**는 법무·개인정보 검토 후 확정. PR-87 모델은 아래 필드로 표현 가능해야 한다.

| 상태 | 권장 방향 |
|------|-----------|
| `pending`, `under_review` | 처리 완료 후 N일 (확정 필요) |
| `rejected` | 짧은 보관 후 삭제; 차단 메타만 유지 가능 |
| `approved` | 활성 계정 동안 최소 필드만; `expired` 후 M일 (확정 필요) |
| `suspended` | 분쟁·감사용 K일 (확정 필요) |
| 민감정보 포함 | `deletedAt` 즉시 또는 `containsSensitiveData` 경고 후 삭제 |

### 10.3 권장 필드

`retentionUntil`, `deletedAt`, `suspendedAt`, `reviewedAt`

### 10.4 IP·User-Agent

CorrectionRequest와 동일 — 저장 시 **최소화**·`retentionUntil` 연동.

---

## 11. Community integration (커뮤니티 연결 기준)

PR-89 Community 정책과 연결. PR-86에서는 **권한 기준만** 고정한다.

### 11.1 권한 기준 (권장)

| 행위 | 권한 |
|------|------|
| 커뮤니티 읽기 | PR-89: 일반 사용자(`anonymous_public`) 읽기-only 여부 검토 |
| 게시글 작성 | `verified_planner` + `PlannerVerification.status = approved` |
| Q&A 답변 | 동일 (PR-89 확정) |
| 공지·블라인드·삭제 | `super_admin` \| `content_admin`; 게시 중재는 추후 `moderator` |
| 미검증 사용자 홍보성 글 | **제한** |

### 11.2 `CommunityPost` 모델 (PR-89 예약)

[ADMIN_CRUD_OPERATIONS.md](./ADMIN_CRUD_OPERATIONS.md)에 예약된 `CommunityPost`는 PR-89에서 설계한다. PR-87 `PlannerVerification.userId`와 author FK로 연결 가능해야 한다.

### 11.3 검증 설계사도 금지되는 행위

- 고객 개인정보·진단서·청구서류 요구
- 보험금 지급 가능성 판단
- 의료정보 해석
- 특정 상품 강권·공포 조장 상담
- 개인 연락처 유도 중심 게시
- 외부 결제·가입 유도

위반 시 §9 정지·PR-89 게시 중재로 연결.

---

## 12. PR-87 DB model design criteria

### 12.1 모델 후보

```txt
PlannerVerification
```

### 12.2 필수 개념

- `user` relation (`userId`)
- `status` (§6)
- `displayName`, `plannerType`, `affiliationName`, `activityRegion`, `careerRange`
- `requestedAt`, `reviewedAt`, `reviewedById`
- `adminMemo`, `rejectionReason`, `userFacingRejectionSummary` (선택)
- `suspendedAt`, `deletedAt`, `retentionUntil`
- `containsSensitiveData` (권장)
- `createdAt`, `updatedAt`

### 12.3 PR-87에서 금지하는 필드

§4 전 항목 및:

- 주민등록번호·신분증 번호
- 고객·계약·의료 구조화 필드
- 파일 URL·attachment
- OCR·AI 검증·자동 승인 결과
- 외부 기관 API raw response

### 12.4 migration 원칙

- **additive only** — destructive migration 금지
- 기존 `User`·`CorrectionRequest` 테이블에 cascade로 검증 레코드가 끌려 삭제되지 않도록 FK `onDelete` 검토
- `User.role` enum 변경 **불필요** (`verified_planner` 이미 존재)

### 12.5 인덱스 후보

`status`, `userId`, `requestedAt`, `(status, requestedAt)`, `containsSensitiveData`

---

## 13. PR-88 Admin verification screen criteria

### 13.1 접근·라우트

- 경로 후보: `/admin/planner-verifications` (PR-88에서 확정)
- `getAdminAccess()` / `requireAdminAccess()` — 기존 [app/admin/layout.tsx](../app/admin/layout.tsx) 패턴
- **`User.role` 변경 action** — `requireSuperAdminAccess()` (`canManageUsers`)
- Admin Search (PR-85)에 PlannerVerification 포함 여부 — PR-88·85 후속 검토

### 13.2 화면·기능

| 기능 | 기준 |
|------|------|
| 신청 목록 | 상태·날짜·민감정보 플래그 필터 |
| 단건 처리 | 승인 / 보류(under_review) / 거절 / 정지 |
| 감사 | `reviewedById`, `reviewedAt` 필수 기록 |
| 민감정보 | `containsSensitiveData` 경고·원문 노출 최소화 |
| 파일 | **업로드 UI 없음** |
| 자동화 | **자동 승인·외부 조회 없음** |
| 사유 분리 | 사용자 노출 vs `adminMemo` vs `rejectionReason` |
| Role 동기화 | 승인 시 `verified_planner` promotion — super_admin action |

### 13.3 CorrectionRequest 인박스 패턴 참조

PR-81 인박스: 상태 필터, adminMemo 비노출, 민감정보 배지, 수동 처리 — 동일 UX·보안 수준 적용.

---

## 14. Security and compliance (보안·컴플라이언스)

### 14.1 금지

신분증·자격증 업로드, OCR, 주민등록번호·고객·계약·의료정보 수집, 보험금·손해사정 판단, 자동 검증·승인·거절, 외부 기관 API **무단** 연동, BOA CRM·Aiven 연결 ([AGENTS.md](../AGENTS.md))

### 14.2 허용

최소 신청 정보, 관리자 수동 검토, 내부 RBAC 부여, 커뮤니티 접근 제한, 검증 상태·배지 표시 (법적 보증 문구 **금지**)

### 14.3 서버 enforcement

- UI 숨김만으로 권한 처리 **금지** — server action·API에서 RBAC 재검증 ([RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md) §G)
- Public API에 `adminMemo`·`rejectionReason`·내부 검토 메모 **미포함**

---

## 15. Public copy guidelines (향후 신청 form — PR-86 범위 외)

PR-87·88 이후 public form PR에서 사용할 문구 방향:

**필수 안내 (예시)**

- PlannerDesk 검증은 **플랫폼 내부 커뮤니티 권한** 부여용이며, 법적 자격을 보증하지 않습니다.
- 주민등록번호, 신분증, 자격증 사진, 고객·계약·의료 정보를 **제출하지 마세요**.
- 제출 정보는 관리자 검토 후 승인·거절됩니다. **자동 승인되지 않습니다.**

**금지 UI 문구**

- “공식 설계사 인증”, “협회 검증 완료”, “자격 자동 확인”, “보험금 상담 가능 설계사”

---

## 16. Completion criteria (PR-86 완료 기준)

1. Planner Verification 목적 문서화 (§1)
2. 검증 설계사 권한 범위 정의 (§2)
3. 최소 수집 정보 기준 (§3)
4. 수집 금지 정보 (§4)
5. 검증 상태 흐름 (§6)
6. 승인·보류·거절·정지 기준 (§7–9)
7. 보관·삭제 기준 (§10)
8. 커뮤니티 연결 기준 (§11)
9. PR-87 DB 모델 기준 (§12)
10. PR-88 관리자 화면 기준 (§13)
11. 파일·OCR·자동 검증 금지 명확 (§14)
12. 보험금·손해사정 판단 금지 명확 (§1, §4, §14)
13. **실제 기능 구현 없음**
14. **schema/migration 변경 없음**
15. 기존 기능 회귀 없음

---

## 17. Related documents

| 문서 | 관계 |
|------|------|
| [PR-78-CORRECTIONREQUEST-POLICY.md](./PR-78-CORRECTIONREQUEST-POLICY.md) | 큐·보관·민감정보 패턴 |
| [AUTH_RBAC_PRODUCTION.md](./AUTH_RBAC_PRODUCTION.md) | Admin RBAC |
| [RBAC_FOUNDATION_PLAN.md](./RBAC_FOUNDATION_PLAN.md) | Role 정의·`verified_planner` |
| [AUTH_DATABASE_SCHEMA_PLAN.md](./AUTH_DATABASE_SCHEMA_PLAN.md) | User 필드 계획 |
| [SECURITY_MODEL.md](./SECURITY_MODEL.md) | 커뮤니티·PII 전 확장 체크 |
| [PR-82-GLOBAL-SEARCH-IA.md](./PR-82-GLOBAL-SEARCH-IA.md) | Admin search 범위 |

---

## 18. Explicit non-implementation (PR-86)

다음은 **이 PR 및 PR-86-QA에서 구현하지 않는다.**

- `prisma/schema.prisma` 변경
- `prisma/migrations/**` 추가
- public 신청 form·route·server action
- `/admin/planner-verifications` UI
- 커뮤니티·`CommunityPost`
- 파일 storage·upload API
- OCR·외부 API·AI 검증
- `User.role` 자동 변경 로직
