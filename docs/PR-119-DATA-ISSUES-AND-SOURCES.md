# PR-119 — 데이터 이슈 분류 · 공식 출처 확인

---

## 데이터 이슈 분류표

| 번호 | 영역 | 이슈 | 등급 | 근거 | 권장 조치 | 처리 PR |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | public visibility | draft·비게시 public 노출 | — | `public-visibility.test.ts` pass | guard 유지 | PR119 문서화 |
| 2 | 보험사 | fixture `lastVerifiedAt` 전량 null (49/49) | Medium | 정적 점검 | 운영자 검수일 기입 | PR120 |
| 3 | 보험사 | `sourceNote` 전량 「공식 출처 재검수 필요」 | High | fixture 메타 | 공식 출처 대조 후 검수 완료 | PR120 / 운영자 |
| 4 | 보험사 | `claimPageUrl` 전량 null | Medium | `claimFormUrl` 대체 가능 | 청구안내 URL 정책 결정 | PR120 |
| 5 | 보험사 | `systemUrl` 1건 HTTP | Low | `hanwha-general` | HTTPS·공식 URL 확인 | **PR124 반영** (scheme) | PR124 |
| 6 | 보험사 | 전부 `needs_review`+published | Medium | 정책상 public 허용 | 검수 완료 또는 고지 문구 유지 | PR120 |
| 7 | 청구서류 | fallback `insurerId` null (35/35) | Medium | import 후보 설계 | 보험사별 연결 import | 별도 데이터 PR |
| 8 | 청구서류 | 운영 DB 품질 | 정보 부족 | DB 미조회 | 스테이징 QA | PR120 |
| 9 | 청구서류 | 보험학교 API 참고 출처 | High | third-party | 보험사 공식 기준 병행 확인 | 공식 출처 표 |
| 10 | 지식 | 운영 DB 중복·초안 비율 | 정보 부족 | 미조회 | admin 목록 검토 | PR120 |
| 11 | 운영 DB | 실제 행 vs fixture 불일치 가능 | Medium | seed 별도 | deploy 후 diff 점검 | PR120 |

**Critical 이슈:** 코드 guard 기준 **미발견**. 운영 DB 런타임은 **미확인**.

---

## 공식 출처 확인 필요 항목

| 항목 | 현재 정보 (fixture 기준) | 확인해야 할 공식 출처 | 우선순위 | 비고 |
| --- | --- | --- | --- | --- |
| 보험사 홈페이지 | `officialWebsiteUrl` 49건 | 각 보험사 공식 사이트 | High | URL 유효·리다이렉트 |
| 전산 링크 | `systemUrl` | 보험사 설계사 포털 안내 | High | 로그인 페이지 변경 |
| 청구 양식 URL | `claimFormUrl` | 청구·다운로드 공식 페이지 | High | |
| 청구안내 페이지 | `claimPageUrl` null | 청구 프로세스 안내 | Medium | 필드 채움 여부 결정 |
| 고객센터·헬프데스크 | `customerCenterPhone`, `helpdeskPhone` | 공식 고객센터 | **Critical** (오류 시) | 번호 변경 빈번 |
| 청구 팩스 | `claimFaxNumber` | 청구 접수 안내 | **Critical** (오류 시) | |
| 청구서류 목록 | 35 후보 + DB | 보험사·약관 청구 기준 | High | PR118→119 이관 |
| 지식 콘텐츠 | DB·starter drafts | 내부 검수·출처 URL | Medium | `sourceCheckedAt` |
| 약관/공시 링크 | `termsUrl`, disclosure | 공시실 | Medium | |
| Answer Assistant retrieval | published insurers only | 동일 출처 정책 | Medium | 범위 확대 금지 |

**Cursor:** 외부 사이트 실시간 확인 **미실행** → 항목별 「정보 부족」 유지, **최신·정확 단정 금지**.

---

## Codex 제한검수

| 항목 | PR119 |
| --- | --- |
| 필요 | **불필요** |
| 후보 | 운영 DB 노출 사고·guard 변경 제안 시 |
| 생략 | docs·정적 fixture·기존 visibility tests pass |
