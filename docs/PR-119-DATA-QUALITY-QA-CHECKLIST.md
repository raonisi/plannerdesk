# PR-119 — 데이터 품질 QA 체크리스트

**기준:** [PR-119-DATA-STRUCTURE-ANALYSIS.md](./PR-119-DATA-STRUCTURE-ANALYSIS.md)  
**점검 범위:** fixture + 코드 guard (운영 DB **미조회**)

---

## PR119 데이터 품질 QA 기준

| 영역 | 점검 항목 | 위험도 | 확인 방식 | 수정 방식 |
| --- | --- | --- | --- | --- |
| 보험사 디렉터리 | 명칭·구분·공개·링크 | High | fixture + 운영자 | 수동·PR120 |
| 청구서류 | 보험사 연결·서류명·구분 | High | fixture/DB(미조회) | 수동 import |
| 업무 링크 | 전산·홈·청구안내 | Medium | URL 공식 확인 | 출처 확인 후 |
| 팩스/헬프데스크 | 번호·누락 | High | 공식 출처 | 수동 검수 |
| 지식 아카이브 | 카테고리·태그·검수 | Medium | admin/public 코드 | 수동 |
| public visibility | 미검수/비공개 미노출 | Critical | 테스트 | guard 유지 |
| 중복/오탈자 | id·명칭 | Low~Medium | 정적 | dedupe·수동 |
| 최신성 | 링크·번호 | High | 공식 출처 | 보류 |

---

## 보험사 디렉터리 QA 결과 (fixture 49건)

| 항목 | 확인 기준 | 결과 | 조치 | 비고 |
| --- | --- | --- | --- | --- |
| 보험사명 표기 | id·name 1:1, 중복 id 없음 | **pass** | — | 정적 테스트 |
| 생명/손해 구분 | `life` / `non_life` | **pass** | — | 49건 분류 존재 |
| 공개 상태 | `isPublished` + `needs_review` | **조건부** | PR120 검수 | public **가능**, 출처 미확인 |
| 청구안내 연결 | `claimPageUrl` | **보류** | PR120 | 49/49 `null`, `claimFormUrl` 사용 |
| 전산 링크 | `systemUrl` 누락 | **조건부** | 공식 확인 | 1건 `http://` (한화손해) |
| 앱/홈페이지 | `officialWebsiteUrl` | **조건부** | 공식 확인 | 대부분 URL 있음 |
| 헬프데스크 | `helpdeskPhone` | **조건부** | 공식 확인 | fixture 값·미검증 |
| 중복 보험사 | `dedupePublicInsurers` | **pass** | — | 코드 dedupe |
| 오탈자 | 표기 통일 | **정보 부족** | 운영자 | 운영 DB 미조회 |
| `lastVerifiedAt` | 검수일 | **보류** | PR120 | 49/49 `null` |
| `sourceNote` | 출처 | **보류** | 공식 재검수 | 49/49 「재검수 필요」 |

---

## 청구서류 QA 결과

| 항목 | 확인 기준 | 결과 | 조치 | 비고 |
| --- | --- | --- | --- | --- |
| 보험사 연결 | `insurerId` | **보류** | PR120 | fallback 35건 전부 `null` |
| 서류명 | 실무 이해 가능 | **pass** (fixture) | — | 후보 35건 명칭 존재 |
| 상황 구분 | category/section | **pass** (fixture) | — | 입원·통원·진단 등 |
| 중복 서류 | slug 유일 | **pass** | — | 35 slug unique |
| 누락 가능성 | 보험사별 필수 | **정보 부족** | 운영자 | DB 미조회 |
| 공개 상태 | guard | **pass** | — | `needs_review`만 public 후보 |
| 최신성 | 보험학교 API 출처 | **보류** | 공식 확인 | `SOURCE_URL` 참고용 |
| 안내 문구 | 단정·가입 유도 없음 | **pass** | — | `CAUTION_NOTE` 적정 |

**운영 DB 청구서류:** **정보 부족** (Cursor 미조회).

---

## 지식 아카이브 QA 결과

| 항목 | 확인 기준 | 결과 | 조치 | 비고 |
| --- | --- | --- | --- | --- |
| 카테고리 | 8종 seed | **pass** (seed) | — | DB 분포 미확인 |
| 태그 | 검색 보조 | **pass** (seed) | — | 10건 태그 있음 |
| 제목·요약 | 실무 이해 | **pass** (seed) | — | |
| 검수 상태 | draft public 차단 | **pass** | — | `PUBLIC_KNOWLEDGE_WHERE` |
| 공개 상태 | guard | **pass** | — | 테스트 |
| 중복 콘텐츠 | slug | **정보 부족** | PR120 | DB 미조회 |
| 최신성 | `sourceCheckedAt` | **정보 부족** | 운영자 | |
| 심의 안정성 | 과장·단정 | **pass** (seed) | — | 샘플 톤 중립 |

**Seed:** 10건 전부 `needs_review` (public은 DB `isPublished`+status에 따름).

---

## 운영자 수동 확인 체크리스트 (DB·스테이징)

- [ ] 운영/스테이징 `Insurer` published·draft 비율
- [ ] `lastVerifiedAt` 미기입 비율
- [ ] `ClaimDocument.insurerId` 연결률
- [ ] 지식 `draft`/`archived` public 미노출 spot-check
- [ ] 공식 출처 표 ([PR-119-DATA-ISSUES-AND-SOURCES.md](./PR-119-DATA-ISSUES-AND-SOURCES.md)) 진행

**bulk·migrate 실행 금지.**
