# PR-115 — 제한 배포 전 최종 Smoke + Rollback Drill

**목적:** PR105~PR114 기준을 **제한 배포 직전** 한 번 더 점검한다. 실제 deploy·rollback·migration·운영 DB 접촉은 하지 않는다.

**선행 문서 (PR114):**

- [PR-114-LIMITED-RELEASE-OPS.md](./PR-114-LIMITED-RELEASE-OPS.md)
- [PR-114-LIMITED-RELEASE-PRE-DEPLOY-CHECKLIST.md](./PR-114-LIMITED-RELEASE-PRE-DEPLOY-CHECKLIST.md)
- [PR-114-RELEASE-NOTES-TEMPLATE.md](./PR-114-RELEASE-NOTES-TEMPLATE.md)
- [PR-114-ROLLBACK-AND-CODEX-GATES.md](./PR-114-ROLLBACK-AND-CODEX-GATES.md)

**PR115 문서 세트:**

| 문서 | 용도 |
| --- | --- |
| [PR-115-FINAL-SMOKE-CHECKLIST.md](./PR-115-FINAL-SMOKE-CHECKLIST.md) | 최종 smoke (A~G) + 정적/런타임 명령 |
| [PR-115-ROLLBACK-DRILL.md](./PR-115-ROLLBACK-DRILL.md) | 문서형 rollback drill (실행 없음) |
| [PR-115-DEPLOY-DECISION-MATRIX.md](./PR-115-DEPLOY-DECISION-MATRIX.md) | 배포 가능 / 조건부 / 보류 / 중단 판단표 |

---

## PR115 vs PR114

| 구분 | PR114 | PR115 |
| --- | --- | --- |
| 시점 | 배포 전 준비·체크리스트·릴리즈 노트 | **최종** smoke + rollback **준비 상태** 점검 |
| rollback | 중단 조건 정의 | drill로 되돌릴 수 있는지 **사전 점검** |
| 산출 | 운영 문서 세트 | **판단표** + 검증 실행 기록 |

---

## 금지 (PR115)

- 신규 기능·product code 대규모 수정
- `npm run release:migrate`, Railway deploy, rollback 실행
- 운영 DB·allowlist·bulk·public 데이터 상태 변경
- `.env` / secret 접근·수정

---

## Antigravity 검수

- [ ] 최종 smoke가 배포 당일 체크 가능한가
- [ ] rollback drill이 실제 rollback 없이 충분한가
- [ ] 판단표 4단계가 운영 승인에 쓸 수 있는가
- [ ] product code diff 없음

**Codex:** 기본 생략. High/Critical 잔존 시 [PR-115-DEPLOY-DECISION-MATRIX.md](./PR-115-DEPLOY-DECISION-MATRIX.md) 및 PR-114 Codex gates 참조.
