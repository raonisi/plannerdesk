# PR-138 — 자동화 별도 PR 분리

| 후보 | 분리 사유 |
| --- | --- |
| 이메일 | 발송·수신 동의·PII |
| SMS/카카오 | 비용·PII |
| Slack/webhook | secret·외부 연동 |
| cron/scheduler | 중복·장애 |
| notification table | migration·권한 |
| 사용자별 알림 설정 | Auth·PII |
| 자동 링크 점검 | HTTP·오탐 |
| AA 자동 알림 | audit·민감정보 |

설계만: [PR-138-B-NOTIFICATION-AUTOMATION-DESIGN.md](./PR-138-B-NOTIFICATION-AUTOMATION-DESIGN.md)
