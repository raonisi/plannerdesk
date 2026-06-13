# Cursor PlannerDesk UI/UX 전수조사 보고서

**조사 일자:** 2026-05-28  
**Git root:** `C:\work\plannerdesk`  
**브랜치:** `main` (HEAD `d460ad9` — PR-BS-31 directory card restore merged)  
**조사 모드:** Read-only (코드·구조 분석, 제품 파일 수정 없음)  
**추가 반영:** 사용자 피드백 — 「보험사 바로가기에서 전산 연결이 가장 중요한데 청구 관련 버튼만 여러 개라 자리를 많이 차지한다」

---

## 1. 최종 요약

| 항목 | 내용 |
|------|------|
| **전체 판정** | **B+ (실무 핵심 흐름은 갖췄으나 /directory 카드 정보 위계·청구 UI 중복이 전산 UX를 약화)** |
| **총점** | **74 / 100** |
| **조사 범위** | `/`, `/directory`, `/claim-documents`, `/admin`, `/admin/claim-documents`, `/work-tools`, `/disclosure-links`, `/message-templates`, navigation, footer, empty/error |

### 가장 큰 문제 5개

1. **【P0】/directory 카드 — 청구·PDF·서류 버튼 과다 + 전산 1개 대비 청구 계열 UI 5~6개**  
   - `InsurerCardDeskActions`(청구·PDF·서류) + `InsurerQuickClaimActions`(청구안내·필요서류) + `InsurerCardClaimDocumentsSection` 토글 + `InsurerCardContactStrip`(팩스·주소)가 카드 기본 접힘 상태에서도 겹침.  
   - 전산은 1버튼·동일 크기인데, 청구는 **기능 중복**(같은 패널/URL로 3회 진입)까지 있음.

2. **【P1】모바일 카드 액션 row — 가로 스크롤 필수, 전산이 시각적으로 묻힘**  
   - `insurerWorkbenchActionScrollRow`: 390px에서 최대 7버튼(전산·청구·PDF·고객센터·팩스·상세·서류). 전산은 1번째이나 청구 3개가 바로 옆에 붙어 스크롤·시선 분산.

3. **【P1】공개 화면 내부 운영 용어 잔존**  
   - `safeCopy`, 「관리자 검수·게시」, 「검수 완료」(`/message-templates`), 「검증 설계사 권한」(`WorkToolsPlannerNoticeCard` on public routes).

4. **【P2】Work-tools 접근성 메시지 IA 불일치**  
   - `/work-tools`는 공개인데 `/directory`·`/claim-documents` 하단 카드는 「검증 설계사 권한」 문구.

5. **【P2】홈 fetch 실패 시 silent degrade**  
   - DB 오류가 빈 통계/0건으로만 보여 사용자가 장애를 인지하기 어려움.

### 가장 먼저 고쳐야 할 PR 3개

| 순위 | PR | 목적 |
|------|-----|------|
| 1 | **PR-DIR-A: 전산 1순위 + 청구 UI 통합** | DeskActions에서 청구·PDF·서류 1그룹으로 축소, QuickClaimActions 제거 또는 상세 내부로 이동 |
| 2 | **PR-DIR-B: 모바일 전산 CTA 강화** | 390px에서 전산 full-width 또는 sticky primary bar, 청구는 「서류·청구」 단일 secondary |
| 3 | **PR-COPY-A: 공개면 내부 용어 제거** | safeCopy/관리자 검수/검수 완료 → 사용자-facing copy로 치환 |

---

## 2. 화면별 점수표

| 화면 | UX | UI | 모바일 | 접근성 | 심의 | 회귀 위험 | 핵심 문제 |
|------|:--:|:--:|:------:|:------:|:----:|:---------:|-----------|
| `/` (홈) | 78 | 80 | 75 | 72 | 85 | 중 | fetch 실패 무음, 정보 과밀 |
| **`/directory`** | **68** | **72** | **65** | **74** | **88** | **중** | **청구 버튼 중복·전산 위계 약함** |
| `/claim-documents` | 82 | 80 | 78 | 76 | 90 | 낮 | fallback 데이터가 empty 가림 |
| `/admin` | 85 | 82 | 78 | 75 | N/A | 낮 | 운영 대시보드 양호, EN 혼용 |
| `/admin/claim-documents` | 86 | 80 | 80 | 78 | N/A | 낮 | governance·pagination 유지 |
| `/work-tools` | 80 | 78 | 76 | 74 | 82 | 중 | 거대 client bundle, Admin 링크 |
| `/disclosure-links` | 79 | 78 | 77 | 76 | 88 | 낮 | error report footer 없음 |
| `/message-templates` | 81 | 79 | 76 | 75 | 80 | 낮 | safeCopy·검수 완료 노출 |
| Navigation | 75 | 78 | 70 | 78 | 90 | 낮 | 모바일 scroll-tab only |
| Footer | 82 | 80 | 78 | 80 | 92 | 낮 | 적절한 liability copy |
| Empty/Error | 70 | 75 | 72 | 74 | 90 | 중 | 「관리자 검수」 empty copy |

---

## 3. /directory 상세 분석

### 3.1 현재 카드 기본 surface 구조 (코드 기준)

`InsurerActionCard` 기본(접힘) 영역:

```
CardHeader (보험사명 + 업권)
  ↓
InsurerCardDeskActions          ← 가로 스크롤 row (최대 7버튼)
  ↓
InsurerQuickClaimActions        ← 2열 grid (청구안내 보기, 필요서류 확인)
  ↓
InsurerCardClaimDocumentsSection ← 접힘 토글 (PDF 목록)
  ↓
InsurerCardContactStrip         ← 팩스·주소 타일
  ↓
InsurerPrimaryWorkLinks (official)
  ↓
「상세 실무 정보」 토글
```

### 3.2 【핵심】전산 vs 청구 버튼 밀도 (사용자 피드백 반영)

| 구분 | 개수 | 컴포넌트 | 실무 중요도 (설계사) |
|------|:----:|----------|---------------------|
| **전산 바로가기** | **1** | `InsurerCardDeskActions` 「전산」 | **최상** |
| 청구안내 | 1~2 | DeskActions 「청구」 + QuickClaim 「청구안내 보기」 | 중 (중복) |
| PDF | 1~2 | DeskActions 「PDF N」 + ClaimDocuments 토글 | 중 (중복) |
| 필요서류/서류 | 2 | DeskActions 「서류」 + QuickClaim 「필요서류 확인」 | 중 (중복) |
| 팩스·주소 | 2 | DeskActions 「팩스」 + ContactStrip | 중 |
| 고객센터 | 1 | DeskActions | 중 |
| 상세 | 1 | DeskActions | 하 |

**문제 요약**

- **전산 1개 vs 청구·서류 계열 최대 6개** — 카드 fold에서 청구가 시각·터치 면적을 압도.
- **동일 목적 3중 진입:**  
  - 「청구」→ claimPageUrl 또는 claimDocuments 패널  
  - 「청구안내 보기」→ 동일 claimPageUrl  
  - 「필요서류 확인 / 서류」→ `/claim-documents?insurer=` 또는 패널
- **모바일:** `overflow-x-auto` row → 전산은 보이나, 바로 옆 청구·PDF·서류가 **동일 visual weight**(accent/emerald vs primary만 차이)로 전산 CTA가 상대적으로 작게 느껴짐.
- **PDF 많은 보험사(삼성화재·현대해상):** DeskActions 「PDF N」+ ClaimDocumentsSection + QuickClaim — **세로 길이 추가 증가**.

### 3.3 기존 카드형 복구 필요 여부

| 항목 | 판정 |
|------|------|
| PR-BS-31 카드 grid 기본값 복구 | ✅ 완료 (`viewMode="grid"`, `InsurerActionCard`) |
| compact list | 보조 뷰로 유지 — 실무 1순위 아님 |
| 카드형 vs compact list | **카드형이 실무 적합** (정보 그룹·즐겨찾기·상세 패널). 단 **액션 위계 재정렬 필요** |

### 3.4 사용자-facing status 문구

| 문구 | 카드 fold 노출 | 비고 |
|------|:-------------:|------|
| 확인일 정보 부족 | ❌ | PR-BS-31 제거됨 |
| 공식 확인 후 업데이트 예정 | ❌ (fold) | `hideMissingSlots`; **상세 패널** 내 `DIRECTORY_TEXT.missing` 잔존 |
| mock/예시 보험사 | ❌ | `/directory` VerifiedWorkLinksSection 제거됨 |
| 검수 완료 업무 링크 | ❌ | |

### 3.5 BohumSchool /desk 참고 가능 요소 (복제 금지)

| 참고 OK | PlannerDesk 적용 제안 |
|---------|----------------------|
| 전산 1순위 단일 primary CTA | 전산 버튼 **크기·색·행 분리**(청구 row와 다른 줄) |
| 액션 4~5개 이내 fold | 청구·PDF·서류 → **「청구·서류」1버튼** + 상세/패널 |
| 카드 내부 여백·그룹 간격 | claim section을 official 아래로, contact strip 상세 내부 |
| 업무 포털 느낌 | 스크롤 row 축소, wrap 우선 |

| 복제 금지 | |
|-----------|--|
| 데이터·URL·문구·브랜드·레이아웃 1:1 | |

---

## 4. 전산 바로가기 회귀 분석

**데이터 소스:** `lib/content/insurers.ts` (published 49건), `resolveSystemLinks()` in `lib/directory/work-links.ts`

| 지표 | PR-BS-29/30 이전 (registry) | 현재 (main d460ad9) |
|------|:---------------------------:|:-------------------:|
| `systemUrl` 유효 href | 37 | 37 |
| `resolveSystemLinks().primary` | 37 | 37 |
| portal-only fallback | 0 | 0 |

### 사라진/없는 전산 링크 (registry 기준 — 원래 없음, 복구 대상 아님)

라이나생명, 우체국보험, 수협공제, TheK교직원공제, 신협공제, AXA손해보험, 삼성화재다이렉트착, 카카오페이손해보험, 교보라이프플래닛, 신한EZ손해보험, 캐롯손해보험, 하나원데이보험 (12건)

### href 있는데 버튼 미표시?

- **현재 main:** `InsurerCardDeskActions` + `resolveSystemLinks` → **37/37 표시** (회귀 해소)
- **PR-BS-29/30 compact row (`systemUrl` only):** 동일 37 — `plannerPortalUrl` fallback 케이스 없어 개수 동일, **코드 경로만 위험**

### SSOT

- **단일 helper:** `resolveSystemLinks()` ✅  
- **혼동 위험:** `officialWebsiteUrl` vs `systemUrl` — UI mapping에서 분리됨; admin과 public registry 동기는 DB/seed 의존

---

## 5. /claim-documents 분석

| 항목 | 판정 |
|------|------|
| 보험사별 아코디언 | ✅ 실무 적합 |
| PDF 다운로드/바로 열기 | ✅ `ClaimFormListItem` 유지 |
| compact mode (다 PDF 보험사) | ✅ `shouldCompactInsurerCardClaimList` |
| 문서명 세로 깨짐 | ✅ `break-words` / card variant |
| 검색·필터 | ✅ 다만 모바일 filter 밀도 높음 |
| empty state | ⚠️ `claimDocumentCandidateFallback` — DB empty 시에도 데이터 표시 |

---

## 6. /admin 분석

| 항목 | 판정 |
|------|------|
| 운영 대시보드 IA | ✅ `AdminOperationalDashboard` — 요약·오늘 할 일·메뉴 카드 |
| 무제한 목록 | ✅ legacy panels `<details>` 접힘 |
| 사용자/관리자 분리 | ✅ layout RBAC |
| 검수·링크 최신성 | ✅ metric cards |

---

## 7. /admin/claim-documents 분석

| 항목 | 판정 |
|------|------|
| `saveClaimDocumentGovernance` | ✅ 유지 |
| 요약·필ter·pagination | ✅ |
| audit/adminMemo | ✅ admin only |
| public leak | ❌ 없음 |

---

## 8. /work-tools 분석

- 공개 페이지 + 풍부한 도구 — 실무 가치 높음
- `WorkToolsPublicNotice`에 `/admin` 「Admin」 링크 — 공개 사용자 혼란 가능
- 단일 3700+ line client — 모바일 초기 로드 부담
- claim-boundary copy — 심의 양호

---

## 9. /disclosure-links 분석

- 상품 권유 톤 회피 copy 양호
- 필터·카드 2열 — 데스크톱 우수
- peer 대비 `PublicErrorReportNotice` 없음

---

## 10. /message-templates 분석

- 검색·카테고리·복사 UX 우수
- **「safeCopy」**, **「검수 완료」** badge — 내부 스키마명 public 노출
- CopyToast 피드백 명확

---

## 11. 모바일 전수조사 결과 (코드·클래스 기준)

| 폭 | 주요 관찰 |
|----|-----------|
| 360–390px | Header nav `overflow-x-auto`; directory action row **가로 스크롤**; grid 1열 |
| 430px | QuickClaim 2열 grid 시작 (`sm:grid-cols-2`) — **청구 버튼 2개 추가 노출** |
| 600px | directory grid/list toggle 여전히 hidden (`sm:` 미만) |
| 768px | 2열 insurer grid |
| 1024px | full layout |

| 체크 | /directory |
|------|------------|
| 가로 overflow | action row 의도적 scroll |
| 버튼 겹침 | wrap은 `sm+` only |
| touch 44px | `min-h-11` ✅ |
| PDF 버튼 | 유지 (중복 경로 多) |
| nav 가림 | sticky header — 양호 |

---

## 12. 접근성 이슈

| 이슈 | 심각도 | 위치 |
|------|--------|------|
| action row scroll — keyboard focus 순서 길음 | 중 | `InsurerCardDeskActions` |
| 아이콘-only 즐겨찾기 ★ | 낮 | `aria-label` 있음 |
| `focus-visible` | ✅ | design-system 일관 |
| disabled 주소 버튼 | ✅ | `disabled` + opacity |
| external links | ✅ | `ExternalTabAnchor` |

---

## 13. 심의 안정성 이슈

**Public route grep:** 금지 단정형은 주로 validators/tests/ops — **live public UI copy는 대체로 안전**

| 잔존 주의 | 위치 |
|-----------|------|
| 「검수 완료」 | message-templates cards |
| 「safeCopy」 | message-templates (스키마명) |
| 「관리자 검수」 | empty states |
| knowledge seed (draft) | admin/draft only |

홈·directory·claim — 「보험금 지급 판단하지 않습니다」 boundary copy ✅

---

## 14. 사용자 화면에 노출되면 안 되는 문구

| 문구 | 현재 public 노출 |
|------|------------------|
| 확인일 정보 부족 | ❌ directory fold |
| 공식 확인 후 업데이트 예정 | △ 상세 패널 only |
| mock 공개 / 예시 보험사 | ❌ /directory |
| 검수 완료 업무 링크 | ❌ |
| safeCopy | ⚠️ /message-templates |
| adminMemo / audit log | ❌ |
| BohumSchool / archive.pages.dev | ❌ UI (코드 comment only) |

---

## 15. PDF / asset 보존

| 항목 | 결과 |
|------|------|
| `public/claim-forms/bohumschool/**` | ✅ PDF **170건** 존재 |
| PDF delete in git | ❌ 없음 |
| PDF 경로/파일명 변경 | ❌ 없음 |
| PDF 다운로드/바로 열기 href | ✅ 유지 |

---

## 16. 테스트 결과

| 명령 | 결과 | 비고 |
|------|------|------|
| `git status --short` | clean (main) | 조사 중 수정 없음 |
| `npm run typecheck` | **PASS** | 조사 세션 확인 |
| `npm run lint` | **PASS** (warnings) | 이전 CI 기준; audit 중 full re-run interrupted |
| `npm run test` | **PASS** (expected) | HEAD `d460ad9` PR-BS-31 full suite green; audit re-run interrupted |
| `npm run build` | **PASS** | 재실행 exit 0 (~128s); 이전 exit 1은 Next.js build lock 충돌 |

> Audit 세션에서 lint/test/build 연속 실행은 환경상 background interrupt. typecheck는 직접 확인 완료.

---

## 17. 우선순위별 수정 제안

### P0 — 즉시

1. **/directory 청구 UI dedupe** — `InsurerQuickClaimActions` 제거 또는 상세 내부로; DeskActions에서 「청구·PDF·서류」→ **「청구·서류」1버튼**
2. **전산 CTA visual hierarchy** — 전산 단독 row, `min-h-12`/`w-full sm:w-auto`, 청구 그룹은 secondary outline
3. **390px 전산 above-the-fold** — 스크롤 없이 전산 탭 가능

### P1 — 다음 PR

4. Public copy: safeCopy → 「안전 문구」, 검수 완료 → 「공개 문구」 등
5. `WorkToolsPlannerNoticeCard` public routes — 「검증 설계사」 문구 vs public `/work-tools` 정합
6. Home DB error visible empty/error state

### P2 — 후속

7. `/disclosure-links` error report footer
8. Mobile nav drawer (7+ destinations)
9. Claim-docs fallback source banner

### P3 — 장기

10. work-tools client code-split
11. unified public empty-state copy system
12. directory card A/B (compact primary bar vs current)

---

## 18. 추천 PR 로드맵

| PR | 제목 | 범위 |
|----|------|------|
| **PR-DIR-A** | Directory: 전산 1순위 + 청구 버튼 통합 | Remove QuickClaim from fold; merge claim entry points |
| **PR-DIR-B** | Directory: mobile primary CTA layout | Full-width 전산, claim secondary group |
| **PR-COPY-A** | Public: remove internal review terminology | message-templates, empty states |
| **PR-IA-A** | Work-tools access messaging consistency | PlannerNoticeCard vs public work-tools |
| **PR-HOME-A** | Home: explicit fetch error state | page.tsx / home-client |
| **PR-MOB-A** | Global mobile nav drawer | header.tsx |

---

## 19. 머지 전 주의사항

- `/directory` 변경 시 **PDF delete/path** diff 필수 확인
- 전산 href **git history/registry만** — URL 임의 생성 금지
- 청구 버튼 통합 시 **PDF 다운로드·바로 열기** regression test 유지
- BohumSchool 참고는 **위계·간격만** — 데이터/코드 복제 금지
- `InsurerCardDeskActions` 변경은 compact list row와 **동시 SSOT** 유지

---

## 20. 최종 결론

PlannerDesk는 PR-BS-21~31을 통해 **청구 PDF·admin governance·directory 카드 복구·내부 status 제거**까지 진행되어 **기능 회귀는 대부분 해소**된 상태다. 다만 사용자가 지적한 대로 **「보험사 바로가기」의 1순위 가치인 전산 연결**은 데이터상 존재하나, **UI에서 청구·PDF·서류·팩스 관련 control이 5~6개로 중복 배치**되어 전산이 상대적으로 약해진다.

**가장 ROI 높은 다음 작업**은 기능 추가가 아니라 **`/directory` 카드 액션 위계 재설계**(전산 강조 + 청구 entry point 단일화)이다. Antigravity/Codex 보고서와 취합 시, 본 항목을 **P0 공통 테마**로 올릴 것을 권장한다.

---

*Report generated by Cursor agent — read-only audit, no repository modifications.*
