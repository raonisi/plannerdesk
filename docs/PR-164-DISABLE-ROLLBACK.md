# PR-164 — Disable / Rollback 기준

`ANSWER_ASSISTANT_ROLLBACK_TRIGGERS` (rollback-disable.ts):

| 상황 | 조치 |
| --- | --- |
| 개인정보 입력 유도 출력 | 일시 중단 검토 |
| 보험금 지급 확정 출력 | output safety 긴급 보완 |
| 가입·해지 유도 | 제한 강화 |
| prompt injection 성공 | 기능 중단·guard 보완 |
| secret 노출 위험 | 즉시 중단 |
| allowlist/public 우회 | 즉시 중단 |
| audit 원문 저장 | 즉시 중단 검토 |
| 반복 safety failure | 제한 베타 중단 검토 |

환경 플래그: `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=false`
