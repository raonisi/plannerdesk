# PR-152 — Beta Operator Checklist (PR152-A)

**위험도:** Medium~High · **성격:** 제한 베타 **운영자 실행 체크리스트** — 실행·배포·권한 변경 없음

## 목적

PR151 dry-run 이후, 운영자가 제한 베타를 실제로 열기 전 확인할 **실행 전/중/후** 항목·중단 기준·기록 기준을 정리한다.

## 범위 (PR152-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 실행 전 | [PR-152-PRE-LAUNCH-CHECKLIST.md](./PR-152-PRE-LAUNCH-CHECKLIST.md) |
| 실행 중 | [PR-152-DURING-LAUNCH-CHECKLIST.md](./PR-152-DURING-LAUNCH-CHECKLIST.md) |
| 실행 후 | [PR-152-POST-LAUNCH-CHECKLIST.md](./PR-152-POST-LAUNCH-CHECKLIST.md) |
| 역할별 | [PR-152-OPERATOR-ROLES.md](./PR-152-OPERATOR-ROLES.md) |
| 중단 | [PR-152-CRITICAL-HALT.md](./PR-152-CRITICAL-HALT.md) |
| 기록 | [PR-152-OPERATION-RECORD.md](./PR-152-OPERATION-RECORD.md) |
| 안내 | [PR-152-USER-NOTICE-CRITERIA.md](./PR-152-USER-NOTICE-CRITERIA.md) |
| 판단 | [PR-152-OPERATOR-READINESS.md](./PR-152-OPERATOR-READINESS.md) |
| PR153+ | [PR-152-FOLLOW-UP-ROADMAP.md](./PR-152-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-152-CODEX-REVIEW-SCOPE.md](./PR-152-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-152-STRUCTURE-ANALYSIS.md](./PR-152-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-152-IMPLEMENTATION-PLAN.md](./PR-152-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaOperatorChecklistPanel` |
| 코드 | `lib/ops/beta-operator-checklist.ts` |

## 비범위

- 실제 외부 공개·배포 · beta user · 초대 · 결제
- role·allowlist·운영 DB 변경

## 연계

| PR | 문서 |
| --- | --- |
| PR151 | [PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md](./PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md) |
| PR150 | [PR-150-EXTERNAL-RELEASE-DECISION-OPS.md](./PR-150-EXTERNAL-RELEASE-DECISION-OPS.md) |

**실제 제한 베타 실행 없음.** 실행 판단은 PR157.

## 운영자 판단 (PR152-A)

| 구분 | 판단 |
| --- | --- |
| 체크리스트 준비 | **Conditional Ready** |
| 실행 전 준비 | **Conditional Ready** |
| PR157 실행 | **Not Ready** |
| Codex 전 overall | **Conditional Ready** |

Critical(정적) 0 · pending: PR153 안내문·Codex

## Codex

**조건부 제한검수 권장**
