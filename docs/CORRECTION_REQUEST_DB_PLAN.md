# Correction Request DB Planning Guide
# 수정 요청·제보 DB화 사전 설계

## 1. 목적

- 이 문서는 수정 요청·제보 기능을 DB 기반으로 확장하기 전 필요한 사전 설계 문서다.
- 현재 MVP는 클립보드 복사 기반이며, DB 저장을 하지 않는다.
- DB화는 고객 개인정보, 의료자료, 보험금 판단 요청 유입 가능성이 있으므로 고위험 작업이다.
- 이번 문서는 구현이 아니라 설계 기준을 정리한다.
- 실제 Prisma 모델, migration, 서버 액션, 관리자 큐는 후속 고위험 PR에서만 다룬다.

## 2. 현재 MVP 구조

- 사용자는 잘못된 링크, 번호, 팩스, 서류 정보 등을 제보할 수 있다.
- 현재 제보는 클립보드 복사 기반이다.
- 서버에 저장하지 않는다.
- 이메일을 발송하지 않는다.
- 파일을 업로드하지 않는다.
- 고객 개인정보와 의료자료를 처리하지 않는다.

## 3. DB화가 필요한 이유

- 제보 처리 상태 추적
- 관리자 검수 큐 운영
- 반복 제보 항목 분석
- 공식 출처 확인 이력 관리
- 반영 여부 기록
- 잘못된 정보 방치 방지
- 운영 품질 개선

주의:

- DB화는 운영 품질 개선 목적이며, 고객별 청구 상담 또는 보험금 판단 기능으로 확장하지 않는다.

## 4. DB화 리스크

- 고객 이름, 전화번호, 주민등록번호 등 개인정보 유입
- 병명, 진단명, 진단서, 처방전 등 의료정보 유입
- 보험금 지급 가능 여부 판단 요청 유입
- 손해사정성 요청 유입
- 의료 진단 해석 요청 유입
- 공식 출처 없는 개인 경험담 기반 정보 반영
- 관리자 검수 전 공개 반영 위험
- 장기 보관에 따른 개인정보 리스크
- 스팸성 제보 유입
- 악성 링크 입력 가능성
- 운영자가 공식 출처 확인 없이 반영할 위험

## 5. 수집 최소화 원칙

- 고객 개인정보 수집 금지
- 고객 의료자료 수집 금지
- 파일 업로드 금지
- 제보자 이름은 선택값 또는 미수집 우선
- 제보자 이메일은 가능하면 미수집 또는 선택값
- 공식 출처 URL은 허용
- 제보 내용은 실무 정보 오류에 한정
- 보험금 판단 요청은 저장하지 않거나 즉시 `rejected` 처리
- 의료자료 포함 제보는 저장하지 않거나 즉시 삭제 대상으로 분류

## 6. CorrectionRequest 모델 후보

중요:

- 아래는 후보 설계이며, **실제 Prisma schema 수정이 아니다**.
- 필드명과 타입은 후속 고위험 PR에서 확정한다.

후보 필드:

- `id`
- `targetType`
  - `insurer`
  - `claim_document`
  - `disclosure_link`
  - `message_template`
  - `general`
- `targetId`
- `category`
  - `system_url`
  - `customer_center`
  - `helpdesk`
  - `call_monitoring`
  - `claim_fax`
  - `mailing_address`
  - `terms_url`
  - `claim_form_url`
  - `disclosure_url`
  - `claim_document`
  - `card_payment`
  - `browser_support`
  - `typo`
  - `ui_display`
  - `other`
- `title`
- `description`
- `officialSourceUrl`
- `reporterName`
- `reporterEmail`
- `status`
- `riskLevel`
- `containsSensitiveData`
- `sensitiveReason`
- `reviewedBy`
- `reviewedAt`
- `resolvedAt`
- `adminMemo`
- `createdAt`
- `updatedAt`
- `expiresAt`

## 7. 상태값 후보

중요:

- 아래 상태값은 후보이며, 실제 enum 생성은 하지 않는다.

`status` 후보:

- `received`: 제보 수신 직후 상태
- `triage`: 운영 검토 대기 상태
- `needs_official_source`: 공식 출처 근거 보완 필요
- `needs_redaction`: 민감정보 마스킹/제거가 필요한 상태
- `accepted`: 공식 출처 확인 후 반영 가능 판정
- `rejected`: 반영 불가 판정
- `resolved`: 반영 또는 종료 처리 완료
- `archived`: 운영 큐에서 분리된 보관 상태
- `deleted_sensitive`: 민감정보 포함으로 삭제 처리된 상태

## 8. 위험도 후보

`riskLevel` 후보:

- `low`
- `medium`
- `high`
- `blocked`

기준:

- `low`: 단순 오탈자, 링크 오류, 번호 오류
- `medium`: 공식 출처 확인 필요
- `high`: 개인정보 또는 의료정보 의심
- `blocked`: 보험금 판단 요청, 손해사정성 요청, 의료 진단 해석 요청

## 9. 민감정보 탐지 기준

DB화 전 반드시 서버 검증에서 아래 탐지 기준을 검토한다.

탐지 후보:

- 주민등록번호 패턴
- 전화번호 패턴
- 계좌번호 의심 패턴
- 이메일 주소 패턴
- 계약번호 / 증권번호 + 긴 숫자열
- 병명
- 진단명
- 진단서
- 처방전
- 진료기록
- 검사결과지
- 입퇴원확인서
- 수술확인서
- 보험금청구서 원본
- 보험금 지급 가능 여부
- 보험금 얼마나
- 지급될까요
- 손해사정
- 진단 해석
- 청구 가능성 판단

주의:

- 보험사 고객센터 번호, 팩스 번호 제보까지 막지 않도록 구분 로직이 필요하다.

## 10. 서버 검증 원칙

- 클라이언트 경고만 믿지 않는다.
- 서버에서도 금지어와 민감정보 패턴을 검사한다.
- 위험 제보는 저장 전 차단하거나 `needs_redaction` 큐로 보낸다.
- 파일 업로드는 허용하지 않는다.
- URL은 allowlist 또는 sanitize 검토가 필요하다.
- HTML/script 입력 방어가 필요하다.
- 관리자 검수 전 공개 데이터에 반영하지 않는다.

## 11. 관리자 큐 설계 후보

중요:

- 이 섹션은 구현이 아니라 운영 화면 설계 후보다.

관리자 큐에서 필요한 항목:

- 접수일
- 대상 유형
- 제보 카테고리
- 위험도
- 공식 출처 URL
- 제보 내용 요약
- 민감정보 의심 여부
- 상태
- 담당자
- 처리 메모
- 반영 여부
- 삭제 필요 여부

관리자 액션 후보:

- mark as triage
- request official source
- accept
- reject
- mark resolved
- archive
- delete sensitive report

## 12. 보관 기간과 삭제 정책

- 민감정보 포함 제보는 저장하지 않거나 즉시 삭제 대상
- `rejected` 제보는 일정 기간 후 삭제 또는 비식별화
- `resolved` 제보는 운영 품질 목적상 제한 기간 보관
- `reporterEmail`을 수집한다면 별도 보관 기간 필요
- `expiresAt` 필드 또는 주기적 정리 작업 검토
- 삭제 작업은 별도 PR에서 설계

## 13. 권한과 RBAC

- 비회원: 제보 가능 여부는 별도 검토
- 검증 설계사: 제보 가능
- `content_admin`: 제보 검토 가능
- `super_admin`: 전체 관리 가능
- 일반 사용자는 관리자 큐 접근 불가
- 관리자 큐는 public route에 절대 노출 금지

## 14. 공개 반영 원칙

- 제보가 접수되어도 공개 데이터에 자동 반영하지 않는다.
- 관리자 검수 전 공개 반영 금지
- 공식 출처 확인 전 `verified` 상태로 표시 금지
- `needs_review` 상태가 필요한 경우 명확한 배지 표시
- `draft/unpublished` visibility rule 유지
- 반영 시 변경 이력 또는 `adminMemo` 기록 검토

## 15. 향후 PR 분리안

프로젝트 진행 상황에 따라 번호는 조정 가능하며, 아래는 권장 분리안이다.

- PR50A: CorrectionRequest schema 설계 리뷰
- PR50B: CorrectionRequest Prisma 모델 추가
- PR50C: migration 및 Prisma generate
- PR50D: 제보 서버 액션 구현
- PR50E: 민감정보 서버 검증 구현
- PR50F: 관리자 제보 큐 UI
- PR50G: 제보 상태 처리 액션
- PR50H: 삭제/보관 정책 구현
- PR50I: audit log 연동 검토
- PR50J: rate limit / spam 방지 검토

## 16. 절대 금지 구현 범위

이 문서 PR에서는 다음을 하지 않는다.

- Prisma schema 변경
- migration
- CorrectionRequest 모델 생성
- 제보 저장 서버 액션 구현
- 이메일 발송 구현
- 관리자 제보 큐 구현
- 파일 업로드 구현
- 고객 개인정보 저장
- 고객 의료자료 저장
- 보험금 지급 판단 기능
- 손해사정성 기능
- 의료 진단 해석 기능
- AI 답변 기능
- 커뮤니티 기능
- BOA CRM 연결
- Aiven 연결

## 참고 문서

- `docs/CORRECTION_REQUEST_POLICY.md`
- `docs/CORRECTION_REQUEST_PLAN.md`
- `docs/PRODUCT_ROADMAP.md`
