# PR-143 — Critical 대응 기준

Critical은 일반 backlog로 보내지 않는다. 제한 베타 중 Critical 발생 시 **외부 공개 즉시 보류 또는 중단** ([PR-141-BETA-HALT-CRITERIA.md](./PR-141-BETA-HALT-CRITERIA.md)).

| 상황 | 즉시 조치 |
| --- | --- |
| 미검수/비공개 public 노출 | 공개 중단·visibility guard 점검 |
| 관리자 정보 public 노출 | 접근 차단·rollback 검토 |
| 권한 우회 | route 제한·Auth/RBAC 검수 |
| 개인정보·민감정보 저장 위험 | 기능 중단·저장 경로 검토 |
| secret/token/env 노출 | 노출 차단·rotation 검토 |
| 운영 DB 직접 영향 | 즉시 중단·변경 범위 확인 |
| AA allowlist 우회 | AI disable 검토 |
| 보험금 지급 확정 문구 | 즉시 문구 수정 |
| destructive bulk 오작동 | 중단·rollback 확인 |
