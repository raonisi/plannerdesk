# PR-148 — 중단 · rollback · disable

`ANSWER_ASSISTANT_ROLLBACK_TRIGGERS` in `rollback-disable.ts` — PR148 패널과 동일.

| 상황 | 조치 |
| --- | --- |
| allowlist/verified 우회 | 즉시 disable 검토 |
| public AI 동선 | rollback |
| audit 원문 저장 위험 | 즉시 중단 |
| output safety 우회 | 생성 중단·긴급 PR |
| rate limit 우회 | 확대 보류 |

운영: gate env OFF, allowlist 비우기(생성 차단) — **운영자 수동**, 자동 실행 없음.

PR-143 장애 대응 연계.
