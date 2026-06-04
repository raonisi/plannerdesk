# PR-142 — 제한 베타 고지 범위

PR141 안내와 정합. **법적 검토 완료·확정 약관 표현 금지.**

## 고지 항목

- 제한 베타 · 수동 승인 · 공개 기능만
- admin·리포트·이력·bulk 비공개
- 데이터·보험금·링크 한계
- PII 입력 금지
- AA allowlist 제한
- 이슈 제보 · 중단 가능

## 안내 후보

`LIMITED_BETA_NOTICE_ROWS` in `terms-privacy-plan.ts`

## 금지

`NOTICE_FORBIDDEN_PHRASES` — “최종 약관”, “개인정보처리방침 확정”, “법적 검토 완료” 등
