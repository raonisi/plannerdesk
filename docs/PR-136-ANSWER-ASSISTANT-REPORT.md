# PR-136 — Answer Assistant 베타 리포트 기준

**연계:** [PR-126-ANSWER-ASSISTANT-BETA-OPS.md](./PR-126-ANSWER-ASSISTANT-BETA-OPS.md) · [PR-130-ANSWER-ASSISTANT-JUDGMENT.md](./PR-130-ANSWER-ASSISTANT-JUDGMENT.md)

| 항목 | 정상 기준 | 실패 기준 |
| --- | --- | --- |
| verified planner | 인증·검증된 설계사만 | 미인증 접근 |
| allowlist | 수동 제한 유지 | 자동 확대·우회 |
| output safety | 위험 답변 차단 | 보험금 확정·가입 유도 |
| usage audit | metadata-only | 상담 원문·고객정보 |
| rate limit | 정책 유지 | 완화·우회 |
| retention | 문서 기준 유지 | 불명확·완화 |
| rollback | 중단 기준 있음 | 기준 없음 |

## PR136 금지

- allowlist 변경
- gate·RBAC 확대
- audit에 원문 필드 추가
- 리포트에 usage 원문 붙여넣기

## 관찰 기록

런타임 관찰은 PR126·PR130 양식에 수동 기입. 자동 수치 집계는 **PR136-B** 이후 검토.

## PR137 제한 고도화 연계

- [PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md](./PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md)
- [PR-137-ROLLBACK-DISABLE.md](./PR-137-ROLLBACK-DISABLE.md)
