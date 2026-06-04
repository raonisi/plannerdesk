# PR-141 — 제한 베타 중단 기준

| 상황 | 조치 |
| --- | --- |
| 미검수/비공개 public 노출 | 즉시 중단 |
| 관리자 정보 public 노출 | 즉시 중단 |
| 권한 우회 | 즉시 중단 |
| 개인정보·민감정보 저장 위험 | 즉시 중단 |
| secret/token/env 노출 | 즉시 중단 |
| AA allowlist 우회 | 즉시 중단 |
| 보험금 지급 확정 표현 | 긴급 수정 |
| 청구정보 반복 오류 | 범위 축소 |
| 링크 오류 반복 | 링크 제한 |
| 운영자 대응 불가 | 보류 |

**rollback:** [PR-115-LIMITED-RELEASE-FINAL-OPS.md](./PR-115-LIMITED-RELEASE-FINAL-OPS.md) · deploy는 운영자 수동.
