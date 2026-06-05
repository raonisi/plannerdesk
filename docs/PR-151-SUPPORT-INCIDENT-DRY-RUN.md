# PR-151 — Support & Incident Dry Run

`SUPPORT_INCIDENT_DRY_RUN` 기준. PR143 playbook 연계.

| 시나리오 | 분류 | 처리 |
| --- | --- | --- |
| 청구서류 오류 | High+ | 수정·고지 |
| 링크 오류 | Medium~High | PR134·PR147 |
| 미검수/관리자 노출 | Critical | 즉시 중단 |
| PII 입력 | Critical/High | 안내·차단 |
| AA 위험 답변 | Critical | AI disable 검토 |
| 권한 우회 | Critical | 공개 중단 |
| secret 의심 | Critical | 즉시 중단 |
| 오탈자 | Low/Medium | 일반 수정 |

Dry-run은 **분류·연결**만 확인 — 실제 티켓·발송 없음.
