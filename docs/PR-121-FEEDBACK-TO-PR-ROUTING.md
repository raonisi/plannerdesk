# PR-121 — 피드백 → 후속 PR 연결 기준

**번호는 예시** — 실제 PR 생성 시 범위에 맞게 조정.

---

## 라우팅 표

| 처리 PR | 범위 | 피드백 유형 | 심각도 |
| --- | --- | --- | --- |
| **PR122** | 운영 데이터 **최신성 점검 루틴** (문서) | 데이터 오류/누락 추적 | Medium~High |
| **PR123** | UX·문구·검색·빈 상태·화면 정리 | 오류(경미), 문구, 검색, 화면 복잡 | Low~Medium |
| **PR124** | 운영 데이터 **보완·수정** (승인 후) | 데이터 누락/오류 확정 | Medium~High |
| **PR119/120 게이트** | smoke·출처·launch | 배포 전 차단 | High |
| **Auth PR** | RBAC·세션 | 권한 문제 | High~Critical |
| **AA PR** | allowlist·gate·output | Answer Assistant | High~Critical |
| **PR-120-POST-LAUNCH-BACKLOG** | 기능 요청·자동화 | 기능 요청 | Low |

---

## PR119 이슈 → 피드백 연계

| PR119 # | Registry 유형 | 처리 PR |
| ---: | --- | --- |
| 2,3,4,5 | 데이터 누락/오류 | PR124 |
| 7 | 데이터 누락 | PR124 + import |
| 8,10,11 | 정보 부족 | Registry + 스테이징 QA |

---

## 즉시 반영 vs 별도 PR

| 즉시 반영 (PR122 등) | 별도 PR 필수 |
| --- | --- |
| 문구 1~2줄 | schema/migration |
| 라벨·빈 상태 | Auth/RBAC |
| 정렬·여백 | visibility guard 변경 |
| | allowlist·bulk 실행 |
| | 운영 DB 대량 수정 |

---

## Registry 기입 예시

| ID | 유형 | 심각도 | 처리 PR | 상태 |
| --- | --- | --- | --- | --- |
| FB-2026-001 | 문구 이해 어려움 | Low | PR123 | 반영 예정 |
| FB-2026-002 | 데이터 오류 | High | PR124 | 보류 (출처 확인) |
