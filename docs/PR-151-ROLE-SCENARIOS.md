# PR-151 — 역할별 Dry-Run 시나리오

`ROLE_DRY_RUN_SCENARIOS` (`lib/ops/external-beta-dry-run.ts`) 기준.

| 시나리오 | 사용자 상태 | 기대 | 실패 기준 |
| --- | --- | --- | --- |
| public 공개 조회 | 로그인 없음 | 공개 정보만 | admin/planner/AI/운영 데이터 |
| public → admin | 로그인 없음 | 차단 | admin 화면 |
| public → planner | 로그인 없음 | 차단 | planner 전용 |
| planner 공개 조회 | 일반 설계사 | 허용 범위 | 관리자 정보 |
| planner → AA | 일반 설계사 | 차단 | AI 허용 |
| verified, no allowlist | verified | 차단 | allowlist 없이 AA |
| verified + allowlist | verified+allowlist | 제한 사용 | PII·원문 저장 |
| content_admin | content_admin | 콘텐츠 범위 | super_admin 기능 |
| content_admin bulk | content_admin | 제한 | destructive bulk |
| super_admin | super_admin | admin 전체 | secret·운영 DB 노출 |
| beta user(가정) | 제한 베타 | 공개 기능만 | AI 자동·admin |

**권한 실변경 없음** — 기대값은 코드·문서 정적 검증.
