# PR-110 — Public Route Smoke 확장

**목적:** 공개 사용자 화면 회귀 방지. 기능 추가·UI 대개편·DB/auth 변경 없음.

## Public route 맵

| Route | Page | Public data |
| --- | --- | --- |
| `/` | `app/page.tsx` | `getPublicInsurers`, `getPublicClaimDocuments` |
| `/directory` | `app/directory/page.tsx` | 동일 + `DirectoryExplorer` |
| `/claim-documents` | `app/claim-documents/page.tsx` | `getPublicClaimDocuments` |
| `/knowledge` | `app/knowledge/page.tsx` | `getPublicKnowledgeArticles` |
| `/knowledge/[slug]` | `app/knowledge/[slug]/page.tsx` | public detail select |
| `/search` | `app/search/page.tsx` | `searchPublicContent` (canonical WHERE) |
| `/disclosure-links` | `app/disclosure-links/page.tsx` | `PUBLIC_DISCLOSURE_LINK_WHERE` |
| `/message-templates` | `app/message-templates/page.tsx` | `PUBLIC_MESSAGE_TEMPLATE_WHERE` |
| `/community` | `app/community/page.tsx` | published posts only (viewer optional) |

**비공개:** `/admin/*`, `/planner/answer-assistant` — smoke 대상 아님.

**보험사 상세:** 별도 `/directory/[id]` 없음. 카드·청구 안내는 디렉터리 UI 내.

## Public visibility (canonical)

| Domain | Guard |
| --- | --- |
| Insurer / ClaimDocument | `isPublished` + `verificationStatus ∈ {verified, needs_review}` |
| Knowledge | `PUBLIC_KNOWLEDGE_WHERE` |
| Disclosure | `published` + `reviewedAt` |
| Message template | `published` + `reviewedAt` + `!isInternalOnly` + `safeCopy` |
| Search | 위 WHERE 재사용 (`lib/search/public.ts`) |

## PR110 Smoke Test 시나리오

| # | 시나리오 | 검증 |
| --- | --- | --- |
| 1 | 랜딩/홈 | `app/page.tsx` + smoke `/` |
| 2 | 보험사 디렉터리 | `/directory` + visibility tests |
| 3 | 청구안내(카드) | directory explorer (no separate detail route) |
| 4 | 청구서류 | `/claim-documents` |
| 5 | 지식 아카이브 | `/knowledge`, slug 404 |
| 6 | 검색 | `/search`, `/search?q=test` |
| 7 | 공시/약관 | `/disclosure-links` |
| 8 | 고객문구 | `/message-templates` |
| 9 | 미검수/비공개 미노출 | `tests/public/public-visibility.test.ts` |
| 10 | not-found | smoke 404 slug |
| 11 | 모바일 기본 | `AppShell` / `PageFrame` in route tests |
| 12 | admin public 노출 방지 | smoke script excludes `/admin` |

## 검증 명령

### CI-safe (no running server, no DB required)

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/public/*.test.ts
npm run build
```

`npm run test`는 `tests/answer-assistant/*.test.ts`만 실행 (`package.json` 미변경).

### Runtime smoke (server 필요)

```bash
npm run start
# 다른 셸:
npm run smoke:public
# 또는 BASE_URL=http://localhost:3001 npm run smoke:public
```

## 운영자 수동 체크리스트

- [ ] smoke 8+ routes 200 (또는 문서화된 404)
- [ ] directory에 draft 보험사 미표시 (DB 연결 시)
- [ ] knowledge slug 없음 → 404
- [ ] `/admin` 비로그인 redirect/lock
- [ ] 검색 빈 쿼리 idle UI, 금지 문구 없음

## Antigravity 검수

- visibility guard 약화 없음
- smoke 범위에 directory / claim / knowledge / search 포함
- 테스트·smoke가 운영 DB를 **요구하지 않음** (unit tests); runtime smoke는 로컬/staging 서버만

## Codex

기본 생략. public visibility 로직 변경 시에만 제한검수 후보.
