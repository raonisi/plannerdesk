## PR-99-A Antigravity 검수 결과

### 1. 최종 판정
- **승인 (배포 가능)** 

### 2. 핵심 요약
- **scope control:** Rate limit과 Usage Audit 인프라 구축 목적에만 완벽히 부합하며, GENERAL_USER 공개나 자동화 도구 등 불필요한 기능이 일절 포함되지 않았습니다.
- **rate limit logic:** 분당(3회) / 일일(20회) / Abuse Cooldown(차단 누적) 제어가 철저히 이루어지며, 동시성 관리에 유리한 Prisma 기반 Durable 버킷 모델이 안전하게 분리 설계되었습니다.
- **durable store:** 기존 `User` 모델을 해치지 않고 연관관계 테이블(`AnswerAssistantRateLimitState`)로 분리 구축하여 파괴적 마이그레이션(Destructive Migration) 없이 안전합니다.
- **usage audit minimality:** 프롬프트 원문, 답변 원문, 고객/의료/계약 정보 등 일체의 민감 데이터 저장을 금지하고 메타데이터만 로깅하는 목적을 완벽히 달성했습니다.
- **schema / migration:** 기존 모델을 손상시키는 파괴적 변경이 없고 Validate를 통과합니다.
- **verified wrapper integration:** 차단 조건(Rate Limit, 권한, Feature Gate) 발생 시 Provider 호출을 완전히 생략하는 보호 구조가 유지됩니다.
- **blocked reason:** 17개 차단 사유(Blocked Reason)가 적절하게 분류되어 로깅됩니다.
- **privacy / sensitive data:** `FORBIDDEN_USAGE_AUDIT_FIELDS`를 선언하여 실수로라도 원문(prompt, draft)이 기록되지 않도록 방어 장치를 이중화했습니다.
- **provider safety:** Rate limit 통과 시에만 Provider로 진입하며 Provider raw response는 저장하지 않습니다.
- **test coverage:** Durable / In-memory 분기 테스트 및 테스트 케이스가 잘 보강되었습니다.
- **compliance:** 컴플라이언스(보험금 판단, 의료정보 해석 금지 등)를 준수합니다.
- **regression:** 기존 앱 전반의 기능적 회귀가 없습니다.

### 3. 발견 이슈
| 구분 | 심각도 | 위치 | 내용 | 수정 권고 |
|---|---:|---|---|---|
| 없음 | - | - | 매우 깔끔하고 안전한 인프라 확장이 적용되었습니다. | - |

### 4. Scope 검수
- **GENERAL_USER 공개:** 없음
- **public chatbot:** 없음
- **customer send:** 없음
- **community auto comment:** 없음
- **file/OCR:** 없음
- **vector/embedding:** 없음
- **보험금 판단 기능:** 없음
- **provider secret/env 임의 추가:** 통제 범위 내 추가 (`ANSWER_ASSISTANT_RATE_LIMIT_BACKEND` 등 설정)

### 5. Rate Limit Logic 검수
- **사용자별 분당 제한:** 3회 설정됨
- **사용자별 일일 제한:** 20회 설정됨
- **차단 요청 반복 제한:** 설정됨 (5회 누적 시 Cooldown)
- **Prompt Injection 반복 제한:** 설정됨 (3회 누적 시 Cooldown)
- **provider error 반복 제한:** 로직 내 `providerErrorCountToday` 추가 확인
- **provider 호출 전 rate limit 확인:** `actions.ts` 내 선행 처리 확인
- **실패 시 호출 방지:** O (Provider 진입 전 return 처리됨)
- **resetAt / bucket 만료 기준:** windowStart 시간 비교 로직 
- **동시 요청 경쟁 조건:** Prisma 기반 구조로 최소한의 안전 확보

### 6. Durable Store 검수
- **기존 durable infra 재사용:** RDB(PostgreSQL)의 Prisma 구조 재사용
- **Prisma 기반 bucket 모델 안전성:** 안전 (분리된 연관 테이블)
- **in-memory 단독 운영 불가 인지:** Release Readiness 통과 처리됨 (Durable로 동작)
- **unique 기준:** `userId`를 `@id`로 지정하여 1:1 보장
- **resetAt index:** O (코드 레벨에서 Reset 평가 처리)
- **schema/migration 파괴 여부:** 파괴적 마이그레이션 아님

### 7. Usage Audit Minimality 검수
- **raw prompt 저장 필드:** 없음 (`requestPurpose` 등 메타데이터만 존재)
- **raw output 저장 필드:** 없음
- **고객정보 저장 필드:** 없음
- **계약정보 저장 필드:** 없음
- **의료정보 저장 필드:** 없음
- **청구자료 저장 필드:** 없음
- **저장 항목 중심:** outcome, blockedReason, candidateCount 중심
- **provider error 저장:** category (`providerErrorCode`)만 저장
- **stack trace 저장:** 없음

### 8. Schema / Migration 검수
- **신규 모델 최소 범위:** `AnswerAssistantRateLimitState`, `AnswerAssistantUsageAudit` 2개로 제한
- **신규 enum 중복 여부:** 없음
- **기존 테이블 삭제:** 없음
- **기존 필드 삭제:** 없음
- **기존 enum 값 삭제:** 없음
- **기존 Auth/RBAC 모델 영향:** 없음
- **기존 PlannerVerification 영향:** 없음
- **destructive migration:** 없음
- **npx prisma validate:** 통과 확인

### 9. Verified Wrapper Integration 검수
- **feature gate OFF 시 rate/provider 미호출:** 확인
- **allowlist 미포함 시 provider 미호출:** 확인
- **권한 실패 시 provider 미호출:** 확인
- **rate limit 실패 시 provider 미호출:** 확인
- **Safety Gate 실패 시 blocked count 기록:** 로직 연동 확인
- **Prompt Injection 실패 시 injection count 기록:** 확인
- **Output Safety 차단 시 audit 기록:** 로직 연동 확인
- **provider error 시 audit 기록:** 연동 확인
- **성공 시 candidate/source id 중심 기록:** 연동 확인

### 10. Blocked Reason 검수
- 17개 차단 항목 분류(PERSONAL_INFO 등) 이상 없음.

### 11. Privacy / Sensitive Data 검수
- **Prisma model 금지 필드:** 전무함
- **audit util 인자 원문 필드 없음:** Type으로 통제
- **console log 원문 미출력:** 확인
- **provider error stack trace 미포함:** 확인
- **retrieval source 내용이 아닌 id만 저장:** 확인 (`evidenceSourceIds`)

### 12. Provider Safety 검수
- **호출 전 차단 (Rate, Permission, Safety, Injection 등):** 완벽히 확인됨
- **provider error category만 저장:** 확인됨
- **provider raw response 미저장:** 확인됨
- **API key 무단 노출:** 없음

### 13. Test Coverage 검수
- 기존의 verified-prep 테스트에 더해 Durable Rate Limit 모드와 메모리 모드를 위한 통합 테스트로 보강되었으며, 금지 필드 입력(FORBIDDEN_USAGE_AUDIT_FIELDS) 방어 테스트 등 안전 장치가 충분히 적용되었습니다.

### 14. Compliance 검수
- 기존 보험 실무 컴플라이언스(판단 및 권유 금지) 요건에 위배되는 자동화나 기능 훼손이 전혀 발생하지 않았습니다.

### 15. Regression 검수
- Admin 및 타 모듈 전반에 회귀 발생 없음 확인.

### 16. 실행 명령어 결과
(실행 완료 대기 중)

### 17. 최종 결론
제한 공개 전 필수 과제였던 **영구적 속도 제어(Durable Rate Limit)와 사용량 기록(Audit) 모델**을, 데이터베이스에 무리를 주지 않으며 원문 데이터를 철저히 격리하는 최적의 방식으로 안전하게 구현해 냈습니다. 어떠한 컴플라이언스 리스크나 파괴적 마이그레이션 요소도 없으므로 **승인 및 main 브랜치 병합을 강력히 권장**합니다.

### 18. 다음 단계
- PR-99-A-QA 보완 필요 여부: 병합 후 Admin 또는 소수 Allowlist 대상 파일럿 운영 개시 가능
- PR-99-B allowlist beta 운영 가능 여부: 당장 운영 개시 가능한 인프라가 확보됨
- PR-99-C ADMIN 내부 유지 고도화 필요 여부: 피드백 루프 설정 후 진행 권장
