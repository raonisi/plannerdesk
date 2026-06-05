# PR-151 — External Beta Dry Run (PR151-A)

**위험도:** High · **성격:** PR150 이후 **가상 베타 운영 리허설** — 실행·배포·권한 변경 없음

## 목적

외부 제한 베타 **실제 실행 전**, 운영자 관점에서 public/planner/admin·Answer Assistant·데이터 고지·지원·build/CI 흐름을 **dry-run**한다.

## 범위 (PR151-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 역할 시나리오 | [PR-151-ROLE-SCENARIOS.md](./PR-151-ROLE-SCENARIOS.md) |
| public | [PR-151-PUBLIC-ROUTE-DRY-RUN.md](./PR-151-PUBLIC-ROUTE-DRY-RUN.md) |
| planner | [PR-151-PLANNER-ROUTE-DRY-RUN.md](./PR-151-PLANNER-ROUTE-DRY-RUN.md) |
| admin | [PR-151-ADMIN-ROUTE-DRY-RUN.md](./PR-151-ADMIN-ROUTE-DRY-RUN.md) |
| AA | [PR-151-ANSWER-ASSISTANT-DRY-RUN.md](./PR-151-ANSWER-ASSISTANT-DRY-RUN.md) |
| 데이터 | [PR-151-DATA-RESPONSIBILITY-DRY-RUN.md](./PR-151-DATA-RESPONSIBILITY-DRY-RUN.md) |
| 지원 | [PR-151-SUPPORT-INCIDENT-DRY-RUN.md](./PR-151-SUPPORT-INCIDENT-DRY-RUN.md) |
| build/CI | [PR-151-BUILD-CI-DRY-RUN.md](./PR-151-BUILD-CI-DRY-RUN.md) |
| 체크리스트 | [PR-151-DRY-RUN-CHECKLIST.md](./PR-151-DRY-RUN-CHECKLIST.md) |
| Go/No-Go | [PR-151-GO-NOGO-DECISION.md](./PR-151-GO-NOGO-DECISION.md) |
| PR152+ | [PR-151-FOLLOW-UP-ROADMAP.md](./PR-151-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-151-CODEX-REVIEW-SCOPE.md](./PR-151-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-151-STRUCTURE-ANALYSIS.md](./PR-151-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-151-IMPLEMENTATION-PLAN.md](./PR-151-IMPLEMENTATION-PLAN.md) |
| UI | `AdminExternalBetaDryRunPanel` |
| 코드 | `lib/ops/external-beta-dry-run.ts` |

## 비범위

- 실제 외부 공개·배포 · beta user 생성 · 초대 · 결제
- role·allowlist·운영 DB 변경

## 연계 (PR150~PR143)

| PR | 문서 |
| --- | --- |
| PR150 | [PR-150-EXTERNAL-RELEASE-DECISION-OPS.md](./PR-150-EXTERNAL-RELEASE-DECISION-OPS.md) |
| PR149 | [PR-149-SECURITY-FINAL-AUDIT-OPS.md](./PR-149-SECURITY-FINAL-AUDIT-OPS.md) |

PR150 Conditional Go 전제. **실제 외부 공개·배포 실행 없음.**

## Dry Run 판단 (PR151-A)

| 구분 | 판단 |
| --- | --- |
| External Beta Dry Run | **Conditional Go** |
| PR152 진입 | **Conditional Go** |
| PR157 실행 판단 | **No-Go** |
| Codex 전 overall | **Conditional Go** |

Critical(정적) 0 · partial: RBAC bulk·AA hardening · pending: Codex·Antigravity

## Codex

**제한검수 원칙 권장** — dry-run·접근 기대값 검증 PR
