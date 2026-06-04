# PR-117 — 제한 배포 후 Smoke (결과 기록)

**목적:** 제한 배포 **이후** public/admin·권한·visibility·Answer Assistant·bulk safety가 실제 환경에서 정상인지 smoke 결과를 **기록**한다. 기능 추가·deploy·rollback·migration은 본 PR 범위가 아니다.

**선행:** PR114 → PR115 → PR116 → **(운영자 deploy)** → **PR117**

| 문서 | 용도 |
| --- | --- |
| [PR-117-SMOKE-RESULT-RECORD.md](./PR-117-SMOKE-RESULT-RECORD.md) | 환경 메타 + public/admin/AA/bulk 결과표 |
| [PR-117-SMOKE-FAILURE-AND-DEPLOY-DECISION.md](./PR-117-SMOKE-FAILURE-AND-DEPLOY-DECISION.md) | 실패 등급·rollback trigger·배포 판단 |

**기록 양식:** [PR-117-SMOKE-RESULT-RECORD.md](./PR-117-SMOKE-RESULT-RECORD.md) — 운영자가 배포 URL·commit 확정 후 채움.

---

## Cursor vs 운영자 역할

| 작업 | Cursor (PR117) | 운영자 (deploy 후) |
| --- | --- | --- |
| smoke 결과표·실패 분류 문서 | ✅ | 채움/갱신 |
| `npm run lint` 등 로컬 검증 | ✅ | 동일 commit 재확인 권장 |
| `BASE_URL=... npm run smoke:public` | URL 없으면 **미실행** | 스테이징/production |
| admin/AA 런타임 | 절차만 문서화 | 승인 계정으로 spot-check |
| bulk 실행 | **금지** | **금지** (UI·확인만) |

---

## 금지

- deploy / rollback / `release:migrate`
- allowlist·role·운영 데이터·bulk 상태 변경
- secret·비밀번호·토큰 기록
- `.env` 값 열람·출력

---

## Antigravity 검수

- [ ] 결과표가 객관적·재현 가능한가
- [ ] Critical 항목(노출·권한 우회) 구분이 명확한가
- [ ] bulk/allowlist 실제 변경 없음

**Codex:** 기본 생략. [PR-117-SMOKE-FAILURE-AND-DEPLOY-DECISION.md](./PR-117-SMOKE-FAILURE-AND-DEPLOY-DECISION.md) 참조.

**다음 (사용자 피드백):** [PR-118-USER-FEEDBACK-OPS.md](./PR-118-USER-FEEDBACK-OPS.md)

**데이터 품질 QA (PR119):** [PR-119-OPERATIONAL-DATA-QUALITY-OPS.md](./PR-119-OPERATIONAL-DATA-QUALITY-OPS.md)
