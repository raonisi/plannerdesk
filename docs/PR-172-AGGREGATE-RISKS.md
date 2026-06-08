# PR-172 제한 베타 종합 리스크

## Critical (정적 0 — guard·blocked 유지 시)

- public 비공개 데이터 노출
- admin/planner 접근 우회
- Answer Assistant 접근 확대
- AI 지급 확정·PII 유도
- prompt/response 원문 저장
- secret/token 노출
- 운영 DB migration 위험
- 결제 기능 노출
- 약관·개인정보·환불정책 확정 표현

## High

- 청구서류·보험사 정보 오류 반복 (workflow ready, live correction pending)
- 고객지원 미처리 누적 (plan only, PR177)

## Medium

- 링크 오류 반복
- UX 불편 (mobile partial)

## Low

- 문구 오탈자

PR173에서 Critical 1건이라도 열리면 Stop 또는 No-Go.
