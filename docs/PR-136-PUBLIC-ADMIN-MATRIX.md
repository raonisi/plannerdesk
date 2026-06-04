# PR-136 — public / planner / admin 표시 기준

| 정보 | public | planner | admin |
| --- | --- | --- | --- |
| 공개 보험사·청구·지식·링크 | ○ | ○ | ○ |
| 검수 대기 | ✕ | ✕ | ○ |
| 확인 필요 (내부) | ✕ 또는 제한 안내 | 제한 안내 | ○ |
| 수정 필요·운영 이슈 | ✕ | ✕ | ○ |
| 변경 이력 상세 | ✕ | ✕ | ○ (메타데이터) |
| Admin bulk 상태 | ✕ | ✕ | ○ |
| 운영 리포트 본문 | ✕ | ✕ | ○ (수동·문서) |
| Answer Assistant 운영 상태 | ✕ | 베타 안내만 | 허용 사용자·운영자 |

**검증:** `getPublic*` · `PUBLIC_*_WHERE` · `getAdminAccess` — PR136에서 **변경 없음**.

## PR135 즐겨찾기

client-only id만 저장. 관리자 큐·이슈는 즐겨찾기 대상 **아님**.
