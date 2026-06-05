# PR-148 — 금지 입력

문서·운영 기준만 정리. **입력 검증 로직 변경은 PR148-C 후보.**

| 유형 | 처리 |
| --- | --- |
| 고객명·주민번호·연락처·주소 | 금지 |
| 계약번호·증권번호 | 금지 |
| 병력·진단·검사·의무기록 원문 | 금지 |
| 상담·카카오 원문 전체 | 금지 |
| secret/token/env | 금지 |

허용 방향: 비식별 요약, 공식자료 기반 문구 정리, 확인 기준 질문.

기존 안내: `VERIFIED_ANSWER_ASSIST_PAGE_NOTICES.sensitiveInput` in `constants.ts`.
