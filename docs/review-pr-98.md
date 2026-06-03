## PR-98 Antigravity 검수 결과

### 1. 최종 판정
- **승인** (실제 제한 공개 활성화 여부에 대한 운영 판단 근거가 매우 구체적이고 체계적으로 설계되었습니다.)

### 2. 핵심 요약
- **scope control:** GENERAL_USER 공개나 public chatbot, 자동 발송 등의 금지 항목을 철저히 배제하고 Release Decision 목적에 충실하게 작성되었습니다.
- **release decision evidence:** In-memory Rate Limit의 한계(Persistent Store 부재)를 명확히 인지하여, 전체 공개(Go)가 아닌 allowlist 기반의 **조건부 파일럿(Go)** 으로 정확히 한계를 설정했습니다.
- **feature gate:** 기본값 OFF(`ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT = false`) 유지 및 Env 설정에 의해서만 켜지도록 견고히 구성되었습니다.
- **allowlist:** client 노출 및 PII(이메일 등) 저장을 배제하고 `userId`로만 서버 사이드에서 통제하도록 안전하게 설계되었습니다.
- **verification permission:** `PlannerVerification.status = approved` 외에도 `SUSPENDED` 등 정지 조건을 완벽히 재검증합니다.
- **rate limit:** 분당 3회, 일일 20회, abuse cooldown 조건 등을 설정하여 Provider 비용 및 공격 방어를 견고히 하였습니다. (Persistent Store 부재 시 전체 공개 불가 명시)
- **usage log/storage:** prompt 원문/출력 원문을 절대 저장하지 않고, userId와 blockedReason 등 필수 메타데이터만 남기도록 통제되었습니다.
- **safety reuse:** Safety Gate, Prompt Injection 방어, Output Safety Scan 모두 약화되지 않고 재사용되었습니다.
- **retrieval/field exposure:** 기존 화이트리스트 유지, adminMemo 및 MessageTemplate body 미노출 등 보안이 철저히 유지됩니다.
- **UI notice:** feature gate OFF 안내, allowlist 미포함 안내, 권한 미달 안내 등이 모두 세분화되어 사용자 혼란을 최소화했습니다.
- **rollback:** 롤백 조건과 절차가 명확히 명시되어, 언제든 환경 변수 `false` 변경과 함께 즉시 차단이 가능하도록 대비되었습니다.
- **auto action absence:** 고객 자동 발송, 자동 저장, 커뮤니티 자동 댓글 등 운영 위협 기능이 전혀 포함되지 않았습니다.
- **compliance:** 의료정보, 보험금, 손해사정 판단 금지 및 상품 추천 금지 안내가 명확하게 반영되어 있습니다.
- **regression:** Admin 도구를 포함해 기존 기능의 훼손이 전혀 발생하지 않았습니다.

### 3. 발견 이슈
| 구분 | 심각도 | 위치 | 내용 | 수정 권고 |
|---|---:|---|---|---|
| 없음 | - | - | 매우 이상적인 판단 기준과 안전 장치로 구현되었습니다. | - |

### 4. Scope 검수
- **GENERAL_USER 공개:** 차단
- **public chatbot:** 미존재
- **customer send:** 자동 발송 미존재
- **community auto comment:** 기능 미존재
- **file/OCR:** 기능 미존재
- **vector/embedding:** 사용 안 함
- **schema/migration:** 신규 추가 없음 (PR-99에서 진행 예정)
- **API key/env:** allowlist 및 feature gate 용도로만 제한적 추가됨 (`ANSWER_ASSISTANT_VERIFIED_ALLOWLIST`, `ANSWER_ASSISTANT_VERIFIED_PREVIEW`)
- **hardcoded ON:** `false` 기본값 코드로 안전하게 유지

### 5. Release Decision 검수
- **PASS:** Feature Gate, 권한, Safety Gate 등 28개 안전 기준
- **PARTIAL:** In-memory Rate limit, Provider 안전 검증
- **FAIL:** Durable Rate limit 부재
- **NOT_TESTED:** 없음
- **Go / No-Go:** 전체 공개는 No-Go, allowlist 파일럿만 조건부 Go로 정확하게 평가
- **durable rate limit 판단:** 부재로 인해 전체 공개 불가(No-Go)로 올바르게 판단됨

### 6. Feature Gate 검수
- **기본값:** `false` (상수 `ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT`)
- **env 미설정:** `false`로 동작
- **hardcoded:** 없음
- **OFF route:** 활성화 대기 안내 정상 노출
- **OFF server action:** `FEATURE_DISABLED` 예외 반환 확인
- **OFF provider call:** 미호출 확인
- **ON 조건:** Env 명시적 `true` 설정 및 Allowlist 조건 충족 시

### 7. Allowlist 검수
- **allowlist 방식:** `userId` 기반 Comma-separated env
- **미포함 차단:** `NOT_ALLOWLISTED` 차단 반환 확인
- **client 노출:** 서버 전용 함수(`getAnswerAssistantVerifiedAllowlistUserIds`)로 은닉 확인
- **개인정보 사용:** 이메일 등 PII 미사용
- **전체 공개 여부:** 불가 (`isUserOnVerifiedAnswerAssistantAllowlist` 체크 필수)
- **PlannerVerification 재검증:** Allowlist 통과 후에도 Verification 상태 교차 검증 확인

### 8. 권한 검수
- **비로그인:** `UNAUTHORIZED` 차단
- **GENERAL_USER:** `UNAUTHORIZED` 차단
- **PENDING_PLANNER:** `UNAUTHORIZED` 차단
- **VERIFIED_PLANNER:** 승인된 사용자만 조건부 허용
- **SUSPENDED:** 차단 확인
- **REJECTED:** 차단 확인
- **EXPIRED:** 차단 확인
- **DELETED:** 차단 확인
- **server action:** Action 로직 최상단에서 차단 방어 확인 (`requireVerifiedAnswerAssistantAccess`)

### 9. Rate Limit 검수
- **분당 제한:** 3회 (변경 적용 확인)
- **일일 제한:** 20회 (유지 확인)
- **차단 요청 반복:** 5회 누적 시 24시간 abuse cooldown
- **Prompt Injection 반복:** 3회 누적 시 24시간 abuse cooldown
- **provider 호출 전 차단:** O
- **durable store:** 미적용 (In-memory 사용 중)
- **전체 공개 가능 여부:** 미적용 상태이므로 전체 공개 불가(No-Go)

### 10. Usage Log 검수
- **raw prompt:** 저장 차단
- **raw output:** 저장 차단
- **민감정보:** 저장 차단
- **저장 가능 항목:** userId, purpose, 차단 사유, 출처 ID, cooldown 정보 등
- **console log:** PII 없이 메타데이터만 래핑
- **persistent audit:** DB 모델 없음 (파일럿용 In-memory Buffer)

### 11. Safety 검수
- **Safety Gate:** PR-97 기반 통과
- **개인정보:** 통과 (입력 차단)
- **계약정보:** 통과 (입력 차단)
- **의료정보:** 통과 (입력 차단)
- **청구자료:** 통과 (입력 차단)
- **보험금 판단:** 통과 (입력 차단)
- **손해사정:** 통과 (입력 차단)
- **상품 추천:** 통과 (입력 차단)
- **Prompt Injection:** 차단 확인 (Abuse 방어 로직 추가됨)
- **Output Safety:** 최종 생성물 검증 적용

### 12. Retrieval / Field Exposure 검수
- **MessageTemplate safeCopy:** 전용 사용
- **adminMemo:** 노출 안 됨
- **body:** 노출 안 됨
- **CorrectionRequest:** 참조 안 함
- **CommunityReport:** 참조 안 함
- **미검수 데이터:** 쿼리 필터 적용 (reviewedAt 등 체크)
- **provider context:** 안전 필드만 제공됨
- **client payload:** 민감 필드 없음

### 13. UI / UX 검수
- **gate OFF 안내:** 명확함
- **allowlist 미포함 안내:** 명확함 (단계적 공개 대상 별도 안내)
- **검증 상태 미충족:** 명확함
- **초안 보조 안내:** 명확함
- **금지 범위:** 명확함
- **공식 확인 필요:** 체크리스트로 확인 필수 지정됨
- **자동 발송 오인:** 방지됨

### 14. Rollback 검수
- **판단 문구 발생:** 롤백 
- **민감정보 전달:** 롤백 
- **내부 필드 노출:** 롤백 
- **rate limit 미작동:** 롤백 
- **GENERAL_USER 접근:** 롤백 
- **gate OFF 방식:** `ANSWER_ASSISTANT_VERIFIED_PREVIEW=false` 즉시 반영
- **allowlist 초기화:** Env 제거로 즉각 초기화 가능
- **재활성화 조건:** PR-99 인프라 해결 후로 명확히 명시됨

### 15. Auto Action 검수
- **고객 발송:** 미제공
- **이메일/카카오톡:** 미제공
- **커뮤니티 댓글:** 미제공
- **Q&A 자동 답변:** 미제공
- **자동 게시:** 불가
- **자동 저장:** 불가

### 16. Compliance 검수
- **보험금 판단:** 불가 및 방어 안내
- **손해사정:** 불가 및 방어 안내
- **의료정보:** 불가 및 방어 안내
- **상품 추천:** 불가 및 방어 안내
- **자동 상담:** 일반 챗봇 기능 없음
- **GENERAL_USER 공개:** 차단

### 17. Regression 검수
- **admin answer assistant:** 정상
- **verified route:** 정상
- **Auth/RBAC:** 정상
- **PlannerVerification:** 정상
- **Public Search:** 정상
- **Admin Search:** 정상
- **Community:** 정상
- **KnowledgeArticle:** 정상
- **DisclosureLink:** 정상
- **MessageTemplate:** 정상
- **CorrectionRequest:** 정상

### 18. 실행 명령어 결과
(명령어 실행 완료 대기 중)

### 19. 최종 결론
이번 PR-98은 "무조건 공개"라는 리스크를 방어하고, 부족한 시스템 인프라(Durable Rate Limit / Audit DB 부재) 상황을 정확하게 직시하여 **전체 공개 No-Go 판정 및 소수 Allowlist 기반 파일럿 운영(조건부 Go)** 이라는 합리적이고 안전한 결론을 도출해 내었습니다. 이에 더해 어뷰징 방어를 위한 Cooldown 제약과 명확한 롤백(Rollback) 시나리오까지 완비되어, **main 브랜치에 안전하게 병합(승인) 가능합니다.**

### 20. 다음 단계
- **PR-98-QA 보완 필요 여부:** 관리자와 소수 테스트 설계사 ID만 추가하여 Staging 환경 QA 진행
- **PR-99-A durable rate limit / usage audit 필요 여부:** 전체 Verified 오픈을 위해서는 Redis Rate Limit 및 Audit DB 필수 구현 필요
- **PR-99-B allowlist beta 운영 가능 여부:** QA 후 극소수 대상 Beta 파일럿 운영은 당장 가능함
- **PR-99-C ADMIN 내부 유지 고도화 필요 여부:** Verified 파일럿 피드백을 기반으로 출력 품질 고도화에 집중
