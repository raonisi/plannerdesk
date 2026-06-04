# PR-140 — 외부 공개 준비 체크리스트

| 항목 | 기준 | PR140 상태 | 근거 |
| --- | --- | --- | --- |
| public visibility | 미검수/비공개 미노출 | 충족 | getPublic* · tests/public |
| 권한/RBAC | public/planner/admin 분리 | 충족 | PR139 |
| 데이터 품질 | PR122·124·134 | 부분 | production 전건 미완 |
| 문구 안정성 | 지급 확정·가입 유도 없음 | 충족 | PR125·AA safety |
| 링크 신뢰도 | 확인 필요≠정상 | 부분 | 수동 Registry |
| 모바일 | 주요 화면 | 부분 | class smoke; 실기기 gap |
| 오류/빈 상태 | 내부 정보 미노출 | 충족 | PR127 |
| 관리자 정보 | 이슈·이력·bulk 미노출 | 충족 | PR131~139 |
| Answer Assistant | 확대 없음 | 충족 | PR137 |
| 개인정보 | 수집 유도 없음 | 충족 | 신규 폼 없음 |
| 운영 프로세스 | 이슈·월간·리마인더 | 충족 | PR129·130·138 |
| 배포 검증 | lint/typecheck/test/build | 충족 | PR105 |
| 런타임 smoke | PR117 HTTP | **미충족** | G1 운영자 |

**미충족 1건 이상 + Critical 운영 이슈 → 외부 공개 No-Go.**
