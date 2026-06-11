# PR-BS-06 Planner Favorites

## 1. 목적

설계사 업무 효율을 위해 보험사·청구서류·지식·업무 도구 등 **업무 단위 바로가기**를 즐겨찾기·최근 사용으로 빠르게 다시 열 수 있도록, 기존 PR-135 client-only 구조 위에 **planner 세션 게이트·PII 차단·public 노출 방지**를 보강한다.

## 2. 이번 PR의 범위

- 기존 `lib/planner-favorites/*`, PR-135 홈 패널·토글 재사용
- `getWorkToolsAccess()` 기반 planner 즐겨찾기 UI 게이트 (Auth/RBAC 구조 변경 없음)
- public 페이지: 즐겨찾기 **목록·최근 사용 미노출**, 토글은 **로그인 유도**만
- PII 가드·최근 사용 sanitize (`lib/planner-favorites/pii-guard.ts`, `recent-work.ts`)
- 고객정보 저장 금지 안내 문구
- 정적 테스트·본 문서

## 3. 이번 PR에서 하지 않는 것

- DB/Prisma schema·migration·seed
- 서버 즐겨찾기 동기화 (PR-135-B)
- 검색어 즐겨찾기
- Answer Assistant 대화 즐겨찾기
- work_link / disclosure_link 즐겨찾기
- Auth/RBAC·allowlist 변경
- package.json / lockfile 변경

## 4. 즐겨찾기 허용 대상

| 대상 | 허용 | 조건 |
| --- | --- | --- |
| 보험사 | O | 공개 카탈로그 id만 |
| 청구서류 | O | 검수·공개 항목, id prefix |
| 지식 아카이브 | O | published 글 id |
| 업무 도구 | O | planner 세션 + `/work-tools` |
| 업무 링크(work_link) | X | PR-135 보류 유지 |
| 검색 필터/키워드 | X | raw query 저장 금지 |
| 고객지원/오류제보 | X | 즐겨찾기 대상 아님 |

## 5. 즐겨찾기 금지 대상

고객명·주민번호·연락처·주소·계약번호·증권번호·병력·진단명·상담 원문·고객별 메모·가족정보·계좌·결제정보·의료 이미지·Answer Assistant prompt/response·usage audit·admin memo·secret/token/API key.

## 6. 저장 데이터 최소화 원칙

- localStorage에는 **id·type·내부 href·카탈로그 label** 수준만 (free-text 메모 없음)
- 최근 사용: 허용 type + 내부 경로만, PII label 차단
- 표시 시 공개 카탈로그와 교집합 (`filterFavoriteIdsToCatalog`)

## 7. Public / Planner / Admin 노출 기준

| 정보 | Public | Planner | Admin |
| --- | --- | --- | --- |
| 즐겨찾기 버튼 | 로그인 유도 | 저장/해제 | 동일 |
| 즐겨찾기 목록 | 금지 | 홈·strip | 운영 데이터 별도 |
| 최근 사용 | 금지 | 홈 (세션 시) | 제한 |
| Work Tools 즐겨찾기 | 금지 | work-tools | — |

## 8. 최근 사용 업무 기준

- 허용: 보험사·청구·지식·도구·안내문·내부 shortcut 링크 방문
- 금지: 상담 원문·고객 식별·AA 입출력·admin-only·임의 외부 URL

## 9. PII 차단 기준

`containsProhibitedFavoriteText`, `sanitizeRecentWorkItems`, UI 금지 문구 (`PLANNER_FAVORITES_FORBIDDEN_UI_PHRASES`).

## 10. 테스트 기준

- `tests/ops/planner-favorites-access.test.ts` — planner access helper·페이지 게이트
- `tests/public/planner-favorites-public-guard.test.ts` — public 목록 미노출·로그인 유도
- `tests/ops/planner-favorites-pii.test.ts` — PII·AA 타입 차단
- 기존 `tests/ops/pr135-planner-favorites.test.ts` 유지

## 11. No-Go 기준

- public에 사용자별 즐겨찾기 목록 노출
- 고객정보 localStorage 저장
- schema migration
- Auth/RBAC 약화

## 12. 후속 PR 후보

- PR-135-B: 서버 즐겨찾기·동기화
- 검색어 즐겨찾기 (안전 키워드 화이트리스트 설계 후)
- disclosure/work_link 즐겨찾기 (공식 출처 검수 연동)

## 13. 최종 결론

PR-BS-06은 **기존 client-only 즐겨찾기를 planner 세션 뒤로 제한**하고, **PII·public 노출 가드**를 코드·문서·테스트로 고정한다. 서버 저장·동기화는 후속 PR로 분리한다.
