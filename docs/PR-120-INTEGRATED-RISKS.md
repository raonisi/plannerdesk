# PR-120 — 남은 리스크 통합표

등급 정의는 요청서 §3과 동일. **PR120:** 문서 통합·게이트 명시; **코드/데이터 미변경**.

---

## 리스크 통합표

| 번호 | 영역 | 리스크 | 등급 | 근거 | PR120 처리 | 후속 처리 |
| ---: | --- | --- | --- | --- | --- | --- |
| R1 | public visibility | draft·비게시 public 노출 | — | `public-visibility.test.ts` pass | 유지·문서화 | 모니터링 |
| R2 | smoke | PR117 런타임 smoke 미완 | **High** (운영 전) | URL·표 미기입 | 게이트 문서 | 운영자 `smoke:public` |
| R3 | 운영 데이터 | fixture 49건 출처 미검수 | **High** | PR119 #3 | 게이트 | 공식 출처 대조 |
| R4 | 운영 데이터 | `lastVerifiedAt` 전량 null (fixture) | Medium | PR119 #2 | 이관표 | 운영자 기입 |
| R5 | 운영 데이터 | 팩스·전화·URL 미검증 | **High** (오류 시 Critical) | PR119 출처 표 | 게이트 | 수동 검수 |
| R6 | 청구서류 | insurerId null fallback 35 | Medium | PR119 #7 | 별도 PR | import dry-run |
| R7 | 사용자 피드백 | PR118 원문 없음 | Medium | intake 빈 표 | 양식 유지 | 수집 후 PR |
| R8 | migration | 스키마 변경 시 운영자 migrate | Medium | PR105 분리 | checklist G | `release:migrate` 승인 |
| R9 | Answer Assistant | allowlist·gate 우회 | — | tests·PR109 | 유지 | incident 시 OFF |
| R10 | Admin bulk | forbidden op·빈 선택 | — | PR107 tests | checklist D | spot-check |
| R11 | Auth/RBAC | 구조 변경 없음 | — | PR120 범위 외 | — | 별도 PR 시 |
| R12 | secret | 문서·로그 미포함 | — | PR116 금지 | — | — |
| R13 | 운영 DB | 실제 행 품질 미확인 | Medium | DB 미조회 | 게이트 | 스테이징 QA |

**Critical (코드 기준):** R1, R9, R10, R12 — **미관측**. **운영 전 High:** R2, R3, R5 (조건부 승격).

---

## PR120 반영 범위 (결정)

### 즉시 반영 (PR120)

- PR105~119 통합 문서·최종 체크리스트·판단표·backlog
- `tests/ops/pr120-pre-launch.test.ts`
- DEPLOYMENT / OPERATING_QA 링크

### 별도 PR

- schema/migration, Auth/RBAC, visibility, bulk 정책, AA allowlist 확대
- 운영 데이터 대량 수정·보험사/청구/지식 일괄 정리

### 운영 후

- Low UX, 고급 검색, 통계, 자동 링크 점검 등 → [PR-120-POST-LAUNCH-BACKLOG.md](./PR-120-POST-LAUNCH-BACKLOG.md)

### 정보 부족

- production `BASE_URL` smoke 결과
- 공식 출처 검증 완료 여부
- 사용자 1차 피드백 원문
