# PR-143 — Rollback / Disable 기준

| 상황 | 조치 |
| --- | --- |
| visibility guard 문제 | 배포 보류·rollback |
| admin route public 접근 | 즉시 rollback 후보 |
| AA 우회·usage audit 원문 위험 | AI disable |
| PII 저장 위험 | 기능 중단 |
| 청구정보 반복 오류 | 데이터 수정 PR·기능 제한 |
| 링크 오류 반복 | PR-134·링크 제한 |
| 검색 미검수 노출 | PR-132·검색 제한 |
| bulk 오작동 | bulk 제한·PR107/139 |
| 운영자 대응 불가 | 제한 베타 중단 |

상세: [PR-115-LIMITED-RELEASE-FINAL-OPS.md](./PR-115-LIMITED-RELEASE-FINAL-OPS.md), Answer Assistant [PR-137](./PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md).
