# PR-141 — External Beta Readiness / 제한 베타 공개 준비

**위험도:** Medium~High · **성격:** 준비·체크리스트 — **외부 공개 실행 없음**

## 목적

[PR-140](./PR-140-EXTERNAL-RELEASE-READINESS-OPS.md) **제한 베타 Conditional Go**를 운영 가능한 체크리스트·범위·수동 승인·중단 기준으로 구체화한다.

## 범위 (PR141-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 공개 범위 | [PR-141-BETA-SCOPE.md](./PR-141-BETA-SCOPE.md) |
| 사용자 기준 | [PR-141-BETA-USER-CRITERIA.md](./PR-141-BETA-USER-CRITERIA.md) |
| 안내 문구 | [PR-141-BETA-USER-COPY.md](./PR-141-BETA-USER-COPY.md) |
| 운영 상태값 | [PR-141-BETA-OPS-STATUS.md](./PR-141-BETA-OPS-STATUS.md) |
| 이슈 | [PR-141-BETA-ISSUES.md](./PR-141-BETA-ISSUES.md) |
| 체크리스트 | [PR-141-BETA-READINESS-CHECKLIST.md](./PR-141-BETA-READINESS-CHECKLIST.md) |
| 중단 | [PR-141-BETA-HALT-CRITERIA.md](./PR-141-BETA-HALT-CRITERIA.md) |
| 수동 승인 | [PR-141-MANUAL-APPROVAL-FLOW.md](./PR-141-MANUAL-APPROVAL-FLOW.md) |
| 구조 | [PR-141-STRUCTURE-ANALYSIS.md](./PR-141-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-141-IMPLEMENTATION-PLAN.md](./PR-141-IMPLEMENTATION-PLAN.md) |
| UI | `AdminLimitedBetaReadinessPanel` |
| 코드 | `lib/ops/limited-beta-readiness.ts` |

## 비범위

- 실제 외부 공개 · 베타 신청 폼 · 자동 승인 · 대량 초대 → [PR-146](./PR-140-DEFERRED-PR-ROADMAP.md) (설계)
- 결제 · allowlist 변경 · role 데이터 변경

## PR140 연계

- 제한 베타: **Conditional Go** (G1 smoke, 데이터·Registry)
- 공개 베타·유료화: PR141 범위 **아님**

## Codex

외부 공개·권한·PII·AA·visibility — **제한검수 권장** (코드 변경 없으면 문서 diff 중심).

## 후속

- [PR-142-TERMS-PRIVACY-PLAN-OPS.md](./PR-142-TERMS-PRIVACY-PLAN-OPS.md) — 약관·개인정보 **준비 계획** (확정·동의 없음)
- [PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md](./PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md) — 오류 제보·장애 대응 기준 (문의 폼·티켓 DB 없음)
