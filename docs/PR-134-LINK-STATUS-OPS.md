# PR-134 — 링크 상태 점검 체계 (수동 · read-only)

**위험도:** Medium~High · **자동화:** **금지** (이번 PR)

## 목적

보험사별 전산·청구안내·홈페이지·공시·헬프데스크 링크를 운영자가 **수동**으로 분류·점검하고, 데이터 수정은 **별도 PR**로 이관한다.

## 범위 (PR134-A)

| 항목 | 내용 |
| --- | --- |
| 상태값·유형·주기 | [PR-134-LINK-STATUS-VALUES.md](./PR-134-LINK-STATUS-VALUES.md) |
| 수동 절차 | [PR-134-MANUAL-CHECK-PROCEDURE.md](./PR-134-MANUAL-CHECK-PROCEDURE.md) |
| 점검표 | [PR-134-LINK-CHECK-SHEET.md](./PR-134-LINK-CHECK-SHEET.md) |
| public 문구 | [PR-134-PUBLIC-COPY-GUIDELINES.md](./PR-134-PUBLIC-COPY-GUIDELINES.md) |
| 코드 | `lib/directory/link-check-status.ts`, UI 안내 |
| 금지 | HTTP 크롤, 대량 요청, schema migration |

## 비범위 (별도 PR)

- 자동 HEAD/GET 링크 검사
- DB `linkStatus` 필드
- 운영 데이터 URL 일괄 수정

## 관련

- [PR-128-WORK-LINKS-OPS.md](./PR-128-WORK-LINKS-OPS.md)
- [PR-122-DATA-FRESHNESS-OPS.md](./PR-122-DATA-FRESHNESS-OPS.md)
- [PR-133-CHANGE-HISTORY-OPS.md](./PR-133-CHANGE-HISTORY-OPS.md)
- [PR-129-OPERATIONAL-ISSUES-OPS.md](./PR-129-OPERATIONAL-ISSUES-OPS.md)

## Codex

외부 요청·visibility·migration 없으면 생략 가능. 자동화 PR 착수 시 **제한검수**.
