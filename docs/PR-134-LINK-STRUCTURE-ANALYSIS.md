# PR-134 — 링크 구조 분석

## public routes

| Route | 링크 표시 |
| --- | --- |
| `/directory` | `InsurerActionCard` + `InsurerPrimaryWorkLinks` |
| `/claim-documents` | 청구 URL·안내 (별도 모델) |
| `/disclosure-links` | 공시 링크 |
| `/search` | work_link hits (PR132) |

## 상태 (DB)

- Insurer: `verificationStatus`, `isPublished`, URL 필드
- Disclosure: `status`, `isPublished`
- **전용 `linkStatus` 컬럼 없음** → PR134-B 후보

## public UI (PR128 + PR134)

- `disclosureLinkStatus`: available / partial / missing
- `WORK_LINK_COPY.missing` — 정상 단정 없음
- `publicContentTrustHint` — needs_review 안내
- `PublicLinkCheckNotice` — 수동 점검 안내

## admin

- `/admin/insurers/[id]/edit` — `AdminLinkCheckGuidePanel`
- bulk — PR107 정책, 이력 테이블 없음

## visibility

- `getPublicInsurers` + `PUBLIC_VERIFICATION_STATUSES` — **미변경**

## 정보 부족

- 보험사별 마지막 수동 점검일 (DB 필드 없음 — 점검표 수기)
