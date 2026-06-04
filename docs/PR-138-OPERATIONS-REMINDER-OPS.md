# PR-138 — 운영 알림·리마인더 (수동 · PR138-A)

**위험도:** High · **성격:** 문서·관리자 안내 — **자동 발송·스케줄러·notification table 없음**

## 목적

운영자가 검수 대기·확인 필요·링크 점검·운영 이슈·월간 리포트·Answer Assistant 제한 운영을 **놓치지 않도록** 수동 리마인더 기준·체크리스트·admin 패널을 제공한다.

## 범위 (PR138-A)

| 항목 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 대상·심각도 | [PR-138-REMINDER-TARGETS.md](./PR-138-REMINDER-TARGETS.md) · [PR-138-REMINDER-SEVERITY.md](./PR-138-REMINDER-SEVERITY.md) |
| 상태값 | [PR-138-REMINDER-STATUS-VALUES.md](./PR-138-REMINDER-STATUS-VALUES.md) |
| 표시 분리 | [PR-138-REMINDER-DISPLAY-MATRIX.md](./PR-138-REMINDER-DISPLAY-MATRIX.md) |
| 유형별 | [PR-138-REMINDER-TYPE-CRITERIA.md](./PR-138-REMINDER-TYPE-CRITERIA.md) |
| 자동화 보류 | [PR-138-AUTOMATION-DEFERRAL.md](./PR-138-AUTOMATION-DEFERRAL.md) |
| UI | `AdminOperationsReminderPanel` — `/admin` only |
| 코드 | `lib/admin/operations-reminder-copy.ts` |

## 비범위 (별도 PR)

- 이메일·SMS·카카오·Slack·webhook · cron · queue · [PR-138-B-NOTIFICATION-AUTOMATION-DESIGN.md](./PR-138-B-NOTIFICATION-AUTOMATION-DESIGN.md)

## 연계

- [PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md](./PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md)
- [PR-136-ADMIN-OPS-REPORT-OPS.md](./PR-136-ADMIN-OPS-REPORT-OPS.md)
- [PR-134-LINK-STATUS-OPS.md](./PR-134-LINK-STATUS-OPS.md)
- [PR-129-OPERATIONAL-ISSUES-OPS.md](./PR-129-OPERATIONAL-ISSUES-OPS.md)
- [PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md](./PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md)
- [PR-139-ROLE-ACCESS-OPS.md](./PR-139-ROLE-ACCESS-OPS.md) — 역할별 접근 기준

## Codex

자동화·외부 발송·DB 없으면 **생략 가능**. PR138-B 착수 시 **제한검수**.
