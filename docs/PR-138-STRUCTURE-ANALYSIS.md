# PR-138 — 기존 알림/리마인더 구조 분석

| 항목 | 결과 |
| --- | --- |
| notification/reminder model | **없음** (Prisma) |
| cron/queue/scheduler 앱 코드 | **없음** |
| 외부 발송 연동 | **없음** (next-auth optional nodemailer in lockfile only) |
| admin dashboard | `/admin` + review queue + PR136 report + **PR138 reminder panel** |
| package.json 변경 | **없음** |

기존 활용: `buildAdminDashboardSnapshot` · PR129/134/136/137 문서.
