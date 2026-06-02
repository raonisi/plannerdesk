# PR-89: Community 체크리스트

PR-89 정책 문서([PR-89-COMMUNITY-POLICY.md](./PR-89-COMMUNITY-POLICY.md)) 기반. 후속 PR 착수 전·QA 시 점검용.

---

## PR-90 전 체크리스트 (CommunityPost DB 모델)

스키마 PR 착수 전:

- [ ] `CommunityPost`에 **고객정보** 저장 필드가 없는가 (`customerName`, `customerPhone` 등)
- [ ] **계약정보** 필드가 없는가 (`contractNumber`, `policyNumber` 등)
- [ ] **의료정보** 구조화 필드가 없는가 (`diagnosis`, `hospitalName` 등)
- [ ] **파일·attachment** 필드·relation·storage key가 없는가
- [ ] **OCR**·`ocrText` 필드가 없는가
- [ ] **보험금·손해사정 판단** 필드가 없는가 (`payoutDecision`, `claimAmount` 등)
- [ ] **AI 자동 답변**·`aiAnswer`·`autoModerationScore` 필드가 없는가
- [ ] `isBlind`·`blindReason`·`deletedAt`·`status`로 블라인드·삭제 표현 가능한가
- [ ] `CommunityReport`(또는 동등)로 **신고 사유**·상태를 저장할 수 있는가
- [ ] `adminMemo`·`blindReason`이 **public fetch에 포함되지** 않도록 문서화되었는가
- [ ] `authorId` → `User` FK `onDelete` 정책이 안전한가
- [ ] enum이 **snake_case**인가
- [ ] migration이 **destructive**하지 않은가 (additive only)
- [ ] 댓글 모델 포함 여부가 MVP 범위와 일치하는가 (게시글 only 권장)

---

## PR-91 전 체크리스트 (Community MVP UI)

MVP 구현 PR 착수 전:

- [ ] 글쓰기가 **§2.2** 조건(`verified_planner` + `approved` + active + non-suspended)으로 **server**에서 제한되는가
- [ ] `PENDING_PLANNER`·`GENERAL_USER` 글쓰기가 **차단**되는가
- [ ] `SUSPENDED_PLANNER`·`User.status = suspended` 글쓰기가 **차단**되는가
- [ ] 작성 화면에 **§7 필수 안내** 문구가 있는가
- [ ] **금지 UI 문구**(§7)가 사용되지 않았는가
- [ ] **보험금 판단**·의료·계약 **서버 validation**이 있는가 (client-only 아님)
- [ ] **파일·이미지 업로드** UI·API가 없는가
- [ ] **신고** 기능(로그인 사용자)이 있는가
- [ ] ADMIN **블라인드·삭제**가 `requireAdminAccess`로 보호되는가
- [ ] public fetch가 `published` + `!isBlind` + `deletedAt null`만 노출하는가
- [ ] **자동 블라인드·자동 답변**이 없는가
- [ ] 상태 변경 후 revalidate가 **community·admin community**만 대상인가
- [ ] public search·directory·knowledge **revalidate 금지**인가

---

## PR-89-QA (정책 PR 자체)

- [ ] `docs/PR-89-COMMUNITY-POLICY.md` 존재
- [ ] `docs/PR-89-COMMUNITY-CHECKLIST.md` 존재
- [ ] `prisma/schema.prisma` **변경 없음**
- [ ] `prisma/migrations/**` **추가 없음**
- [ ] `/community` route·server action **추가 없음**
- [ ] PR-86·87·88 정책과 **VERIFIED_PLANNER** 정의 일치
- [ ] `npm run typecheck` / `lint` / `build` 통과
- [ ] Antigravity·운영팀 리뷰 완료 (확정 필요)

---

## 금지 기능 최종 확인 (모든 후속 PR)

| 항목 | PR-90 | PR-91 |
|------|-------|-------|
| 파일·이미지 업로드 | 필드 없음 | UI·API 없음 |
| OCR | 없음 | 없음 |
| 고객·계약·의료 저장 | 없음 | 입력·게시 차단 |
| 보험금·손해사정 판단 | 없음 | 게시·답변 금지 |
| AI 자동 답변 | 없음 | 없음 |
| 자동 블라인드 | 없음 | 없음 |
| 자동 제재 | 없음 | 없음 |
| 외부 알림 | 없음 | 없음 |
| 법적 자격 보증 UI | — | 문구 금지 |

---

## 검증 설계사 권한 연결 (PR-91)

- [ ] `PlannerVerification.status = approved` 확인
- [ ] `PlannerVerification.status ≠ suspended` 확인
- [ ] `PlannerVerification.deletedAt` is null
- [ ] `User.role = verified_planner` 확인 (PR-88 role sync 후에도 유지)
- [ ] `User.status = active` 확인
- [ ] PR-88 **suspended** 처리와 커뮤니티 글쓰기 차단 연동

---

## 기존 코드·문서 참조 (PR-90·91 구현 시)

| 관심사 | 경로 |
|--------|------|
| Verification 정책 | `docs/PR-86-PLANNER-VERIFICATION-POLICY.md` |
| Verification schema | `docs/PR-87-PLANNER-VERIFICATION-SCHEMA.md` |
| Verification admin | `app/admin/planner-verifications/` |
| RBAC | `lib/auth/rbac.ts`, `lib/auth/access.ts` |
| CorrectionRequest 큐 패턴 | `docs/PR-78-CORRECTIONREQUEST-POLICY.md`, `app/admin/corrections/` |
| 지식·문구 안전 경계 | `docs/KNOWLEDGE_CONTENT_POLICY.md` |
| MessageTemplate 금지 표현 | `docs/CORRECTION_REQUEST_POLICY.md` §3 |
