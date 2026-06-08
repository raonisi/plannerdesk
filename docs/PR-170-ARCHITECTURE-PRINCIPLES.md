# PR-170 — Payment Architecture 기본 원칙

SSOT: `PAYMENT_ARCHITECTURE_PRINCIPLES`

| 원칙 | 기준 |
| --- | --- |
| 구현 전 검토 | PR170은 구현이 아니라 구조 검토 |
| 결제정보 비저장 | 카드·계좌·인증정보 직접 저장 금지 |
| PG 위임 | 결제·민감정보는 PG 기준 검토 |
| 권한 분리 | 결제 상태와 admin/planner 혼동 금지 |
| 환불 분리 | 환불·취소·해지는 PR171 |
| 개인정보 최소화 | 결제 관련 최소 수집 |
| 보안 우선 | webhook·secret·signature 별도 설계 |
| 유료화 보류 | 가격표·구독 플랜 확정 금지 |
| AI safety 유지 | 유료 기능이어도 AA 기준 유지 |
| 법무 검토 필수 | 약관·개인정보·환불·전자상거래 고지 |
