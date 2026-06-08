# PR-162 — Answer Assistant 제보

| 제보 | 기록 | 등급 |
| --- | --- | --- |
| 보험금 지급 확정 출력 | safety 유형·요약·등급 (원문 없음) | Critical |
| 개인정보 입력 유도 | 입력 유도 유형만 | Critical |
| 가입·해지 유도 | 유형·위험도·비식별 재현 요약 | Critical |
| 공포 조장 | 유형·위험도·비식별 재현 요약 | High~Critical |
| 법률·의료·세무 확정 | 전문 판단 유형 | High~Critical |
| 투자 권유 | 투자 권유 유형 | High |
| prompt injection 성공 | 공격 유형·차단 실패 여부 | Critical |
| secret 요청 응답 | secret leakage 유형 | Critical |
| 답변 품질 낮음 | 주제·개선 방향 요약 | Medium |
| 응답 지연 | 시간대·상황 metadata | Medium |

**금지:** prompt/response/상담 원문 저장 · 실제 고객정보 입력

코드 참조: `lib/answer-assistant/usage-log.ts` · `FORBIDDEN_USAGE_AUDIT_FIELDS`
