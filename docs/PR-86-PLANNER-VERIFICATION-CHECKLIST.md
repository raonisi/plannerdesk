# PR-86: Planner Verification 체크리스트

PR-86 정책 문서([PR-86-PLANNER-VERIFICATION-POLICY.md](./PR-86-PLANNER-VERIFICATION-POLICY.md)) 기반. 후속 PR 착수 전·QA 시 점검용.

---

## PR-87 전 체크리스트 (DB 모델·migration)

스키마 PR 착수 전:

- [ ] 개인정보 **직접 저장** 필드가 없는가 (주민번호, 신분증 번호, 개인 휴대폰, 상세 주소, 생년월일 전체, 계좌 등)
- [ ] **신분증·자격증·명함** 파일 필드·attachment relation·storage key가 없는가
- [ ] **고객정보·계약정보** 필드가 없는가 (`customerId`, `contractId`, `policyNumber` 등)
- [ ] **의료정보** 구조화 저장 필드가 없는가
- [ ] **자동 검증·자동 승인·AI/OCR/외부 조회 결과** 필드가 없는가
- [ ] `userId` → `User` relation FK `onDelete` 정책이 안전한가 (cascade hard delete 없음)
- [ ] `status` enum이 §6 흐름과 일치하고 **snake_case**인가
- [ ] `retentionUntil` / `deletedAt` / `suspendedAt` / `reviewedAt`으로 보관·삭제 정책 반영 가능한가
- [ ] `containsSensitiveData` (또는 동등) 플래그가 있는가
- [ ] `adminMemo`·`rejectionReason`이 **admin-only**로 문서화되었는가
- [ ] `licenseNumber` **전체 저장** 필드가 없거나 별도 고위험 PR로 분리되었는가
- [ ] 활성 신청 **1건** 제약(unique) 검토되었는가
- [ ] migration이 **destructive**하지 않은가 (additive only)
- [ ] 콘텐츠 `VerificationStatus`와 설계사 검증 상태 **혼동** 없이 `PlannerVerification.status`로 분리되었는가

---

## PR-88 전 체크리스트 (관리자 검증 화면)

관리자 화면 PR 착수 전:

- [ ] **관리자 권한** (`requireAdminAccess`)이 layout·server action에 있는가
- [ ] **`User.role` 변경**은 `requireSuperAdminAccess` (`canManageUsers`)인가
- [ ] 승인 / 보류(`under_review`) / 거절 / 정지 **단건 처리** 기준이 있는가
- [ ] `reviewedById`·`reviewedAt` **처리자·처리일** 기록이 있는가
- [ ] 사용자 **노출 사유**와 `adminMemo`·내부 `rejectionReason`이 **분리**되는가
- [ ] `containsSensitiveData` **경고·원문 노출 최소화**가 있는가
- [ ] **파일 업로드** UI·엔드포인트가 없는가
- [ ] **자동 승인·외부 기관 자동 조회**가 없는가
- [ ] 승인 시 `User.role` → `verified_planner` **동기화 정책**이 명확한가
- [ ] 정지 시 `User.status`·role 강등 규칙이 정책 §9·§2.3과 일치하는가
- [ ] public API·fetch에 `adminMemo`가 **포함되지** 않는가
- [ ] PR-81 CorrectionRequest 인박스와 **동등한** 보안 UX 수준인가

---

## PR-89 전 체크리스트 (커뮤니티 정책 연결)

커뮤니티 PR 착수 전:

- [ ] `VERIFIED_PLANNER` (`verified_planner` + `approved`) **권한 기준**이 있는가
- [ ] 커뮤니티 **글쓰기**는 검증 설계사 이상으로 제한되는가
- [ ] Q&A **답변** 권한 기준이 있는가 (PR-89에서 확정)
- [ ] `anonymous_public` **읽기-only** 여부가 정책에 반영되는가
- [ ] **광고성·홍보성** 게시 제한 기준이 있는가
- [ ] **개인정보·의료정보·청구자료** 요구 금지 기준이 있는가
- [ ] **보험금 판단성** 답변 금지 기준이 있는가
- [ ] `CommunityPost.authorId` ↔ `PlannerVerification.userId` 연결 설계가 가능한가
- [ ] 정지(`suspended`) 사용자 **기존 게시글** 처리 기준이 있는가
- [ ] `moderator` 역할과 Verification **승인 권한**이 혼동되지 않는가

---

## PR-86-QA (정책 PR 자체)

- [ ] `docs/PR-86-PLANNER-VERIFICATION-POLICY.md` 존재
- [ ] `docs/PR-86-PLANNER-VERIFICATION-CHECKLIST.md` 존재
- [ ] `prisma/schema.prisma` **변경 없음**
- [ ] `prisma/migrations/**` **추가 없음**
- [ ] server action / route / admin page **추가 없음**
- [ ] 기존 RBAC (`lib/auth/rbac.ts`) **변경 없음**
- [ ] `npm run typecheck` / `lint` / `build` 통과
- [ ] Antigravity·운영팀 리뷰 완료 (확정 필요)

---

## 금지 기능 최종 확인 (모든 후속 PR)

| 항목 | PR-87 | PR-88 | PR-89 |
|------|-------|-------|-------|
| 파일·이미지 업로드 | 필드 없음 | UI 없음 | 첨부 없음 |
| OCR | 없음 | 없음 | 없음 |
| 외부 기관 API | 없음 | 없음 | 없음 |
| 의료·고객·계약 저장 | 없음 | 마스킹·삭제 | 게시 차단 |
| 보험금·손해사정 판단 | 없음 | — | 답변·게시 금지 |
| AI 자동 검증 | 없음 | 없음 | 없음 |
| 자동 승인·거절 | 없음 | 없음 | — |
| 법적 자격 보증 UI | — | — | 문구 금지 |
| destructive migration | 없음 | — | — |

---

## 기존 코드 참조 (PR-87·88 구현 시)

| 관심사 | 경로 |
|--------|------|
| Role enum·User | `prisma/schema.prisma` |
| RBAC helpers | `lib/auth/rbac.ts` |
| Admin access | `lib/auth/access.ts`, `app/admin/layout.tsx` |
| CorrectionRequest 큐 패턴 | `prisma/schema.prisma` (`CorrectionRequest`), PR-81 인박스 |
| CorrectionRequest 정책 | `docs/PR-78-CORRECTIONREQUEST-POLICY.md` |
| Admin list filter 패턴 | `app/admin/disclosure-links/page.tsx` |
| Admin Search (PR-85) | `docs/PR-82-GLOBAL-SEARCH-IA.md` §14 |
