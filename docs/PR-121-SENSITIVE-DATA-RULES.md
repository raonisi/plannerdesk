# PR-121 — 민감정보·PII 기록 규칙

PlannerDesk 피드백 Registry는 **문서 기반**이며, **고객 PII 수집 채널이 아니다.**

---

## 기록 금지

- 고객 성명·주민번호·전화·주소·계약번호
- 의료·진단·청구 상세 (환자 식별 가능 정보)
- 비밀번호·OAuth token·session·`AUTH_SECRET`
- allowlist 이메일·내부 식별자 전체 목록
- `.env` 값·Railway secret

---

## 원문에 민감정보가 포함된 경우

1. Registry **원문**에는 요약만: 「고객 연락처 포함 → 마스킹 후 저장」
2. 재현은 **가상 데이터**로 대체
3. 필요 시 제보자에게 **삭제·재작성** 요청
4. Critical(유출 의심) → [PR-121-FEEDBACK-WORKFLOW.md](./PR-121-FEEDBACK-WORKFLOW.md) P0

---

## 허용 메타데이터

- 역할 유형 (설계사 / content_admin)
- URL 경로·쿼리 (호스트만, 토큰 제외)
- 스크린샷 **외부** 경로·파일명
- 화면·기능·유형·심각도

---

## Answer Assistant beta feedback

- `/admin/answer-assistant/feedback` — **구조화 safety 신호**만 (PR-101)
- 일반 UX 피드백과 **혼합 저장 금지**

---

## Antigravity

- [ ] Registry 예시에 PII 없음
- [ ] 인앱 PII 폼 추가 없음 (PR121)
