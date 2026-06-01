# PR-78: CorrectionRequest 운영 정책

**정책 설계 전용 PR.** DB 모델, migration, server action, 관리자 인박스, public form, 파일 업로드, OCR, AI 답변은 이 PR에 포함하지 않는다.

## 1. Purpose

### 1.1 CorrectionRequest의 목적

`CorrectionRequest`는 PlannerDesk **public 화면에 노출된 참고 정보**에 대한 오류·개선 제보를 **관리자 검수 전용 큐**로 접수하기 위한 기능이다.

허용되는 제보 목적:

| 목적 | 설명 |
|------|------|
| 보험사 정보 오류 | 디렉토리·연락처·안내 문구 등 factual 오류 |
| 청구서류 정보 오류 | 서류 안내 문구·분류·필수 여부 설명 오류 (원본 서류 접수 아님) |
| 공시·약관 링크 오류 | 깨진 링크, URL 변경, 공식 출처 불일치 |
| 고객문구 오류 | `MessageTemplate` 표현·분류·채널 라벨 오류 |
| 지식 아카이브 피드백 | 오탈자, 출처, 분류, 보완 제안 |
| 일반 운영 제보 | 위 유형에 해당하는 **비민감** 일반 제보 |

### 1.2 목적이 아닌 것

아래는 CorrectionRequest로 처리하지 않는다.

- 보험금 지급 가능성·금액 판단
- 보험상품 추천·비교·가입 권유
- 의료 진단·치료·예후 판단
- 손해사정성 업무 수행 또는 그에 준하는 판단
- 고객 개별 계약·보장 내용 상담
- 민감자료·개인정보·의료자료 접수
- 파일·이미지 첨부 접수
- 청구서류 원본·진단서·영수증 접수
- 제보 즉시 public 반영
- AI 자동 답변·자동 수정 반영

PlannerDesk는 **손해사정 업무를 수행하지 않으며**, **의료 진단을 해석하지 않으며**, **보험금 지급 여부를 판단하지 않는다.**

### 1.3 개발 맥락

PR-71~77에서 DisclosureLink, MessageTemplate 등 운영형 관리자·public fetch·bulk action 기반이 구축되었다. PR-78은 그 다음 단계인 제보 큐 **이전**에 정책을 고정한다.

| 후속 PR | 범위 |
|---------|------|
| PR-79 | `CorrectionRequest` DB 모델·migration (본 문서 §9 기준) |
| PR-80 | public 제출 server action·검증 (본 문서 §10 기준) |
| PR-81 | 관리자 인박스·상태 처리 (본 문서 §11 기준) |

---

## 2. Allowed request types (허용 제보 유형)

제보 유형(`requestType`)은 아래 enum 후보를 기준으로 한다. PR-79에서 snake_case enum으로 정의한다.

| Code | 한글 라벨 | 허용 내용 | 금지 예시 |
|------|-----------|-----------|-----------|
| `broken_link` | 링크 오류 | URL 미동작, 리다이렉트 오류, 공식 URL 변경 제보 | 로그인 필요 계정 정보, 고객별 URL |
| `outdated_info` | 정보 구식 | 페이지 구조 변경, 연락처·안내 outdated | 보험사 내부 미공개 자료 요청 |
| `typo` | 오탈자·문장 | 띄어쓰기, 맞춤법, 문장 오류 | 고객 실명·병력이 포함된 수정 요청 |
| `wrong_category` | 분류 오류 | 카테고리·보험사·채널 분류 오류 | — |
| `document_requirement_update` | 청구서류 안내 변경 | **안내 문구**·필수 서류 목록 설명 수정 제보 | 청구서류 **이미지·PDF·스캔** 첨부 |
| `disclosure_update` | 공시·약관 링크 | 공식 공시실·약관 URL 변경 제보 | 비공식·제3자 블로그만 제보 |
| `message_template_feedback` | 고객문구 피드백 | 표현 개선·톤·분류 의견 (일반화된 문장) | 실제 고객 대화 전문, 병력·계약 스토리 |
| `knowledge_article_feedback` | 지식 아카이브 피드백 | 출처·요약·분류 보완 | 환자 사례 상세 기술 |
| `other` | 기타 | 위에 해당하지 않는 **비민감** 제보 | 민감정보·판단 요청 전반 |

### 2.1 대상 리소스 (`targetType`)

제보는 PlannerDesk가 관리하는 **공개 참고 콘텐츠**에 한정한다.

| `targetType` 후보 | 설명 |
|-------------------|------|
| `insurer` | 보험사 디렉토리 |
| `claim_document` | 청구서류 창고 |
| `disclosure_link` | 공시·약관 링크 |
| `message_template` | 고객 안내 문구 |
| `knowledge_article` | 지식 아카이브 |
| `general` | 특정 레코드 없는 일반 제보 |

`targetId`는 해당 도메인의 public ID(cuid)만 허용한다. 고객 ID·계약 ID는 저장하지 않는다.

---

## 3. Forbidden input (금지 입력 기준)

제보 본문(`message`)·제목(`title`)에 아래 정보가 **포함되면 저장을 차단**하거나 PR-80에서 `redactionRequired` 상태로 제한한다.

### 3.1 개인정보

- 실명 + 연락처 결합 정보
- 주민등록번호 (전체·마스킹 패턴 포함)
- 휴대전화번호 (010-xxxx-xxxx 등)
- 이메일 주소
- 상세 주소
- 계좌번호
- 신분증·운전면허 정보
- 고객번호·증권번호·계약번호
- 카드번호

### 3.2 의료정보

- 병명·진단명·질병코드(고객 맥락)
- 진료기록·처방·투약
- 수술명·입원·퇴원일
- 병원명·의사 소견
- 검사 결과·장애 등급
- “○○암”, “○○ 질환으로 입원” 등 개별 의료 사실 서술

### 3.3 보험 청구·계약 정보

- 보험금 청구 금액·지급 예상액
- 사고·질병 **개별** 상세 진술
- 손해사정·감정 자료 내용
- 진단서·입퇴원확인서 **문구 인용**
- 고객별 보장·면책·가입 내역
- “보험금 나오나요”, “청구 가능한가요” 등 **판단 요청**

### 3.4 파일·이미지

CorrectionRequest는 **첨부 필드를 두지 않는다** (PR-79 금지).

사용자가 본문에 “첨부했습니다”, “파일 보냈습니다” 등으로 요청해도 수용하지 않으며, 안내 문구로 파일 접수 불가를 명시한다.

금지 대상 예: 진단서, 영수증, 신분증, 통장 사본, 보험증권, 청구서류 원본, 병원 서류, 개인정보 포함 스크린샷.

---

## 4. Public form copy guidelines (입력창 안내 문구)

PR-80 public form 구현 시 아래 문구·원칙을 반영한다.

### 4.1 필수 안내 (표시 권장)

- “개인정보, 병명, 진단명, 계약번호, 청구서류 이미지는 입력하지 마세요.”
- “이 기능은 정보 오류 제보용이며, 보험금 지급 가능 여부를 판단하지 않습니다.”
- “접수된 내용은 관리자 검수 후 반영 여부가 결정됩니다.”
- “제보 내용이 바로 public 화면에 반영되지 않습니다.”
- “파일·이미지 첨부는 지원하지 않습니다.”

### 4.2 금지 UI 문구

다음과 같은 문구는 form·버튼·placeholder에 사용하지 않는다.

- “보험금 가능 여부를 확인해드립니다.”
- “청구 가능성을 판단해드립니다.”
- “서류를 올려주세요.” / “진단서를 첨부해주세요.”
- “개별 계약을 검토해드립니다.”
- “빠른 상담을 위해 연락처를 남겨주세요.”

### 4.3 입력 제한 (권장)

| 항목 | 권장 값 |
|------|---------|
| `title` 최소/최대 | 5~200자 |
| `message` 최소/최대 | 20~2,000자 |
| 형식 | plain text only (HTML 저장 금지) |

---

## 5. Server-side rejection criteria (서버 단 차단 기준)

PR-80에서 **client validation만으로 처리 금지.** server action 또는 route handler에서 재검증한다.

### 5.1 필수 차단

| 규칙 | 처리 |
|------|------|
| 빈 제목·빈 본문 | 거부 + 사용자 메시지 |
| 길이 초과 | 거부 |
| 주민등록번호 패턴 | 거부 또는 `redactionRequired` |
| 휴대전화·일반 전화 패턴 | 거부 |
| 이메일 패턴 | 거부 |
| 계좌번호 의심 패턴 | 거부 |
| 계약번호·증권번호 의심 키워드+숫자열 | 거부 |
| 의료 키워드 (진단명, 입원, 수술, 처방 등) | 거부 또는 `redactionRequired` |
| 보험금 지급·청구 판단 요청 표현 | 거부 |
| 파일 업로드 multipart | 거부 (엔드포인트 미제공) |
| HTML/script (`<script`, `javascript:`, `onerror=`) | sanitize 후 거부 또는 strip |
| URL spam (과다 URL, 단축 URL 남용) | 거부 또는 검수 큐 |
| 동일 세션/계정 반복 제출 | rate limit |

### 5.2 권장 보조 수단

- rate limit (IP·세션 기준 — IP 저장은 §6.4 최소화 원칙)
- honeypot field (봇 차단)
- forbidden keyword scan (MessageTemplate `MESSAGE_TEMPLATE_PROHIBITED_PHRASES`·disclosure 금지 표현과 정렬 검토)
- 제출 후 **public 미노출** (기본)
- 관리자 검수 전 운영 DB 외부 전송 금지

### 5.3 로깅

- 거부 사유는 **민감 본문 전체를 로그에 남기지 않는다**
- 통계용으로 `rejectionReasonCode` enum만 기록 권장

---

## 6. Retention and deletion (보관·삭제·마스킹)

### 6.1 원칙

- **최소 보관**: 운영·감사에 필요한 최소 기간만 보관
- 민감정보 포함 제보: **즉시 마스킹 또는 삭제** 우선
- public 자동 반영 없음 → 제보 본문은 운영 데이터가 아님

### 6.2 보관 기간 (운영 정책 확정 필요)

구체 일수는 법무·개인정보 검토 후 확정한다. PR-79 모델 설계 시 아래를 필드로 표현할 수 있게 한다.

| 상태 | 권장 방향 |
|------|-----------|
| 미처리 (`new`, `triaged`) | 처리 완료 후 N일 (확정 필요) |
| 처리 완료 (`applied`, `rejected`) | 운영 이력용 M일 (확정 필요) |
| 민감정보 포함 | `redactedAt` 또는 `deletedAt` 즉시 설정 |
| 스팸·악성 | 짧은 보관 후 삭제; 차단 메타만 유지 가능 |

### 6.3 권장 필드 (PR-79)

| 필드 | 용도 |
|------|------|
| `retentionUntil` | 자동 삭제·아카이브 예정 시각 |
| `deletedAt` | soft delete |
| `redactedAt` | 본문 마스킹 완료 시각 |
| `resolvedAt` | 처리 완료 시각 |

### 6.4 IP·식별자 저장

IP·User-Agent 저장 여부는 **최소화 원칙**에 따라 별도 검토한다. 저장 시 보관 기간을 `retentionUntil`과 동일하게 제한한다.

---

## 7. Admin workflow states (관리자 처리 상태)

상태 enum 후보 (PR-79, snake_case):

| Status | 의미 | public 반영 |
|--------|------|-------------|
| `new` | 신규 접수 | 없음 |
| `triaged` | 관리자 1차 확인 | 없음 |
| `needs_redaction` | 민감정보 마스킹 필요 | 없음 |
| `accepted` | 반영 대상으로 승인 | **수동** 반영 전까지 없음 |
| `rejected` | 반영하지 않음 | 없음 |
| `applied` | 해당 도메인 데이터 수정 완료 | 관리자가 CRUD에서 반영 후 기록 |
| `archived` | 보관 | 없음 |
| `deleted` | 삭제 처리 | 없음 |

### 7.1 핵심 운영 규칙

1. 제보 접수 ≠ 콘텐츠 수정. `accepted` 후에도 public 데이터는 **해당 admin 화면에서 수동 수정**한다.
2. `applied`는 “인박스에서 자동 patch”가 아니라 “운영자가 반영 완료를 표시”하는 상태다.
3. `adminMemo`는 **관리자 전용**; public·API·로그에 노출하지 않는다.

### 7.2 우선순위 (`priority` 후보)

`low`, `normal`, `high` — `needs_redaction`·`broken_link`(전체 장애) 등은 `high` 검토.

---

## 8. Sensitive data handling (민감정보 처리)

민감정보가 포함된 제보가 들어온 경우:

1. public 자동 반영 **금지**
2. 관리자 인박스에서 **경고 배지** (`containsSensitiveData`, `redactionRequired`)
3. 목록·상세에서 **원문 노출 최소화** (접기·마스킹된 미리보기)
4. 마스킹 또는 삭제 **우선**
5. 필요 시 제보 레코드 자체 폐기 (`deleted`)
6. 민감정보 원문을 **애플리케이션 로그·에러 리포트에 남기지 않음**

권장 플래그:

| 필드 | 타입 | 설명 |
|------|------|------|
| `containsSensitiveData` | `Boolean` | 자동·수동 검출 |
| `redactionRequired` | `Boolean` | 마스킹 작업 필요 |
| `redactedAt` | `DateTime?` | 마스킹 완료 |

---

## 9. PR-79 DB model design criteria

### 9.1 필수 후보 필드

| 필드 | 비고 |
|------|------|
| `id` | cuid |
| `targetType` | enum |
| `targetId` | nullable; `general`일 때 null |
| `requestType` | enum (§2) |
| `title` | plain text, 길이 제한 |
| `message` | plain text, 길이 제한 |
| `status` | enum (§7) |
| `priority` | enum |
| `containsSensitiveData` | boolean, default false |
| `redactionRequired` | boolean, default false |
| `redactedAt` | DateTime? |
| `resolvedAt` | DateTime? |
| `resolvedById` | String? (User FK 정책은 기존 content 모델과 동일) |
| `adminMemo` | Text, admin-only |
| `retentionUntil` | DateTime? |
| `createdAt` / `updatedAt` | audit |

선택 후보: `deletedAt`, `rejectionReasonCode`, `submitterSessionHash` (IP raw 저장 지양).

### 9.2 PR-79에서 금지하는 필드

- 파일·이미지·attachment URL
- `customerId`, `contractId`, `policyNumber` 등 고객 식별
- 의료 기록 구조화 필드 (진단명, 병원명 등 별도 컬럼)
- `payoutEligible`, `claimAmount`, `medicalDiagnosis` 등 판단·의료 필드
- `autoApplyToPublic`, `publishedPatch` 등 자동 반영
- OCR 결과·AI 답변 본문

### 9.3 migration 원칙

- destructive migration 없이 additive만
- 기존 Insurer / ClaimDocument / DisclosureLink / MessageTemplate / KnowledgeArticle 테이블에 **FK cascade delete로 제보가 끌려 삭제되지 않도록** `SetNull` 또는 제보 독립 유지 검토

---

## 10. PR-80 submit action criteria

public 제출 구현 시:

| 요구 | 설명 |
|------|------|
| Server validation | §5 전체 재적용 |
| No file upload | multipart 거부; 첨부 UI 없음 |
| No auto public apply | 저장만; 콘텐츠 테이블 미수정 |
| Plain text | HTML strip; link는 허용하되 spam 규칙 적용 |
| Sensitive hit | 저장 차단 또는 `status=needs_redaction` + flags |
| Auth | 비로그인 제보 허용 여부는 제품 결정; 로그인 시에도 §3 금지 동일 |
| Response | “접수됨”만; 처리 결과·판단 답변 금지 |

권장 API 응답: `{ ok: true, id }` — 상세 본문은 관리자만 조회.

---

## 11. PR-81 admin inbox criteria

| 요구 | 설명 |
|------|------|
| RBAC | `ROLE_CONTENT_ADMIN` 이상 (기존 admin 패턴) |
| Sensitive alert | `containsSensitiveData` / `needs_redaction` 우선 정렬·배지 |
| Minimal exposure | 기본 접힌 본문; 전체 보기는 명시적 클릭 |
| State transitions | §7 상태만 변경; bulk는 PR 범위 외 별도 검토 |
| No auto patch | 인박스에서 target 레코드 직접 수정 UI 제공 금지 (링크로 해당 admin CRUD 이동) |
| adminMemo | public fetch·export 금지 |
| Audit | `resolvedById`, `resolvedAt` 기록 |

---

## 12. Absolutely forbidden features

CorrectionRequest 라인에서 **절대 구현하지 않음**:

| 기능 | 비고 |
|------|------|
| 파일 업로드 | 엔드포인트·스토리지·presigned URL |
| OCR | 진단서·영수증 텍스트 추출 |
| 진단서·의료자료 접수 | §3 |
| 보험금 지급 판단 | §1.2 |
| 손해사정성 판단 | §1.2 |
| 고객 계약 검토 | §3.3 |
| 개인정보 수집 유도 | §4 |
| 제보 즉시 public 반영 | §7 |
| AI 자동 답변 | 고객·제보자 대상 |
| AI 자동 수정 반영 | 콘텐츠 테이블 patch |
| 이메일·카카오 자동 발송 | 알림은 별도 PR·정책 |

---

## 13. Completion criteria (PR-78)

- [x] 목적·비목적 문서화
- [x] 허용 제보 유형 정의
- [x] 금지 입력 기준 정의
- [x] 입력창 안내 문구 기준
- [x] 서버 차단 기준
- [x] 보관·삭제·마스킹 기준
- [x] 관리자 처리 상태
- [x] PR-79 / PR-80 / PR-81 연결 기준
- [x] 금지 기능 명시
- [x] 코드·schema 변경 없음 (docs only)

---

## Related documents

- [PR-78 CorrectionRequest checklist](./PR-78-CORRECTIONREQUEST-CHECKLIST.md)
- PR-71 DisclosureLink schema · PR-73 MessageTemplate schema (콘텐츠 도메인 참고)
- `lib/message-template/safety.ts` — 금지 표현·민감 변수 (PR-80 스캔 정렬 참고)
