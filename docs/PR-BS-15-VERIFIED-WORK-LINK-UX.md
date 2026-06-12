# PR-BS-15 Verified Work Link Public/Planner UX

## 1. 목적

PR-BS-14 Admin 검수 초안 위에, **검수 완료된 업무 링크만** public/planner에 제한 노출한다. mock/fixture 기반이며 DB schema 변경 없음.

선행: [PR-BS-14 Work Link Admin Review Draft UI](./PR-BS-14-WORK-LINK-ADMIN-REVIEW.md)

## 2. 노출 조건

### Public

- `reviewStatus === published`
- `visibilityScope === public`
- `officialSourceUrl` + `lastVerifiedAt` 필수
- `draft`, `needs_review`, `stale`, `retired`, `rejected` 제외
- `paymentInfo`, `insurerSystem` public 차단

### Planner

- `reviewStatus` in `verified`, `published`
- `visibilityScope` in `planner`, `public`
- `officialSourceUrl` + `lastVerifiedAt` 필수
- admin-only 필드 projection 제외

## 3. 구현 위치

| 경로 | 역할 |
| --- | --- |
| `lib/work-links/verified-projection.ts` | visibility + projection |
| `lib/work-links/verified-catalog.ts` | public/planner lists |
| `lib/work-links/verified-fixtures.ts` | fictional display fixtures |
| `components/work-links/VerifiedWorkLinkCard.tsx` | 카드 UI |
| `components/work-links/VerifiedWorkLinksSection.tsx` | 섹션 UI |
| `app/directory/page.tsx` | public 섹션 |
| `app/search/page.tsx` | 검색 보조 섹션 |
| `app/claim-documents/page.tsx` | 청구 유형 필터 |
| `app/page.tsx` + `home-client.tsx` | planner 섹션 |

## 4. 테스트

- `tests/ops/verified-work-links-projection.test.ts`
- `tests/public/verified-work-links-public.test.ts`

## 5. 후속

- 실제 DB 연동·운영 데이터 반영 (별도 PR, 공식 출처 검수 후)

## 6. 최종 결론

PR-BS-15는 **검수 완료 업무 링크의 public/planner safe projection과 보수적 UI**를 코드·테스트·문서로 고정한다.
