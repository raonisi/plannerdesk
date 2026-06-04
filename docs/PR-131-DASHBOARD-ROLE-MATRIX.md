# PR-131 — 대시보드 역할별 표시

| 사용자 유형 | 목적 | 표시 가능 | 표시 금지 |
| --- | --- | --- | --- |
| public user | 공개 정보 탐색 | 공개 보험사·청구·지식·링크·통합검색·공개 건수 | 검수 대기, 운영 이슈, admin 통계, draft |
| planner user | 업무 빠른 진입 | 위 + 업무 도구·AA 베타 안내(게이트는 서버) | allowlist 외 AI, admin 카드 |
| content_admin | 검수·등록 보조 | admin 큐·기능 카드 | secret, env, DB 경로 |
| super_admin | 전체 운영 | 운영 요약·일괄 작업 링크(실행은 목록 화면) | secret 값, 운영 DB 직접 정보 |

**원칙**: UI 숨김만으로 권한 대체하지 않음. 서버 `getAdminAccess`·public fetch guard 유지.
