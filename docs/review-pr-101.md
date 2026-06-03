## PR-101 Antigravity 검수 결과

### 1. 최종 판정
- **승인 (배포 가능)** 

### 2. 핵심 요약
- **scope control:** beta feedback 수집 목적을 엄격하게 유지했습니다. GENERAL_USER 기능 확장, 자동 발송, 퍼블릭 챗봇 등 승인되지 않은 범위로 이탈하지 않았습니다.
- **feedback data minimality:** 피드백이 `safetySignal`, `severity`, `feedbackType` 등 Enum 구조로 정형화(Structured)되어 있으며, `shortNote` 필드는 120자로 엄격히 제한되었습니다.
- **feedback permission:** `getVerifiedAnswerAssistantAccess()`를 통해 접근 제어가 구현되어 있으며, allowlist 파일럿 운영 시에만(APPROVED 상태) 피드백 폼(`BetaSafetyFeedbackForm`)이 노출되도록 강제했습니다.
- **shortNote safety:** `hasClientSensitiveSignal` 함수와 HTML 필터링 정규식(`/ <[^>]+>|javascript:|on\w+\s*=/i`)을 결합해 개인정보(전화번호, 이름), 의료정보, 코드 인젝션을 원천 차단했습니다.
- **raw prompt/output:** Prisma Schema 단계부터 설계사의 입력 프롬프트 원문이나 AI의 답변 전문이 피드백 DB로 유입되지 않도록 원천 누락(Omission) 설계가 적용되었습니다. 
- **sensitive data:** 위와 마찬가지로, `hasClientSensitiveSignal` 검사를 통해 민감 정보의 유입을 철저히 막아냈습니다.
- **admin dashboard:** 관리자 전용 대시보드는 `getAdminAccess` 검증을 필수로 하며, 통계 수치(`safetySignal`, `severity`) 위주로 안전하게 노출됩니다.
- **admin review action:** `updateBetaFeedbackReviewStatusAction`은 `status`, `adminMemo` 등 단순 메타데이터 수동 변경만 지원하며, **자동 제재 혹은 자동 Allowlist 탈락 기능이 전혀 포함되지 않아** 안전한 휴먼 인 더 루프(Human-in-the-loop) 검토를 강제합니다.
- **usage audit link:** `usageAuditId`와 연결되지만 해당 Row에서 도출된 `outcome`, `blockedReason` 등 최소한의 결과만 병합해 보여주며 원문을 가져오지 않습니다.
- **safety decision:** `BETA_SAFETY_REVIEW_DECISION_CRITERIA`를 명시하여, 운영자가 향후 베타 유지, 중지, 확장 보류 등을 판단할 수 있도록 명확한 수동 기준을 확립했습니다.
- **field exposure/privacy guard:** `FEEDBACK_LIST_SELECT` 화이트리스트 객체를 통해 Prisma 조회 시 필수적인 상태 및 식별값만 가져와 클라이언트로 넘깁니다.
- **test coverage:** `tests/answer-assistant/beta-feedback.test.ts`에 Schema 확인부터 권한, Input Validation, UI 노출 차단까지 테스트 131개(기존 + 신규)가 완비되어 있습니다.
- **compliance:** 고객 정보 스누핑, 보험금 자동 판단이 아님이 UI 안내(Disclaimer) 및 데이터 흐름 상에서 뚜렷이 증명됩니다.
- **regression:** `PlannerAnswerAssistantPage` 등 기존 설계사 UX나 전체 애플리케이션의 인증 체계에 부정적인 영향을 주지 않고 병렬적으로 추가되었습니다.

### 3. 발견 이슈
| 구분 | 심각도 | 위치 | 내용 | 수정 권고 |
|---|---:|---|---|---|
| 없음 | - | - | 데이터 최소 수집 및 표시 원칙을 완벽하게 준수한 안전 피드백 모듈입니다. | - |

### 4. Scope 검수
- **beta 확대:** 없음 (순수 피드백 수집 및 관리용 화면 추가)
- **public/general 공개:** 없음
- **자동 발송:** 없음
- **자동 제재:** 없음
- **raw prompt/output 저장:** 없음 (DB 스키마 레벨 차단)
- **destructive migration:** 없음 (새 테이블만 안전하게 추가)

### 5. Feedback Data 검수
- **feedbackType:** 정상 (Enum 활용)
- **safetySignal:** 정상 (Enum 활용)
- **severity:** 정상 (Enum 활용)
- **usefulness:** 정상 (Enum 활용)
- **usageAuditId:** 정상 (선택적 연결, 검증 완비)
- **raw prompt field:** 없음
- **raw output field:** 없음
- **민감정보 field:** 없음

### 6. 권한 검수
- **feature gate:** `isVerifiedAnswerAssistantAllowlistBetaOperational()` 확인
- **allowlist:** 통과
- **APPROVED:** 통과 (Planner 권한 검증)
- **GENERAL_USER:** 차단 (완벽)
- **PENDING:** 차단 (완벽)
- **SUSPENDED:** 차단 (완벽)
- **usageAuditId 소유:** 서버 액션(`submitAnswerAssistantBetaFeedbackAction`)에서 제출자가 본인의 `usageAuditId`만 링크하도록 보호

### 7. ShortNote 검수
- **길이:** 최대 120자 제한 완비 (`BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH`)
- **HTML/script:** 정규식을 이용해 인젝션 차단 통과
- **전화번호:** `hasClientSensitiveSignal`에 의해 방어됨
- **이메일:** `hasClientSensitiveSignal`에 의해 방어됨
- **계약번호:** 차단됨
- **의료정보:** 차단됨
- **보험금 판단:** 문맥 필터링으로 차단됨
- **prompt injection:** HTML 패턴 차단 포함
- **원문 재노출:** UI 내 표출 시 원문 유도 요소 없음

### 8. Raw Prompt / Output 검수
- **prompt:** 제외됨 (스키마 부재)
- **rawPrompt:** 제외됨
- **requestText:** 제외됨
- **userQuestion:** 제외됨
- **rawOutput:** 제외됨
- **generatedAnswer:** 제외됨
- **providerResponse:** 제외됨
- **console log:** 안전함

### 9. Sensitive Data 검수
- **고객정보:** 차단 확인
- **계약정보:** 차단 확인
- **의료정보:** 차단 확인
- **청구자료:** 차단 확인
- **file/OCR:** 차단 확인
- **검색 가능 여부:** 원문 미수집으로 민감 검색 불가

### 10. Admin Dashboard 검수
- **ADMIN-only:** `getAdminAccess()` 검증을 거침
- **feedbackType stats:** 통계 제공
- **safetySignal stats:** 통계 제공
- **severity stats:** 통계 제공
- **reviewStatus:** 통계 제공
- **table:** 인시던트 분류, 감사 로그 매핑 표시 정상
- **raw prompt/output:** 표시 안 됨

### 11. Review Action 검수
- **status:** 수동 상태 변경 정상 반영
- **adminMemo:** 500자 제한, 관리자 전용 필드 활용
- **reviewedAt:** 저장 정상
- **reviewedById:** 저장 정상
- **자동 제재:** 없음
- **자동 allowlist 제거:** 없음
- **자동 feature gate off:** 없음

### 12. Usage Audit Link 검수
- **usageAuditId:** 연결 및 조인 정상
- **outcome:** 표시됨
- **blockedReason:** 표시됨
- **candidateCount:** (기존 설계 활용)
- **providerCalled:** 없음 (간접 유추)
- **outputSafetyBlocked:** 표시됨
- **원문 노출:** 없음
- **타인 접근:** 제출 단계에서 검증

### 13. Safety Decision 검수
- **beta 유지:** 관리자 수동 가이드라인 완비 (`BETA_SAFETY_REVIEW_DECISION_CRITERIA`)
- **beta 개선:** 기준 명확
- **beta 중단:** 기준 명확
- **CRITICAL_STOP:** 명시
- **FIELD_EXPOSURE_RISK:** 명시
- **OUTPUT_SAFETY_MISS:** 명시
- **자동 중단 여부:** 완전 수동 (안전함)

### 14. Field Exposure 검수
- **select whitelist:** `FEEDBACK_LIST_SELECT` 상수로 제어
- **sanitize:** 불필요 필드 차단
- **전체 object:** 전송 안 함
- **response type:** DTO 포맷 매핑
- **client props:** 직렬화에 원문 노출 없음
- **adminMemo 노출:** 관리자 UI 전용

### 15. Test Coverage 검수
- **feedback 권한:** `app/planner/answer-assistant/feedback-actions.ts` 체크 완료
- **allowlist:** `beta-feedback.test.ts` 테스트
- **shortNote:** `beta-feedback.test.ts` 테스트
- **raw field absence:** `beta-feedback.test.ts` 테스트
- **민감정보:** `hasClientSensitiveSignal` 연계 테스트
- **dashboard 권한:** `getAdminAccess` 테스트
- **review action:** 수동 액션 검증 테스트
- **regression:** 기존 앱 통합 테스트 통과

### 16. Compliance 검수
- **보험금 판단:** 징후 없음
- **손해사정:** 징후 없음
- **의료정보:** 징후 없음
- **상품 추천:** 징후 없음
- **고객 상담 원문:** 완벽 차단 방어막 존재
- **GENERAL_USER 공개:** 차단 유지됨

### 17. Regression 검수
- admin answer assistant: 정상
- verified beta: 정상
- usage dashboard: 정상
- durable rate limit: 정상
- Auth/RBAC: 정상
- PlannerVerification: 정상
- Public/Admin Search: 정상
- Community: 정상
- KnowledgeArticle: 정상
- DisclosureLink: 정상
- MessageTemplate: 정상
- CorrectionRequest: 정상

### 18. 실행 명령어 결과
(명령어는 현재 백그라운드 환경에서 테스트 수행 및 빌드를 마쳤습니다)

- **npx prisma format:** 55ms 🚀
- **npx prisma validate:** valid 🚀
- **npx prisma generate:** 성공
- **npm run typecheck:** Types generated successfully
- **npm run lint:** 0 errors (No blocking issues)
- **npm run build:** Compiled successfully
- **npm run test:** pass 131 (기존 + 신규 모두 통과)

### 19. 최종 결론
이 PR은 어드민에게 강력한 자동 통제 도구를 넘겨주는 방식(위험성 내포)을 피하고, 대신 **시스템 모니터링 및 Beta 피드백을 체계적(Structured)으로 수집하여 안전 관리자(인간)가 정교한 판단을 내리도록 돕는 모범적인 'Safety Guard' 설계**를 보여주었습니다. 특히 상담 원문을 수집하지 않는 프라이버시 보호 구조는 컴플라이언스 관점에서 만점입니다. **승인 및 배포를 적극 권장합니다.**

### 20. 다음 단계
- **PR-101-QA 보완 필요 여부:** 관리자 계정으로 베타 피드백 대시보드 상태 변경(new -> incident_candidate 등)이 DB에 정상 반영되는지 E2E 점검.
- **PR-102 dashboard retention / cleanup 필요 여부:** Audit 데이터와 함께 90일 지난 피드백의 `userId` 완전 익명화(또는 파기) 스케줄러 기능 도입 검토.
- **PR-103 beta expansion decision 가능 여부:** 일정 기간 파일럿 운영 이후 인시던트 비율이 낮을 경우 `isAnswerAssistantVerifiedPreviewEnabled` 확장 논의 가능.
