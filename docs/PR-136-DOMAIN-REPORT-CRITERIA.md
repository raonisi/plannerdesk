# PR-136 — 영역별 운영 리포트 기준

## 보험사 데이터 리포트 기준

| 항목 | 확인 기준 |
| --- | --- |
| 공개 보험사 | `PUBLIC_*` visibility·검수 완료 |
| 비공개 보험사 | public 미노출 유지 |
| 확인 필요 | 공식 출처·연락처·링크 재확인 |
| 중복 후보 | 병합·보류 판단 (PR124 handoff) |
| 수정 필요 | 오탈자·구분·팩스·전산 URL |

**관리:** `/admin/insurers` · [PR-122-DATA-FRESHNESS-OPS.md](./PR-122-DATA-FRESHNESS-OPS.md)

## 청구서류 데이터 리포트 기준

| 항목 | 확인 기준 |
| --- | --- |
| 보험사 연결 | 올바른 insurerId |
| 서류명 | 실무 이해 가능 |
| 상황 구분 | 입원/통원/진단/수술/실손 등 |
| 검수 상태 | published 전 검수 |
| 수정 필요 | 누락·중복·출처 불명 |

**관리:** `/admin/claim-documents`

## 지식 아카이브 리포트 기준

| 항목 | 확인 기준 |
| --- | --- |
| 카테고리·태그 | 검색·분류 적합 |
| 제목/요약 | 실무 즉시 이해 |
| 검수대기·보류 | public 미노출 |
| 문구 | 과장·단정·가입 유도 없음 |

**관리:** `/admin/knowledge` · [PR-125-KNOWLEDGE-QUALITY-OPS.md](./PR-125-KNOWLEDGE-QUALITY-OPS.md)

## 업무 링크 리포트 기준

| 항목 | 확인 기준 |
| --- | --- |
| 전산 | 접근 권한 안내 |
| 청구안내·공시 | 공식 출처 |
| 확인 필요 | 정상 단정 금지 (PR134) |
| 수정 필요 | 별도 데이터 PR |

**관리:** 보험사 편집 · [PR-128-WORK-LINKS-OPS.md](./PR-128-WORK-LINKS-OPS.md) · [PR-134-LINK-STATUS-OPS.md](./PR-134-LINK-STATUS-OPS.md)

## 링크 상태 점검 (PR134)

수동 점검표·상태값만 리포트에 반영. 자동 크롤 결과 **기입 금지**.

## 데이터 변경 이력 (PR133)

| 항목 | 확인 기준 |
| --- | --- |
| 변경 시각 | edit 화면 메타데이터 |
| 검수·게시 | status·published 플래그 |
| PII | 원문·고객정보 기록 금지 |

## Admin bulk

| 항목 | 확인 기준 |
| --- | --- |
| 실행 전 | [PR-123-BULK-OPERATIONS.md](./PR-123-BULK-OPERATIONS.md) |
| QA | [PR-107-ADMIN-BULK-SAFETY-QA.md](./PR-107-ADMIN-BULK-SAFETY-QA.md) |
| 사고 | Critical — 즉시 중단 |
