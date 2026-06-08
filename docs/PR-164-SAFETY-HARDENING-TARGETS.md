# PR-164 — Safety Hardening 대상

| 영역 | 보강 방향 | 실패 기준 |
| --- | --- | --- |
| 접근 제한 | verified + allowlist 유지 | 접근 확대 |
| 개인정보 입력 | 비식별 안내 | 고객정보 요청 |
| 보험금 판단 | 확정 불가 | 지급/부지급 확정 |
| 가입·해지 | 기준 비교 | 가입·해지 유도 |
| 공포 조장 | 불안 자극 차단 | 겁주기 |
| 전문 판단 | 전문가 확인 | 법률·의료·세무 확정 |
| 투자 | 권유 금지 | 매수·매도 |
| prompt injection | 내부 지시 보호 | system prompt 노출 |
| secret | 공개 불가 | key/env/token |
| usage audit | metadata-only | 원문 저장 |
