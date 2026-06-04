# PR-128 — 업무 링크 구조 분석

## 업무 링크 구조 분석

| 영역 | 구조 |
| --- | --- |
| **보험사 public route** | `/directory` — `getPublicInsurers`, `DirectoryExplorer`, `InsurerActionCard` |
| **보험사 상세/청구안내** | 카드 내 `InsurerQuickClaimActions` + 아코디언 청구 섹션; `/claim-documents?insurer=` |
| **업무 링크 컴포넌트** | `InsurerPrimaryWorkLinks`, `InsurerQuickClaimActions`, `major-work-links` |
| **전산 바로가기** | `systemUrl` / `plannerPortalUrl` — `resolveSystemLinks`, 접근 안내 |
| **청구안내 링크** | `claimPageUrl` 외부 링크 또는 아코디언 패널 |
| **홈페이지/앱/공시** | `officialWebsiteUrl`, `termsUrl`, `getDisclosureLinksForInsurer` |
| **헬프데스크** | `helpdeskPhone`, `customerCenterPhone` — `tel:` |
| **public fetch** | `lib/public/insurers.ts` — `PUBLIC_VERIFICATION_STATUSES` |
| **public visibility guard** | `isInsurerPubliclyVisible` / `isPublishedContentPubliclyVisible` |
| **링크 상태값** | Prisma `VerificationStatus` + `isPublished`; public은 `publicContentTrustHint`만 |
| **seed/fixture** | `lib/content/insurers.ts` (49건) — **PR128에서 URL 미수정** |

## 정보 부족

- 운영 DB per-insurer 링크 최신성
- 실기기 모바일 카드 레이아웃 스크린
