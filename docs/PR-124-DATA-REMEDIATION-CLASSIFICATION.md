# PR-124 — 데이터 보완 후보 분류표

**기준:** [PR-123-INSURER-OPERATIONS.md](./PR-123-INSURER-OPERATIONS.md) · [PR-123-CLAIM-DOCUMENT-OPERATIONS.md](./PR-123-CLAIM-DOCUMENT-OPERATIONS.md)

**Cursor 세션:** 운영 DB 미조회 · 외부 공식 문서 대조 **미실행** (URL scheme 검증 1건만)

---

## 분류표

| 번호 | 영역 | 항목 | 현재 상태 | 확인 근거 | 처리 분류 | 위험도 |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | 보험사 | `hanwha-general` systemUrl HTTP | HTTP → **HTTPS 반영** | 동일 호스트 HTTPS HEAD 200; 공식 홈 `hwgeneralins.com` 도메인 | **반영** | Low |
| 2 | 보험사 | `lastVerifiedAt` 49/49 null | 미기입 | 운영자 검수일 미확정 | **보류** | Medium |
| 3 | 보험사 | `sourceNote` 재검수 문구 | 전량 동일 | 공식 출처 대조 미완 | **보류** | High |
| 4 | 보험사 | `claimPageUrl` 49/49 null | null | 공식 청구안내 페이지 URL 미확인 | **정보 부족** | Medium |
| 5 | 보험사 | `lina-life` claimFormUrl null | null | 공식 다운로드 경로 미확인 | **정보 부족** | Medium |
| 6 | 보험사 | 중복 명칭 5쌍 (10 id) | 동일 name·다른 id | 병합·비공개 기준 미확정 | **보류** | Medium |
| 7 | 보험사 | 팩스·헬프데스크·CS 번호 | fixture 값 | 보험사별 공식 CS 미대조 | **보류** | **High** |
| 8 | 보험사 | 전산·홈·약관 URL (1건 제외) | fixture | 링크 유효성·개편 미확인 | **보류** | High |
| 9 | 청구서류 | fallback `insurerId` null 35/35 | 설계상 공통 참고 | 보험사별 연결은 import·운영자 확인 필요 | **보류** | Medium |
| 10 | 청구서류 | 보험학교 API 출처 | third-party | 보험사 공식 기준 병행 미완 | **보류** | High |
| 11 | 청구서류 | 운영 DB 행 품질 | 미조회 | 스테이징 QA 필요 | **정보 부족** | Medium |
| 12 | visibility | draft·unpublished 미노출 | tests pass | `public-visibility.test.ts` | **유지** (수정 없음) | — |
| 13 | 메타 | needs_review+published 정책 | 49건 | 검수 완료 전 공개 고지 유지 | **보류** | Medium |
| 14 | DB/Auth | schema·migration·bulk | — | PR124 범위 외 | **별도 PR** | Critical |

---

## 중복 보험사 후보 (병합 보류)

| name | id (쌍) | 비고 |
| --- | --- | --- |
| DB손해보험 | `db-general` · `db-insurance` | 운영자 승인 후 병합/비공개 |
| KB손해보험 | `kb-general` · `kb-insurance` | 동일 |
| 롯데손해보험 | `lotte-general` · `lotte-fire` | 동일 |
| 라이나손보 | `chubb-general` · `lina-general` | chubb→라이나 리브랜드 가능성 — **공식 확인 필요** |
| 예별손해보험 | `yebyeol-general` · `yebyeol-insurance` | 동일 |

---

## 처리 분류 정의

| 분류 | 의미 |
| --- | --- |
| **반영** | 확인 근거 있음, fixture 최소 diff |
| **보류** | 추가 공식·운영 확인 필요 |
| **정보 부족** | 현 데이터만으로 판단 불가 |
| **별도 PR** | DB/Auth/bulk/visibility |

---

## PR119 매핑

| PR119 # | PR124 # |
| ---: | ---: |
| 2,3,4,6 | 2,3,4,13 |
| 5 | **1** (반영) |
| 7,9 | 9,10 |
| 8,11 | 11,14 |
