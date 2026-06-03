# PR-93: Answer Assistant Retrieval 체크리스트

PR-93 설계 문서([PR-93-RETRIEVAL-DESIGN.md](./PR-93-RETRIEVAL-DESIGN.md)) 및 [PR-92 Answer Assistant Safety Policy](./PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md) 기반. PR-94 착수 전·QA 시 점검용.

---

## Retrieval 대상 체크리스트

- [ ] `KnowledgeArticle`은 **verified + aiUsable + isPublished** (public보다 엄격)만 사용한다
- [ ] `DisclosureLink`는 **published + reviewedAt** 공식 링크만 사용한다
- [ ] `MessageTemplate`은 **`safeCopy`만** 사용한다 (`body` 제외)
- [ ] `Insurer`는 **isPublished + verificationStatus** public 조건만 사용한다
- [ ] `ClaimDocument`는 public 안내 필드만 사용한다
- [ ] `CorrectionRequest`는 **완전 제외**한다
- [ ] `CommunityReport`는 **완전 제외**한다
- [ ] `CommunityPost`는 **기본 제외**한다
- [ ] `adminMemo`는 **전 도메인 제외**한다
- [ ] 미검수·draft·archived·rejected·blinded·deleted 데이터는 제외한다

---

## Field Exposure 체크리스트

- [ ] select **whitelist** 방식인가
- [ ] `MessageTemplate.body` 제외
- [ ] `forbiddenClaims` 제외
- [ ] `complianceNote` 제외
- [ ] `adminMemo` 제외
- [ ] `reviewedById` / `createdById` / `updatedById` 제외
- [ ] User 개인정보 제외
- [ ] `fileUrl` / `ocrText` 제외 (schema에 없어도 계약상 금지)

---

## Safety Gate 체크리스트

- [ ] **보험금 판단** 질문 → retrieval 차단
- [ ] **손해사정성 판단** 질문 → retrieval 차단
- [ ] **의료정보 해석** 질문 → retrieval 차단
- [ ] **상품 추천·가입 유도** 질문 → retrieval 차단
- [ ] **개인정보** 입력 → retrieval 차단
- [ ] **계약정보** 입력 → retrieval 차단
- [ ] **청구자료·진단서** 입력 → retrieval 차단
- [ ] **Prompt injection** (adminMemo·비공개 검색 등) → 차단

---

## PR-94 연결 체크리스트

- [ ] `RetrievalCandidate` 타입 확정 ([retrieval-types.ts](../lib/answer-assistant/retrieval-types.ts))
- [ ] `RetrievalPolicyResult` / `RetrievalQueryResult` 확정
- [ ] `RETRIEVAL_SOURCE_PRIORITY` 확정
- [ ] `blockedReason` / `blockedMessage` 기준 확정
- [ ] `insufficientEvidence` 기준 확정 (후보 0건 등)
- [ ] `needsOfficialCheck` 표시 가능
- [ ] 출처 목록(`candidates`) 반환 가능
- [ ] 근거 0건이면 **답변 생성 차단** 가능
- [ ] `RETRIEVAL_VISIBILITY_SOURCES`와 `lib/public/*` WHERE **동기** 유지
- [ ] ADMIN 전용 권한 gate

---

## PR-93-QA (설계 PR 자체)

- [ ] `docs/PR-93-RETRIEVAL-DESIGN.md` 존재
- [ ] `docs/PR-93-RETRIEVAL-CHECKLIST.md` 존재
- [ ] `lib/answer-assistant/retrieval-types.ts` 존재 (타입만)
- [ ] `searchRetrievalCandidates` 등 **실행 함수 없음**
- [ ] LLM / RAG / vector / embedding **없음**
- [ ] `prisma/schema.prisma` **변경 없음**
- [ ] `prisma/migrations/**` **추가 없음**
- [ ] API key / `.env` **추가 없음**
- [ ] PR-92 정책과 **일치**
- [ ] `npm run typecheck` / `lint` / `build` 통과
- [ ] Antigravity·운영팀 리뷰 완료 (확정 필요)

---

## 금지 기능 최종 확인

| 항목 | PR-93 |
|------|-------|
| LLM API 호출 | 없음 |
| RAG / vector / embedding | 없음 |
| Retrieval DB query 실행 | 없음 |
| public chatbot | 없음 |
| 답변 생성 UI | 없음 |
| schema / migration | 없음 |

---

## 도메인 WHERE 빠른 참조

| 모델 | Answer-assist WHERE 핵심 |
|------|-------------------------|
| KnowledgeArticle | `isPublished`, `status=verified`, `aiUsable=true`, `reviewedById` set |
| DisclosureLink | `PUBLIC_DISCLOSURE_LINK_WHERE` |
| MessageTemplate | `PUBLIC_MESSAGE_TEMPLATE_WHERE` + prohibited phrase filter |
| Insurer | `isPublished`, `verificationStatus ∈ {verified, needs_review}` |
| ClaimDocument | `isPublished`, `verificationStatus ∈ {verified, needs_review}` |

---

## 다음 PR

| PR | 제목 |
|----|------|
| PR-93-QA | Retrieval 설계 리뷰 |
| PR-94 | 관리자 내부 초안 MVP (retrieval 실행 + gate) |
| PR-95 | 제한 공개 전 안전 검증 |
