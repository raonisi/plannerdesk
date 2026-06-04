# PR-129 — 기존 운영 이슈 관리 구조 분석

## 기존 운영 이슈 관리 구조 분석

| 영역 | 구조 | PR129 연계 |
| --- | --- | --- |
| **사용자 피드백** | PR121 `FB-*` Registry, 유형·심각도·라우팅 | High+ 또는 운영 장애 시 **OPS-* 승격** |
| **데이터 최신성** | PR122 점검 루틴·체크리스트 | 데이터 이슈 → OPS + PR122/124 |
| **관리자 운영** | PR123 매뉴얼·실수 방지 | 관리자 UX 이슈 → OPS + PR123 |
| **보험사/청구서류** | PR124 보완·fixture 최소 수정 | 데이터 오류 → OPS + PR124 |
| **지식 아카이브** | PR125 seed 품질·visibility | 콘텐츠·검색 → OPS + PR125 |
| **Answer Assistant** | PR126 베타 관찰·AA 전용 feedback | AI safety → OPS + PR126 (AA feedback과 분리) |
| **검색·탐색** | PR127 UX·빈 상태 | 검색 이슈 → OPS + PR127 |
| **업무 링크** | PR128 그룹·문구·fixture 미수정 | 링크 이슈 → OPS + PR128 |
| **권한/public visibility** | `lib/public/*`, admin RBAC 문서 | **Critical~High 고정** |
| **배포/smoke** | PR114~120, OPERATING_QA_CHECKLIST | 배포 이슈 → OPS + 게이트 PR |

## 정보 부족 항목

- production 이슈 원문·SLA 담당자 명단
- 외부 이슈 트래커(GitHub Issues)와 OPS ID 동기 정책
- 월간 리포트 자동 집계 (PR130에서 정리 예정)
