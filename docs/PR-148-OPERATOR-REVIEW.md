# PR-148 — 운영자 검토

| 항목 | 기준 |
| --- | --- |
| 접근 | verified + allowlist |
| 로그 | metadata-only |
| safety | Critical/High → PR-143 |
| rate limit | 우회 없음 |
| retention | cleanup 준수 |
| PII 입력 제보 | 즉시 중단 |
| 출력 | 보험금·가입/해지 유도 |
| public | `/planner/answer-assistant` only |

admin: `/admin/answer-assistant/*` — audit, feedback, cleanup, beta-decision (읽기·운영 문서).
