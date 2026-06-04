# PR-115 — Rollback Drill (문서형)

**정의:** 실제 Railway rollback·DB revert를 **실행하지 않고**, 제한 배포 전에 “문제 발생 시 되돌릴 수 있는가”를 점검하는 테이블 드릴이다.

**연관:** [PR-114-ROLLBACK-AND-CODEX-GATES.md](./PR-114-ROLLBACK-AND-CODEX-GATES.md), [PR-115-DEPLOY-DECISION-MATRIX.md](./PR-115-DEPLOY-DECISION-MATRIX.md)

---

## Drill 1 — 즉시 중단 조건 인지

각 항목에 대해 **담당자 이름**과 **연락/에스컬레이션**을 배포 전에 기입한다. (실제 트리거 발생 시 drill이 아닌 incident.)

| # | 즉시 중단 조건 | 담당 | 연락 | 배포 전 리허설 (Y/N) |
| --- | --- | --- | --- | --- |
| 1 | public 주요 화면 접근 실패 | | | |
| 2 | admin 접근 제어 실패 | | | |
| 3 | 미검수/비공개 데이터 public 노출 | | | |
| 4 | 관리자 전용 데이터 public 노출 | | | |
| 5 | Admin bulk 대량 상태변경 가능 | | | |
| 6 | Answer Assistant allowlist 우회 | | | |
| 7 | output safety 우회 | | | |
| 8 | build/migration 경계 붕괴 | | | |
| 9 | 운영 DB 의도치 않은 접촉 | | | |
| 10 | secret/.env 노출 의심 | | | |
| 11 | lint/typecheck/test/build 실패 원인 불명 | | | |

**리허설:** 팀이 위 표를 읽고 중단 조건·1차 대응(배포 중단, incident 채널)을 **구두로** 확인한다.

---

## Drill 2 — Rollback 전 확인 (기입만)

배포 **직전** 아래를 채운다. (실제 rollback 아님.)

| 필드 | 값 (배포 전 기입) |
| --- | --- |
| 마지막 정상 production commit SHA | |
| 이번 배포 대상 commit SHA | |
| Railway 이전 deployment ID (알면) | |
| 이번 배포에 migration 포함? | Yes / No |
| migration ID (있으면) | |
| 운영 데이터 수동/bulk 변경 예정? | **No** (기본) |
| 캐시/환경변수 변경 예정? | |
| 사용자 공지 필요? | |
| 승인자 | |

**확인 질문 (Yes 필요):**

- [ ] 이전 정상 SHA로 Railway redeploy 가능한가?
- [ ] migration을 이번에 안 돌리면 app-only rollback으로 충분한가?
- [ ] migration을 돌렸다면 DB rollback 절차·담당 DBA가 정의되어 있는가?

---

## Drill 3 — Rollback 후 확인 (시나리오)

**가정 시나리오:** “배포 후 public `/directory` 500” — 실제 rollback 하지 않고 체크리스트만 검토.

| # | rollback 후 확인 | 절차 문서화됨? (Y/N) |
| --- | --- | --- |
| 1 | public smoke 재실행 (`smoke:public`) | |
| 2 | admin 로그인·RBAC | |
| 3 | Answer Assistant gate/allowlist | |
| 4 | Admin bulk forbidden op | |
| 5 | 오류 로그·Railway metrics | |
| 6 | 릴리즈 노트·incident 기록 | |

---

## Drill 4 — Answer Assistant 임시 비활성 (문서만)

실행하지 않고 **절차만** 확인:

- [ ] gate OFF 방법 문서화됨 ([PR-109](./PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md))
- [ ] allowlist env 변경은 승인·재배포 필요함을 인지
- [ ] route 제거 없이 접근만 차단하는 정책 이해

---

## Drill 완료 기준

- [ ] Drill 1~3 표 기입 또는 N/A 사유
- [ ] 실제 rollback·migrate·bulk **미실행** 확인
- [ ] [판단표](./PR-115-DEPLOY-DECISION-MATRIX.md)에 drill 완료 기록

---

## Drill 서명

| 역할 | 이름 | 일시 | 결과 |
| --- | --- | --- | --- |
| 운영 | | | pass / fail |
| 기술 | | | pass / fail |
