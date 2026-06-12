# PR-BS-14 Work Link Admin Review Draft UI

## 1. 목적

보험사 업무 링크(전산·청구·고객센터·팩스·납입 등)를 **public에 노출하기 전** Admin에서 검수·분류할 수 있는 **초안 UI**를 제공한다. mock/draft 후보만 표시하며 DB schema·대량 데이터 입력·public 노출은 포함하지 않는다.

선행: [PR-BS-04 Official Work Link Review](./PR-BS-04-OFFICIAL-WORK-LINK-REVIEW.md), [PR-BS-13 Planner Favorites](./PR-BS-13-PLANNER-FAVORITES.md)

## 2. 범위

| 포함 | 제외 |
| --- | --- |
| `/admin/work-links` 검수 초안 UI | 실제 보험사 링크·번호 입력 |
| mock 후보 목록·필터 | DB schema·migration |
| 정보 유형·위험도·검수 상태·공개 범위 표시 | public/planner 노출 |
| Admin-only private note UI | Auth/RBAC 변경 |
| public 미노출 규칙·테스트 | Work Tools guard 변경 |

## 3. 구현 위치

| 경로 | 역할 |
| --- | --- |
| `app/admin/work-links/page.tsx` | Admin route + `getAdminAccess` |
| `components/admin/work-links/WorkLinkReviewDraftPanel.tsx` | 테이블·필터·안내 |
| `lib/work-links/review-types.ts` | 타입·enum |
| `lib/work-links/review-rules.ts` | public 후보 판정·projection |
| `lib/work-links/review-mock-candidates.ts` | fictional mock only |
| `lib/work-links/review-copy.ts` | 허용·금지 문구 |

## 4. 검수 상태 · 공개 범위

- `reviewStatus`: draft, needs_review, verified, published, stale, retired, rejected
- `visibilityScope` 기본값: **admin**
- public publish 후보: `published`/`verified` + `officialSourceUrl` + `visibilityScope: public` (BS-14 UI는 노출하지 않음)

## 5. High-risk 유형

customerCenter, fax, paymentInfo, insurerSystem, claimGuide, claimDocument → High (기본)

## 6. 테스트

- `tests/admin/work-link-review-ui.test.ts`
- `tests/ops/work-link-public-visibility.test.ts`
- `tests/public/work-link-admin-fields.test.ts`

## 7. 후속

- **PR-BS-15**: 검수 완료 데이터 public/planner projection (별도 PR)

## 8. 최종 결론

PR-BS-14는 Admin 검수 workflow **UI 초안**과 **mock 거버넌스 규칙**을 코드·테스트·문서로 고정한다. 실제 데이터 반영은 후속 PR에서 공식 출처 검수 후 진행한다.
