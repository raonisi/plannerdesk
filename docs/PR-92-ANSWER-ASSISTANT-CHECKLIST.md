# PR-92: Answer Assistant Safety 체크리스트

PR-92 정책 문서([PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md](./PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md)) 기반. 후속 PR 착수 전·QA 시 점검용.

---

## PR-93 전 체크리스트 (Retrieval 후보 설계)

Retrieval 설계 PR 착수 전:

- [ ] Retrieval 대상 도메인이 **§4 허용 목록**으로 제한되어 있는가
- [ ] **미검수** 데이터(draft, archived, rejected, unpublished)가 제외되는가
- [ ] `CorrectionRequest`가 retrieval 대상에서 **완전 제외**되는가
- [ ] `CommunityReport`·`adminMemo`가 제외되는가
- [ ] `MessageTemplate`은 **`safeCopy`만** 사용되는가 (`body`·`forbiddenClaims`·`complianceNote` 제외)
- [ ] `KnowledgeArticle`에 **`aiUsable = true`** (및 `verified` 권장) 조건이 있는가
- [ ] `DisclosureLink`에 `published` + `reviewedAt` 조건이 있는가
- [ ] `CommunityPost`가 **기본 제외**로 문서화되었는가
- [ ] **민감정보·내부 governance 필드**가 select allowlist에서 제외되는가
- [ ] **source priority** (§10.1)가 정의되어 있는가
- [ ] public vs admin retrieval 분리가 있는가 (PR-95까지 public retrieval **없음**)
- [ ] retrieval **0건** 시 답변 생성 금지 정책이 있는가
- [ ] **벡터 검색·embedding·LLM 호출**이 PR-93 범위에 **없는가**
- [ ] answer-assist revalidate가 **public search·directory·knowledge revalidate를 트리거하지 않는가**

---

## PR-94 전 체크리스트 (관리자 내부 초안 MVP)

내부 초안 MVP PR 착수 전:

- [ ] **ADMIN 전용** (`super_admin` \| `content_admin`) 초안 기능인가
- [ ] **public 직접 답변**·챗봇·embed가 **아닌가**
- [ ] **VERIFIED_PLANNER** self-serve가 **아닌가** (PR-95까지)
- [ ] 출력이 **“초안”** + **“관리자 검수 필요”**로 표시되는가
- [ ] **근거 목록**(제목·ID·URL)이 표시되는가
- [ ] **보험금 판단** 질문이 server-side **차단**되는가
- [ ] **의료 해석** 질문이 server-side **차단**되는가
- [ ] **손해사정성 판단** 질문이 server-side **차단**되는가
- [ ] **상품 추천·가입 유도** 질문이 server-side **차단**되는가
- [ ] **개인정보·계약·의료·청구자료** 입력이 server-side **차단**되는가
- [ ] **파일·이미지·OCR** 업로드 UI·API가 **없는가**
- [ ] **자동 게시·자동 발송·커뮤니티 자동 댓글**이 **없는가**
- [ ] 고객 **전송 버튼**이 **없는가**
- [ ] 근거 **0건**일 때 답변 생성이 **차단**되는가
- [ ] **단정적** 금지 표현(§7.3) 필터 또는 policy guard가 있는가
- [ ] LLM provider **API key·env** 추가가 **별도 reviewed PR**인가
- [ ] `requireAdminAccess` / `requireContentManagerAccess`가 route·action에 있는가

---

## PR-95 전 체크리스트 (제한 공개 검토)

제한 공개 PR 착수 전:

- [ ] PR-94 내부 MVP **안정화** 및 운영 피드백 반영
- [ ] 금지 질문 차단 **자동·수동** 테스트 통과
- [ ] **출처 없는 답변**·환각 시나리오 차단 테스트 통과
- [ ] **public/admin** 권한·retrieval 분리 검증
- [ ] **MessageTemplate body** 미사용 검증
- [ ] **CorrectionRequest** 미사용 검증
- [ ] **CommunityPost** 근거 사용 **제한·라벨** 검증 (사용 시)
- [ ] **민감정보 입력** 차단 검증
- [ ] **보험금·의료·손해사정** 출력 차단 검증
- [ ] VERIFIED_PLANNER 접근 시 **§3.2** 조건(approved + active + non-suspended) server 검증
- [ ] **GENERAL_USER public 챗봇**이 로드맵에서 **계속 제외**되는가
- [ ] 제한 공개 **범위·한계 고지** UI 문구 확정
- [ ] Antigravity·운영·법무 **승인** (확정 필요)

---

## PR-92-QA (정책 PR 자체)

- [ ] `docs/PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md` 존재
- [ ] `docs/PR-92-ANSWER-ASSISTANT-CHECKLIST.md` 존재
- [ ] `prisma/schema.prisma` **변경 없음**
- [ ] `prisma/migrations/**` **추가 없음**
- [ ] answer-assist route·server action·LLM env **추가 없음**
- [ ] PR-78·82·89·91 정책과 **민감정보·판단 금지** 일치
- [ ] `npm run typecheck` / `lint` / `build` 통과
- [ ] Antigravity·운영팀 리뷰 완료 (확정 필요)

---

## 금지 기능 최종 확인 (모든 후속 PR)

| 항목 | PR-93 | PR-94 | PR-95 |
|------|-------|-------|-------|
| LLM API 호출 | 없음 | reviewed PR | reviewed PR |
| RAG / vector / embedding | 없음 | optional later | optional later |
| public chatbot | 없음 | 없음 | 제한 검토만 |
| auto reply / auto post | — | 없음 | 없음 |
| 보험금·손해사정·의료 판단 | — | 차단 | **계속 차단** |
| 파일·OCR | 없음 | 없음 | 없음 |
| CorrectionRequest retrieval | 제외 | 제외 | 제외 |
| MessageTemplate body | 제외 | 제외 | 제외 |
| schema/migration (무심사) | 없음 | 별도 PR | 별도 PR |

---

## 근거 데이터 allowlist 빠른 참조

| 모델 | Answer-assist 사용 | 핵심 조건 |
|------|-------------------|-----------|
| KnowledgeArticle | ✅ (제한) | `isPublished`, `status=verified`, `aiUsable=true` |
| DisclosureLink | ✅ | `published`, `reviewedAt` |
| MessageTemplate | ✅ (safeCopy만) | `published`, `!isInternalOnly`, `safeCopy` |
| Insurer / ClaimDocument | ✅ (public 필드) | public WHERE |
| CommunityPost | ❌ (기본) | 실무 의견 — 공식 근거 아님 |
| CorrectionRequest | ❌ | 민감 제보 |

---

## 다음 PR

| PR | 제목 |
|----|------|
| PR-92-QA | 정책 문서 리뷰·Antigravity 검수 |
| PR-93 | AI Retrieval 후보 설계 |
| PR-94 | 관리자 내부 초안 MVP |
| PR-95 | 제한 공개 검토 |
