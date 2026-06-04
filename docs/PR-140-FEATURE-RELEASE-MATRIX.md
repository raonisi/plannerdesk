# PR-140 — 기능 공개 판단표

**코드 스냅샷:** `lib/ops/external-release-readiness.ts` · **변경 없음**

| 기능 | 외부 공개 | 유료화 | 근거 |
| --- | --- | --- | --- |
| 보험사 디렉터리 | Conditional Go | Conditional Go | visibility·PR122·PR124 |
| 청구서류 | Conditional Go | No-Go | 출처·검수·오류 High |
| 지식 아카이브 | Conditional Go | Conditional Go | PR125·미검수 차단 |
| 업무 링크/전산 | Conditional Go | 해당 없음 | PR134 수동 |
| 고급 통합 검색 | Conditional Go | Conditional Go | PR132 분리 |
| 통합 대시보드 | Conditional Go | Conditional Go | PR131 분리 |
| 즐겨찾기 | Go | 해당 없음 | PR135 localStorage |
| 관리자 기능 | No-Go | No-Go | admin only |
| 운영 리포트/리마인더 | No-Go | No-Go | PR136·138 |
| Answer Assistant | Conditional Go (제한 베타) | No-Go | PR137 allowlist |
| Admin bulk | No-Go | No-Go | PR123·PR139 |

**Conditional Go 공통 조건:** Critical 0 · 미검수 public 없음 · 운영 Registry·smoke 게이트.
