# PR-146 — 베타 신청 상태값

문서 기준 enum — **Prisma/schema 추가 금지**.

| 상태 | 의미 |
| --- | --- |
| draft | 내부 준비, 외부 노출 금지 |
| received | 접수 가정(기능 없음) |
| needs_review | 수동 검토 |
| needs_more_info | 민감정보 추가 요청 금지 |
| approved_pending_access | 승인 전 visibility·권한 확인 |
| approved_limited | 제한 베타 허용 |
| rejected | 기준 미충족, 사유 최소화 |
| paused | 운영 리스크 보류 |
| revoked | 접근 해제 |
| closed | 종료·기록 |

자동 상태 알림 발송 없음.
