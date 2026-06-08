# PR-157 — 최종 리스크 등급표

## Critical (정적 0 — Launch 차단 없음)

| 리스크 | 상태 | 판단 |
| --- | --- | --- |
| public 비공개 데이터 노출 | 통제(정적) | met |
| admin 권한 우회 | 통제(정적) | met |
| planner public 노출 | 통제 | met |
| Answer Assistant 접근 확대 | 통제 | met |
| AI red-team Critical 실패 | 통제(정적) | met |
| PII·민감정보 저장 | 통제 | met |
| prompt/response 원문 저장 | 통제 | met |
| secret/env/API key 노출 | 통제(문서) | met |
| build CI migrate 자동 실행 | 통제 | met |
| 결제/회원가입 노출 | 통제 | met |

## High (7 — Conditional Launch)

| 리스크 | 상태 | 판단 |
| --- | --- | --- |
| 청구서류 오류 가능성 | 잔존 | 운영 점검 |
| 업무 링크 만료 | 잔존 | PR147 |
| 약관·개인정보 미확정 | 잔존 | PR142 |
| 런타임 smoke/E2E 부재 | gap | PR154·PR155 |
| AA secret classifier partial | partial | PR156·PR148-C |
| content_admin bulk 경계 | 잔존 | PR139 |
| 고객지원 실운영 지연 | 잔존 | PR143 |

## Medium / Low

- 모바일 사용성: Medium, 베타 범위 수용
- 문구 오탈자: Low, 지속 수정

SSOT: `FINAL_LAUNCH_RISKS`
