# PR-138-B — Notification Automation (설계만 · High-risk)

**상태:** 보류

## 분리 사유

이메일·푸시·cron·notification 테이블은 migration, Auth, PII, 운영 장애 영향.

## PR138-A 제공

- `AdminOperationsReminderPanel` 수동 체크리스트
- 심각도·상태값·유형별 문서
- 기존 `reviewQueue` 스냅샷 참고 숫자 (발송 없음)

## PR138-B 착수 전

1. 수신 채널·동의·옵트아웃
2. payload에 PII 금지 스키마
3. admin-only delivery
4. 실패·중복·재시도 정책
5. AA·visibility와 분리

Codex: security-auditor, gdpr-ccpa-compliance, reviewer — **필수**
