# PR-78: CorrectionRequest 체크리스트

PR-78 정책 문서([PR-78-CORRECTIONREQUEST-POLICY.md](./PR-78-CORRECTIONREQUEST-POLICY.md)) 기반. 후속 PR 착수 전·QA 시 점검용.

---

## PR-79 전 체크리스트 (DB 모델·migration)

스키마 PR 착수 전:

- [ ] 모델에 **고객 개인정보 저장 전용 필드**가 없는가 (이름, 주민번호, 연락처, 계좌, 계약번호 등)
- [ ] **파일 첨부** 필드·relation·storage key가 없는가
- [ ] **의료자료** 구조화 저장 필드가 없는가 (진단명, 병원명, 수술명 등)
- [ ] **보험금 지급·청구 판단** 필드가 없는가
- [ ] `retentionUntil` / `deletedAt` / `redactedAt` / `resolvedAt` 중 보관·삭제 정책 반영 필드가 설계되었는가
- [ ] `containsSensitiveData`, `redactionRequired`, `redactedAt` 플래그가 있는가
- [ ] `adminMemo`가 admin-only로 문서화되었는가
- [ ] public **자동 반영** 필드가 없는가
- [ ] enum이 프로젝트 **snake_case** 규칙을 따르는가
- [ ] target 삭제 시 제보 cascade hard delete가 없는가 (SetNull 또는 독립 유지)
- [ ] migration이 **destructive**하지 않은가

---

## PR-80 전 체크리스트 (public 제출 server action)

제출 기능 PR 착수 전:

- [ ] [정책 §5](./PR-78-CORRECTIONREQUEST-POLICY.md#5-server-side-rejection-criteria-서버-단-차단-기준) 서버 validation이 구현 예정인가
- [ ] **금지 패턴** (PII, 의료 키워드, 판단 요청) 차단이 **서버**에 있는가
- [ ] client-only validation에 의존하지 않는가
- [ ] **파일 업로드** 엔드포인트·UI가 없는가
- [ ] **spam / rate limit** / honeypot 기준이 있는가
- [ ] 제출 후 **public 콘텐츠 자동 수정**이 없는가
- [ ] `title` / `message` 길이·plain text 제한이 있는가
- [ ] HTML/script injection 방어가 있는가
- [ ] 거부 시 민감 본문 전체를 **로그에 남기지** 않는가
- [ ] [정책 §4](./PR-78-CORRECTIONREQUEST-POLICY.md#4-public-form-copy-guidelines-입력창-안내-문구) 필수 안내 문구가 UI에 있는가
- [ ] 금지 UI 문구(§4.2)가 사용되지 않았는가

---

## PR-81 전 체크리스트 (관리자 인박스)

인박스 PR 착수 전:

- [ ] **관리자 권한** (비로그인·일반 사용자 차단)이 server action에 있는가
- [ ] `containsSensitiveData` / `needs_redaction` **경고·우선 표시**가 있는가
- [ ] 목록·상세에서 **원문 노출 최소화** (마스킹·접기)가 있는가
- [ ] [정책 §7](./PR-78-CORRECTIONREQUEST-POLICY.md#7-admin-workflow-states-관리자-처리-상태) 상태 전이가 구현되었는가
- [ ] **마스킹·삭제** 운영 동작이 있는가 (`redactedAt`, `deletedAt` 등)
- [ ] `adminMemo`가 **public API·fetch에 포함되지** 않는가
- [ ] 인박스에서 target 레코드를 **자동 patch**하지 않는가 (해당 admin CRUD로 이동만)
- [ ] `applied` 상태가 “수동 반영 완료 표시”로만 쓰이는가

---

## PR-78-QA (정책 PR 자체)

- [ ] `docs/PR-78-CORRECTIONREQUEST-POLICY.md` 존재
- [ ] `docs/PR-78-CORRECTIONREQUEST-CHECKLIST.md` 존재
- [ ] `prisma/schema.prisma` **변경 없음**
- [ ] `prisma/migrations/**` **추가 없음**
- [ ] server action / route / admin page **추가 없음**
- [ ] Antigravity·운영팀 리뷰 완료 (확정 필요)

---

## 금지 기능 최종 확인 (모든 후속 PR)

| 항목 | PR-79 | PR-80 | PR-81 |
|------|-------|-------|-------|
| 파일 업로드 | 필드 없음 | 엔드포인트 없음 | 첨부 UI 없음 |
| OCR | 없음 | 없음 | 없음 |
| 의료자료 저장 | 없음 | 차단 | 마스킹·삭제 |
| 개인정보 저장 | 없음 | 차단 | 경고 |
| 보험금 판단 | 없음 | 차단 | 답변 금지 |
| public 자동 반영 | 없음 | 없음 | 수동 CRUD만 |
| AI 자동 답변 | 없음 | 없음 | 없음 |
