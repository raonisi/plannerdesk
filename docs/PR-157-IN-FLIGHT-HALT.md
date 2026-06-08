# PR-157 — 실행 중 즉시 중단 기준

| 상황 | 조치 |
| --- | --- |
| public admin/planner 접근 | 즉시 중단 |
| 미검수·비공개 public 노출 | 즉시 중단 |
| 운영 데이터 public 노출 | 즉시 중단 |
| 일반 planner AA 접근 | 즉시 중단 |
| allowlist 없이 AA 접근 | 즉시 중단 |
| AI 지급 확정·PII 유도·가입 유도 | AI 중단 검토 |
| prompt injection·secret 노출 | 즉시 중단 |
| build migrate 운영 DB | 즉시 중단 |
| 결제/가입 의도치 않게 노출 | 즉시 중단 |

SSOT: `IN_FLIGHT_HALT_CRITERIA`
