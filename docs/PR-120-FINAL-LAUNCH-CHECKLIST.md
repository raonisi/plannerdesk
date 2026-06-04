# PR-120 — 정식 운영 전 최종 체크리스트

**판단:** [PR-120-LAUNCH-DECISION.md](./PR-120-LAUNCH-DECISION.md)  
**게이트:** [PR-120-DATA-AND-SMOKE-GATES.md](./PR-120-DATA-AND-SMOKE-GATES.md)

**범례:** ✅ pass (정적/로컬) · ⏳ 운영자 · ❌ fail · **정보 부족**

---

## 영역 요약

| 영역 | 상태 | 근거 | 남은 리스크 |
| --- | --- | --- | --- |
| A. 기술 검증 | ✅ | lint/typecheck/test/build pass | — |
| B. Public route | ⏳ | 정적·스크립트; HTTP smoke 미완 | R2 |
| C. Admin route | ⏳ | 코드·PR111; 로그인 spot-check | R2 |
| D. Admin bulk | ✅ | PR107 tests; 실행 금지 | — |
| E. Answer Assistant | ✅ | PR109 tests; 확대 금지 | — |
| F. 운영 데이터 | ⏳ | PR119 fixture; DB·출처 미완 | R3,R5,R13 |
| G. 배포/rollback | ⏳ | PR114~116 문서; commit·URL 미기입 | R8 |

---

## A. 기술 검증

- [x] `npm run lint` 통과
- [x] `npm run typecheck` 통과
- [x] `npm run test` 통과 (169)
- [x] `npm run build` 통과
- [x] build와 migration 분리 (`PR-105`)
- [x] CI: typecheck, lint, test, build — migrate 없음
- [x] 실패 항목 없음 (PR120 세션)

---

## B. Public route

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| 홈/랜딩 | ⏳ | `smoke:public` `/` |
| 보험사 디렉터리 | ✅ | PR112 + fixture |
| 보험사 상세/청구안내 | ⏳ | `?insurer=` spot-check |
| 청구서류 | ⏳ | DB 또는 fallback |
| 지식 아카이브 | ⏳ | slug 1건 |
| 검색 | ⏳ | `/search?q=` |
| 공시/문구 | ⏳ | `/disclosure-links`, `/message-templates` |
| not-found/empty | ⏳ | PR110 fixture 404 |
| 미검수/비공개 미노출 | ✅ | visibility tests |
| 관리자 전용 미노출 | ✅ | public select |

---

## C. Admin route

- [ ] admin 접근 제어 (비로그인 → login) — **운영자**
- [ ] super_admin / content_admin 경계 — **운영자**
- [x] UI·empty·bulk bar (PR111 코드)
- [ ] 대시보드·보험사·청구·지식 화면 로드 — **운영자**

---

## D. Admin bulk

- [x] forbidden operation 차단 (PR107)
- [x] 대상 수·빈 선택·확인 문구 (정적)
- [x] **실제 bulk 실행 안 함** (정책)
- [ ] UI spot-check (실행 없이) — **운영자**

---

## E. Answer Assistant beta

- [x] verified + allowlist (코드·tests)
- [x] beta 자동 확대 없음 (PR109)
- [x] rate limit, output safety, metadata-only audit
- [x] retention cleanup·rollback 절 (문서)
- [ ] allowlist 내/외 접근 spot-check — **운영자**

---

## F. 운영 데이터

- [x] fixture 구조·이슈표 (PR119)
- [ ] 공식 출처 표 진행 — **운영자**
- [ ] 스테이징 DB 중복·초안 — **운영자**
- [x] **대량 수정 없음** (PR120)

---

## G. 배포/rollback

- [ ] 배포·rollback commit SHA — **운영자**
- [ ] migration 필요 여부 판단 — **운영자**
- [x] env **이름**만 checklist (PR116); secret 미기록
- [x] rollback·smoke 기준 문서 (PR115, PR117)
- [ ] PR117 표 서명 — **운영자**

---

## 서명

| 역할 | 일시 | A~G |
| --- | --- | --- |
| 기술 | | |
| 운영 | | |
| 승인 | | |
