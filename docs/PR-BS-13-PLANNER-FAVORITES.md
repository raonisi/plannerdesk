# PR-BS-13 Planner Favorites Limited Implementation

## 1. 목적

PR-BS-06에서 도입한 client-only 즐겨찾기·최근 사용 업무 UX 위에, **저장 범위·href·label 안전 helper·UX 문구·테스트**를 PR-BS-13 기준으로 보강한다. DB schema 변경 없이 planner-only 경계를 유지한다.

## 2. PR-BS-06 대비 추가 범위

- `lib/planner-favorites/favorite-safety.ts` — `isUnsafeFavoriteHref`, `isSensitiveFavoriteLabel`, `isPlannerFavoriteAllowed`, `sanitizePlannerFavorite`
- `recent-work.ts` — href 차단을 `favorite-safety`에 위임 (`/admin`, Answer Assistant, 민감 query)
- `copy.ts` / `pii-guard.ts` — BS-13 빈 상태·PII 안내·금지 UI 문구
- 테스트: `planner-favorites-safety.test.ts`, `planner-favorites-storage.test.ts`, public guard PR-BS-13 섹션
- 본 문서

## 3. 저장 가능 데이터 (업무 shortcut 메타)

| 필드 | 허용 |
| --- | --- |
| type | 허용 type만 (insurer, claim, knowledge, tool 등) |
| targetId | 카탈로그 id |
| href | 내부 허용 경로, PII query 없음 |
| label | 카탈로그 label, PII 패턴 없음 |
| category / sourceArea | 선택 |

localStorage key는 PR-135·BS-06 기존 키 유지 (`plannerdesk:favoriteInsurers` 등). BS-13 후보 키(`plannerdesk.plannerFavorites.v1`)는 마이그레이션 없이 후속 PR에서 검토.

## 4. 저장 금지

고객명·주민번호·연락처·주소·계약번호·증권번호·병력·진단명·상담 원문·AA prompt/response·admin memo·secret/token/API key. `PLANNER_FAVORITES_FORBIDDEN_STORAGE_FIELDS` 참조.

## 5. 경로 차단

- `/admin`, `/planner/answer-assistant`, `/answer-assistant`
- query: `contract`, `policy`, `customer`, `phone`, `resident`, `diagnosis`, `consultation` 등
- 외부 URL·임의 내부 경로

## 6. Public / Planner / Admin

| 기능 | Public | Planner |
| --- | --- | --- |
| 즐겨찾기 버튼 | 로그인 유도만 | 저장/해제 |
| 즐겨찾기 목록 | 미노출 | 홈·strip |
| 최근 사용 | 미노출 | 홈 (세션) |
| Work Tools 즐겨찾기 | 미노출 | work-tools (guard) |

## 7. 테스트

- `tests/ops/planner-favorites-safety.test.ts`
- `tests/ops/planner-favorites-storage.test.ts`
- `tests/public/planner-favorites-public-guard.test.ts` (PR-BS-13)
- 기존 `planner-favorites-pii.test.ts`, `planner-favorites-access.test.ts` 유지

## 8. 후속 PR

- 서버 동기화 (PR-135-B)
- storage key v1 통합·마이그레이션 (필요 시)
- disclosure/work_link 즐겨찾기

## 9. 관련 문서

- [PR-BS-06 Planner Favorites](./PR-BS-06-PLANNER-FAVORITES.md)
- [PR-BS-12 Correction Flow PII Guard](./PR-BS-12-CORRECTION-FLOW-PII-GUARD.md)

## 10. 최종 결론

PR-BS-13은 **기존 client-only 즐겨찾기를 더 좁은 저장 범위와 명시적 safety helper로 고정**한다. schema·Auth·public visibility guard 변경 없음.
