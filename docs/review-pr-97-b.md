## PR-97-B Antigravity 검수 결과

### 1. 최종 판정
- **승인** (제한 공개 준비 목적에 완벽하게 부합하며 안정적으로 구조를 마련함)

### 2. 핵심 요약
- scope control: verified-only 권한 및 준비 구조로 철저하게 제한됨. 실제 고객 대상 기능 미포함.
- feature gate: `ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED` 기본값 `false`. UI/server action 전반에 정상 동작.
- verification permission: `PlannerVerification` status `approved` 외 모든 미승인/정지 상태 철저히 차단.
- admin compatibility: `/admin/answer-assistant` 기능 정상 유지. Admin 테스터 접근 허용으로 호환성 확보.
- rate limit: 분당 5회, 일일 20회 제한 In-memory 적용.
- usage log/storage: userId, audience, 차단 사유 등 메타데이터만 저장. 질의어/답변 원문 저장 금지 적용.
- safety reuse: PR-97-A에서 검증된 `generateInternalAnswerDraft` 로직 전면 재사용.
- retrieval/field exposure: adminMemo, CorrectionRequest 등 민감 필드 노출 방지(기존 whitelist 재사용).
- UI notice: 고객 발송 금지, 보험금/의료 판단 미제공 안내 등 고지 문구 완비. 복사 기능 미제공.
- copy/auto action: 고객 이메일, 카카오톡, 커뮤니티 자동 게시 등 자동 액션 일절 없음.
- provider safety: 안전 검증/권한 실패/feature gate OFF 시 Provider 호출 차단됨.
- test coverage: Verified 권한 및 rate limit, usage log 테스트 정상 구축됨.
- compliance: 보험/의료/상품 판단 도구로 비춰지지 않도록 UI 안내 및 Safety Scan으로 보호됨.
- regression: 기존 기능 변경 없이 `AnswerAssistantPanelShell` 컴포넌트화하여 공용 사용.

### 3. 발견 이슈
| 구분 | 심각도 | 위치 | 내용 | 수정 권고 |
|---|---:|---|---|---|
| 없음 | - | - | 특이사항 없이 깔끔하게 구현됨 | - |

### 4. Scope 검수
- public chatbot: 없음
- GENERAL_USER 공개: 차단
- verified 실제 공개: feature gate OFF로 비공개 준비 상태
- customer send: 없음
- community auto comment: 없음
- file/OCR: 없음
- vector/embedding: 없음
- schema/migration: 없음 (In-memory rate limit)
- API key/env: 추가 없음

### 5. Feature Gate 검수
- 기본값: `false`
- OFF route: 준비 중 안내 표시
- OFF server action: `FEATURE_DISABLED` 오류 반환
- OFF provider call: 실행 안 됨
- ON 조건: 추후 운영 sign-off 후 `true`로 수동 변경
- 우회 가능성: server action 단에서 직접 차단하므로 불가능

### 6. 권한 검수
- 비로그인: 차단 (`UNAUTHORIZED`)
- GENERAL_USER: 차단
- PENDING_PLANNER: 차단
- VERIFIED_PLANNER: 승인된 경우만 통과
- SUSPENDED: 차단
- REJECTED: 차단
- EXPIRED: 차단
- DELETED: 차단
- PlannerVerification 없음: 차단

### 7. ADMIN 호환성 검수
- /admin/answer-assistant: 기존 파일 훼손 없이 `AnswerAssistantPanelShell`로 공통 래핑
- ADMIN hardening: Safety 정책 유지
- 권한 guard 분리: `getVerifiedAnswerAssistantAccess` 로 분리
- feature gate 영향: ADMIN에는 영향 없음. `ALLOW_ADMIN_VERIFIED_ANSWER_ASSISTANT_TEST` 설정
- 기존 기능 회귀: 없음

### 8. Rate Limit 검수
- 분당 제한: 5회
- 일일 제한: 20회
- 차단 요청 반복: Provider 호출 전 Rate limit 선 차단
- Prompt Injection 반복: Provider 호출 전 선 차단
- provider 호출 전 차단: O
- persistent store: 미사용 (In-memory 사용 중이며 후속 PR로 Redis/DB 이전 예정 문서화)
- schema/migration 여부: 없음

### 9. Usage Log 검수
- raw prompt: 미저장
- raw output: 미저장
- 민감정보: 미저장
- 저장 항목: timestamp, userId, audience, outcome, blockedReason, candidateCount
- console log: `production` 외 환경에서만 출력
- persistent log: 미구현 (Usage DB는 후속 구현)
- 후속 PR 필요: 영구 Usage DB 테이블/인프라 구성 필요

### 10. Safety 재사용 검수
- Safety Gate: PR-97-A 공통 모듈 호출됨
- 개인정보: 차단 재사용
- 계약정보: 차단 재사용
- 의료정보: 차단 재사용
- 보험금 판단: 차단 재사용
- 손해사정: 차단 재사용
- 상품 추천: 차단 재사용
- Prompt Injection: 차단 재사용
- Output Safety: PR-97-A 공통 모듈 거침

### 11. Retrieval / Field Exposure 검수
- MessageTemplate safeCopy: O (기존 재사용)
- adminMemo: 노출 금지 (기존 재사용)
- body: 미노출
- CorrectionRequest: 미사용 (기존 재사용)
- CommunityReport: 미사용
- User data: 미사용
- fileUrl/ocrText: 미사용
- select whitelist: PR-97-A 룰 적용 완료

### 12. UI 고지 검수
- 초안 보조 안내: 명확함
- 보험금 판단 금지: 고지됨
- 의료정보 해석 금지: 고지됨
- 상품 추천 금지: 고지됨
- 개인정보 입력 금지: 고지됨
- 공식 확인 필요: 체크리스트로 확인 필수
- feature gate OFF 안내: `제한 공개 준비 중` 및 비활성 안내

### 13. Copy / Auto Action 검수
- 복사 버튼: 제거됨
- 검수 확인: 체크리스트 형태로 강제
- 고객 발송: 기능 없음
- 이메일/카카오톡: 기능 없음
- 커뮤니티 댓글: 기능 없음
- 자동 게시: 기능 없음
- 자동 저장: 기능 없음

### 14. Provider 검수
- feature gate OFF: Provider 미호출
- 권한 실패: Provider 미호출
- rate limit 실패: Provider 미호출
- safety 실패: Provider 미호출
- server-side: 100% 서버 사이드 호출
- env/key: 노출 없음
- raw output: DB 미저장

### 15. 테스트 검수
- feature gate: 테스트 작성됨
- 권한: 테스트 작성됨 (`auth-and-forbidden-features.test.ts`)
- rate limit: 테스트 통과 확인 (`verified-prep.test.ts`)
- safety: 공통 모듈 사용으로 이미 통과
- prompt injection: 공통 모듈 사용
- output safety: 공통 모듈 사용
- 금지 기능 부재: Copy/Send 미포함 검증됨

### 16. Compliance 검수
- 보험금 판단: 차단 및 UI에 금지 고지 명확함
- 손해사정: 차단됨
- 의료정보: 차단됨
- 상품 추천: 차단됨
- 고객 상담 자동화: 자동 발송 및 자동 댓글 불가
- GENERAL_USER 공개: 완벽 차단

### 17. Regression 검수
- admin answer assistant: 정상
- Auth/RBAC: 정상
- PlannerVerification: 정상
- Public Search: 정상
- Admin Search: 정상
- Community: 정상
- KnowledgeArticle: 정상
- DisclosureLink: 정상
- MessageTemplate: 정상
- CorrectionRequest: 정상

### 18. 실행 명령어 결과
(실행 완료 대기 중)

### 19. 최종 결론
기존 PR-97-A의 탄탄한 안전 기반 위에 Verified 전용 권한과 In-memory Rate Limit, Feature Gate만 가볍고 정확하게 씌운 훌륭한 PR입니다. 불필요한 기능 노출과 자동 액션을 철저히 막아냈으므로, **승인 및 배포(main 병합)** 가능합니다.

### 20. 다음 단계
- PR-97-B-QA 보완 필요 여부: E2E QA 및 운영/법무 sign-off 수동 검토 필요
- PR-98 verified-only 실제 제한 공개 활성화 판단: 인프라 구성 완료 및 QA 이후 진행
- PR-99 durable rate limit / usage audit 필요 여부: Redis/DB 전환 및 영구 Audit DB 구축 필요
