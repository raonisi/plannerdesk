# PR-BS-19 Public Beta Readiness Review

## PR-BS-19A Remediation Addendum (2026-06-12)

PR-BS-19A removes the public `public/claim-forms/bohumschool` PDF assets,
empties the local claim-form PDF registry, and disables external archive-derived
claim-document fallback/import paths. The original PR-BS-19 STOP finding remains
as historical review context below; re-readiness should be based on the current
PR-BS-19A remediation diff and validation results.

**작성일:** 2026-06-03  
**최종 갱신:** 2026-06-03 (Codex 제한검수 반영)  
**기준 브랜치:** `main` @ `2d8d8b4` (PR-BS-18 포함)  
**성격:** 문서·점검 전용 — 공개 베타 시작·배포·allowlist 변경·외부 안내 발송 없음

---

## 1. 최종 판단

| 항목 | 결과 |
| --- | --- |
| **공개 베타 진입 판정** | **STOP** |
| **Critical** | **1** — public 제공 가능한 외부 청구서 PDF asset 복제물 |
| **High** | 미완료 (Critical STOP으로 중단) |
| **Medium** | 미완료 |
| **Low** | 미완료 |

**한 줄 결론:** PR-BS-10~18 UX·gate는 대체로 유지되나, **`public/claim-forms/bohumschool` 아래 git 추적 PDF 170개**와 `lib/content/claim-form-files.ts`의 public 링크 구조가 **외부 asset 복제 STOP** 기준에 해당하므로 **공개 베타 진입 불가**.

### Codex 제한검수 반영 (2026-06-03)

| 검수자 | 판정 | 핵심 |
| --- | --- | --- |
| Cursor (초안) | HOLD | 외부 복제 항목을 **오판 PASS** — **수정됨** |
| **Codex 제한검수** | **STOP** | `public/claim-forms/bohumschool` PDF 170개 + claim library public 노출 |

**Critical 근거 (재현 가능):**

```text
git ls-files public/claim-forms/bohumschool  → 170 PDF
git log --oneline -1 -- public/claim-forms → 76b7f86 Upload claim form PDFs (#38)
lib/content/claim-form-files.ts            → href: /claim-forms/bohumschool/...
lib/claim-documents/claim-library.ts     → claimFormFiles → public /claim-documents
```

---

## 2. 이번 PR의 범위

| 포함 | 비포함 |
| --- | --- |
| PR-BS-10~18 종합 상태 정리 | 공개 베타 실제 시작 |
| Critical/High Gate 점검표 | beta user·allowlist·role 변경 |
| 금지 표현 검색 결과 정리 | 배포·migration 실행 |
| lint/typecheck/test 결과 기록 | 이메일/SMS/Slack 등 외부 발송 |
| PASS/HOLD/STOP 판정 및 후속 제안 | 앱·API·DB·Auth 코드 변경 |

---

## 3. 이번 PR에서 하지 않는 것

- 공개 베타 트래픽 개방, 회원가입 확대, 초대 링크 발급
- 운영 DB 접근·데이터 조회/수정
- Work Tools / Answer Assistant / Admin public 노출
- schema·Auth/RBAC·package 변경
- `npm run build` (Prisma generate 포함 — 운영 DB 접촉 위험 사전 확인 전 생략)

---

## 4. PR-BS-10~18 상태 요약

| PR | 주제 | 최종 상태 | 핵심 검수 기준 | 남은 리스크 |
| --- | --- | --- | --- | --- |
| PR-BS-10 | Data Freshness UI | **PASS** | 임의 날짜·임의 출처 없음; `officialSourceUrl`만 공식 링크 | DB 미연결 시 일부 페이지 fallback copy |
| PR-BS-11 | Public Search Filter UI | **PASS** | public search guard·도메인 제한 유지 | — |
| PR-BS-12 | Correction Flow PII Guard | **PASS** | PII·지급 판단 입력 차단 | 제보는 클립보드/운영자 수동 처리 |
| PR-BS-13 | Planner Favorites | **PASS** | planner-only, localStorage, 고객정보 저장 없음 | — |
| PR-BS-14 | Work Link Admin Review UI | **PASS** | 검수 전 mock admin-only | 실데이터·DB 연동 후속 |
| PR-BS-15 | Verified Work Link UX | **PASS WITH NOTES** | published/public/official/verified 조건 | mock fixture만; Antigravity/Codex 권장 |
| PR-BS-16 | PWA Install Guide UX | **PASS** | SW/offline/push 없음; auth·PII 경계 copy | — |
| PR-BS-17 | Card Payment Info Policy Gate | **PASS WITH NOTES** | paymentInfo public 차단, PG 없음 | insurer directory `cardPayment*` 미변경; Codex 제한검수 권장 |
| PR-BS-18 | Code Search Safety Gate | **PASS WITH NOTES** | public 코드 검색·AA 연결 없음 | BohumSchool archive proxy 잔존; Codex 제한검수 권장 |

**Antigravity 검수:** 저장소에 PASS/FAIL 기록 **없음** → **정보 부족** (별도 검수 필요).

**Codex 제한검수:** **실행 완료 → STOP** (본 문서 §1·§5 갱신).

---

## 5. Critical Gate 점검

| Gate | 기준 | 결과 | 판단 |
| --- | --- | --- | --- |
| Public 노출 | Work Tools/AA/Admin public 노출 없음 | `getWorkToolsAccess`·`getAdminAccess`·`getVerifiedAnswerAssistantAccess` 게이트 유지 | **PASS** |
| 고객정보 | 고객정보·민감정보·상담 원문 입력/저장 없음 | correction PII guard, AA audit metadata-only, favorites local-only | **PASS** |
| 보험 표현 | 보험금·청구·보장 확정 표현 없음 | public UI — 확정 표현 없음(부정 문맥만) | **PASS** |
| 카드납 | 카드납 확정·결제정보 저장·PG 없음 | `payment-info-policy` gate; checkout/billing route 없음 | **PASS** |
| 코드 검색 | public 코드 검색·AA 자동 연결 없음 | `code-search-safety` gate; AA import 없음 | **PASS** |
| DB/Auth | DB/schema/Auth/RBAC 변경 없음 (BS-19 docs 범위) | diff 기준 없음 | **PASS** |
| **외부 복제** | **외부 사이트 데이터/asset 무단 복제 없음** | **`public/claim-forms/bohumschool` PDF 170개 git 추적; `claim-form-files.ts`가 `/claim-forms/bohumschool/...` public href 및 Supabase `sourceUrl` 보유; `/claim-documents` claim library에 `verified` PDF로 노출** | **FAIL → STOP** |
| Secret | env/token/API key 노출 없음 | PR-BS-19 diff에서 secret 값 출력 없음 | **PASS** |

**Critical 합계: 1 → 공개 베타 진입 STOP**

### 외부 asset 복제 상세 (Critical)

| 항목 | 내용 |
| --- | --- |
| 경로 | `public/claim-forms/bohumschool/**` (170 PDF, `git ls-files` 확인) |
| 도입 | `76b7f86` — *Upload claim form PDFs (#38)* |
| 메타데이터 | `lib/content/claim-form-files.ts` — `id` prefix `bohumschool-`, `href` public static path |
| public 노출 | `lib/claim-documents/claim-library.ts` → `buildClaimLibraryItems` → `/claim-documents` UI |
| 검수 상태 표기 | `claimFormToLibraryItem`이 PDF를 `VerificationStatus.verified`로 매핑 — **출처·권한 gate 없음** |
| 외부 storage | `sourceUrl`에 Supabase public bucket URL 다수 (BohumSchool 계열 출처) |

**판단:** mock/placeholder가 아닌 **실제 PDF binary의 public static hosting**. 저작권·사용 권한·공식 출처 확인 없이는 공개 베타 asset으로 **부적합**.

---

## 6. High Gate 점검

**Codex 제한검수:** Critical 1건 발견으로 **High Gate 전체 미실행** (요청서 STOP 규칙).

| Gate | 기준 | 결과 | 판단 |
| --- | --- | --- | --- |
| lint | `npm run lint` | Cursor 초안: PASS (warning 11) / Codex: **미실행** | **미검증** |
| typecheck | `npm run typecheck` | Cursor 초안: PASS / Codex: **미실행** | **미검증** |
| test | `npm run test` | Cursor 초안: PASS / Codex: **미실행** | **미검증** |
| public search | 미검수 데이터 노출 없음 | Cursor 초안: PASS | **미검증 (Codex)** |
| 업무 링크 | officialSourceUrl 등 | Cursor 초안: PASS WITH NOTES | **미검증 (Codex)** |
| PII guard | correction PII 차단 | Cursor 초안: PASS | **미검증 (Codex)** |
| 안내 문구 | freshness·출처·권한 | Cursor 초안: PASS | **미검증 (Codex)** |
| 외부 제한검수 | Codex/Antigravity | **Codex 실행 → STOP** | **FAIL** |

**High 합계:** Critical STOP으로 **판정 보류**

---

## 7. Public / Planner / Admin 노출 경계

| 영역 | public | planner (verified) | admin |
| --- | --- | --- | --- |
| 디렉터리·청구·검색·지식 | published/verified guard | 동일 + planner favorites(세션 시) | — |
| Work Tools | 링크만(게이트된 `/work-tools`) | `getWorkToolsAccess` | — |
| Answer Assistant | 없음 | `/planner/answer-assistant` + allowlist beta | usage audit |
| Admin | 없음 | verified planner 차단 | `getAdminAccess` |
| 업무 링크 paymentInfo | **차단** | planner 조건부 | admin mock 검수 |
| 코드 검색 | **차단** | Work Tools 내부만 | — |

---

## 8. 개인정보·민감정보·상담 원문 차단 상태

- **Correction flow (BS-12):** 주민번호·전화·진단서·상담 원문·지급 판단 키워드 차단; raw message 서버 저장 없음.
- **Planner favorites (BS-13):** localStorage, 계약번호·고객정보 즐겨찾기 금지 helper.
- **Answer Assistant:** prompt/response/draft DB 필드 없음; usage audit metadata-only.
- **Work Tools 코드 검색:** 진단서·병력·상담 원문 placeholder 유도 없음 (BS-18 copy test).

---

## 9. Work Tools / Answer Assistant / Admin 접근 경계

| 검증 | 근거 | 결과 |
| --- | --- | --- |
| Work Tools API guard | `workToolsRouteGuard` on all `/api/work-tools/*` | PASS |
| AA no code API | `code-search-answer-assistant-boundary.test.ts` | PASS |
| Admin not on public home | PR155 regression | PASS |
| Public smoke excludes work-tools/admin AA | `smoke-public-routes.mjs` | PASS |

---

## 10. 카드납·납입 정보 정책 Gate 상태 (BS-17)

- `paymentInfo` 등 High-risk 유형 **public 항상 차단** (`payment-info-policy.ts`).
- 금지 필드·금지 표현 상수 + 테스트 4종.
- **잔여 Medium:** insurer public projection의 `cardPaymentStatus`/`cardPaymentNote`는 BS-08 범위로 **이번 gate에서 변경하지 않음** — 공개 베타 전 별도 Codex 검토 권장.
- PlannerDesk PG/checkout/billing **없음**.

---

## 11. 코드 검색 Safety Gate 상태 (BS-18)

- planner-only tool ids: `disease-code`, `surgery-code`, `disease-search`.
- public search 도메인에 코드 검색 **없음**.
- AA에서 work-tools code API **import 없음**.
- **잔여 Medium:** BohumSchool archive proxy는 참고용이며 공식 출처 아님 — 후속 PR-BS-09A.

---

## 12. 업무 링크 공식 출처·최신성·검수 상태 (BS-14/15)

- Admin mock 검수 UI — draft/needs_review public 미노출.
- Public: `published` + `public` + `officialSourceUrl` + `lastVerifiedAt` + `paymentInfo` 차단.
- Planner: verified/published + planner scope + 출처·확인일 (payment는 BS-17 추가 조건).
- 실운영 데이터 연동은 **후속 PR**.

---

## 13. PWA 안내 UX 안전성 (BS-16/07)

- Service worker / offline cache / push **미구현**.
- Public vs planner install copy 분리; Work Tools·AA 우회 안내 없음.
- PII(계약번호·상담 원문) 입력 금지 문구 포함.

---

## 14. 금지 표현 검색 결과

검색 대상: `app/`, `components/` (실제 UI), `lib/` 정책·validation, `tests/`, `docs/`.

| 표현 | 존재 여부 | 위치 | 실제 UI 여부 | 판단 |
| --- | --- | --- | --- | --- |
| 최신 정보 100% 보장 | lib/tests/docs | forbidden registry | public UI **없음** | PASS |
| 항상 최신 | lib policy registry | — | public UI **없음** | PASS |
| 100% 정확 | lib policy/registry | — | public UI **없음** | PASS |
| 청구 가능합니다 | lib AA output-safety (blocklist) | 테스트·차단 목록 | public UI **없음** | PASS |
| 청구 가능 확정 | lib/docs | — | public UI **없음** | PASS |
| 보험금 지급 가능 | app (부정 문맥) | work-tools auxText, knowledge, admin corrections | **부정** (“단정하지 않”) | PASS |
| 보험금을 받을 수 있습니다 | lib policy/tests | — | public UI **없음** | PASS |
| 이 코드는 보장됩니다 | lib code-search policy | — | code panel **없음** | PASS |
| 이 수술은 보장됩니다 | lib code-search policy | — | **없음** | PASS |
| 이 질병은 지급 대상입니다 | lib code-search policy | — | **없음** | PASS |
| 카드납 가능합니다 | lib payment-info policy | — | public UI **없음** | PASS |
| 이 번호로내면 됩니다 | lib work-link registry | — | public UI **없음** | PASS |
| 이 링크만 쓰면 됩니다 | lib work-link registry | — | public UI **없음** | PASS |
| AI가 최종 판단합니다 | lib ops registry | — | public UI **없음** | PASS |

---

## 15. 검증 명령 결과

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `npm run lint` | **PASS** | warning 11, error 0 |
| `npm run typecheck` | **PASS** | |
| `npm run test` | **PASS** | exit 0 |
| `npm run test:public` | **PASS** | 102 tests (BS-17/18 public tests 포함) |
| `npm run build` | **미실행** | `prisma generate` 포함 — 운영 DB 접촉 위험 사전 확인 전 생략 |

**BS-17/18 ops 테스트 (수동, PASS):**

```bash
npx tsx --test tests/ops/payment-info-*.test.ts tests/ops/code-search-*.test.ts
```

---

## 16. 공개 베타 전 필수 보완사항

### P0 — STOP 해제 전 필수 (법무·저작권)

1. **`public/claim-forms/bohumschool` PDF 170개** — 법무·저작권·사용 권한 재검수.
   - public static serving 중단 또는 보험사 공식 URL 링크만 허용하는 구조로 전환.
   - `lib/content/claim-form-files.ts`의 `href`/`sourceUrl`/`verified` 매핑 정책 재설계.
   - `claimFormToLibraryItem`의 무조건 `verified` 표기 제거 또는 출처 gate 연동.
2. **PR-BS-19 문서 정정** — 외부 복제 PASS 오판 수정 (**본 갱신으로 반영**).

### P1 — STOP 해제 후

3. **Antigravity 검수** — BS-15/17/18 + claim asset 정책.
4. **법무·약관** — [PR-174](./PR-174-TERMS-LEGAL-REVIEW-PREP.md) 최종화.
5. **Insurer `cardPayment*` public 필드** — BS-08/17 후속.
6. **코드 검색 archive proxy** — PR-BS-09A.
7. **스테이징 build + smoke** — 운영 DB 없는 환경.
8. **allowlist beta** — PR-148/PR-103 재확인.

---

## 17. 공개 베타 가능 조건

현재 **미충족**. 아래 **모두** 충족 시에만 `PASS`로 승격:

- [ ] **Critical 0** — bohumschool PDF public asset 정책 해결
- [ ] High 0 (Antigravity + 잔여 gate PASS)
- [ ] lint/typecheck/test/build(스테이징) PASS
- [ ] 약관·개인정보 처리방침 법무 승인
- [ ] 청구서류 PDF **공식 출처·재배포 권한** 문서화
- [ ] 운영 runbook·롤백·제보 대응 확인
- [ ] allowlist/베타 코호트 정책 운영자 승인

---

## 18. PR-BS-20 이후 후속 제안

| 우선순위 | PR 후보 | 내용 |
| --- | --- | --- |
| **P0** | **PR-BS-20 Claim Form Asset Policy** | bohumschool PDF public serving 중단 또는 공식 링크-only; `claim-form-files` gate; 법무 검수 |
| P1 | PR-BS-20b | BS-15/17/18 Antigravity + Codex 재검수 (asset 해결 후) |
| P1 | PR-BS-09A | 코드 검색 archive proxy 공식 출처 정책 |
| P2 | BS-08 후속 | insurer cardPayment public 표현 |
| P2 | Work link 운영 | mock → 검수 완료 실데이터 |
| P3 | Staging smoke | Railway 스테이징 + `smoke:public` |

---

## 19. 최종 결론

- **PR-BS-19 (본 문서):** **완료** — readiness 종합 문서화; **Codex 제한검수로 STOP 판정 반영**.
- **공개 베타 실제 진입:** **불가 (STOP)**.
- **STOP 사유:** `public/claim-forms/bohumschool` **외부 청구서 PDF 170개** public 제공 구조.
- **Cursor 초안 오류:** §5 외부 복제 **PASS** → Codex 검수 후 **FAIL**로 정정.
- **다음 단계:** PR-BS-20에서 claim form asset 정책·법무 검수 후 readiness **재판정**.

**관련 문서:** [PR-BS-01](./PR-BS-01-FEATURE-BENCHMARK-REPORT.md) · [PR-BS-10](./PR-BS-10-DATA-FRESHNESS-UI.md) · [PR-BS-11](./PR-BS-11-PUBLIC-SEARCH-FILTER-UI.md) · [PR-BS-12](./PR-BS-12-CORRECTION-FLOW-PII-GUARD.md) · [PR-BS-13](./PR-BS-13-PLANNER-FAVORITES.md) · [PR-BS-14](./PR-BS-14-WORK-LINK-ADMIN-REVIEW.md) · [PR-BS-15](./PR-BS-15-VERIFIED-WORK-LINK-UX.md) · [PR-BS-16](./PR-BS-16-PWA-INSTALL-GUIDE-UX.md) · [PR-BS-17](./PR-BS-17-CARD-PAYMENT-INFO-POLICY-GATE.md) · [PR-BS-18](./PR-BS-18-CODE-SEARCH-SAFETY-GATE.md) · [PR-172 Beta Review](./PR-172-BETA-REVIEW-SUMMARY.md) · [PR-174 Terms Legal](./PR-174-TERMS-LEGAL-REVIEW-PREP.md)
