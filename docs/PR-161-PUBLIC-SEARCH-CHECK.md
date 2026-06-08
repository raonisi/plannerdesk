# PR-161 — Public Search 점검

| 항목 | 기준 | 등급 |
| --- | --- | --- |
| 공개 데이터만 | PUBLIC_*_WHERE | **Critical** |
| 관리자 데이터 제외 | 운영·bulk 제외 | **Critical** |
| 청구서류 결과 | 공식 확인 고지 | High |
| 지식 결과 | 상담 보조 고지 | High |
| 오래된 데이터 | 최신성 확인 표시 | Medium~High |
| 잘못된 링크 | 보류·수정 후보 | Medium~High |
| 과장 표현 | 금지 | High |
| 고객정보 포함 | 즉시 제거 | **Critical** |

코드 참조: `lib/search/public.ts` · `lib/public/visibility.ts`
