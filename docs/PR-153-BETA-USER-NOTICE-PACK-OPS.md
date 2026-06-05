# PR-153 — Beta User Notice Pack (PR153-A)

**위험도:** Medium~High · **성격:** 베타 사용자 **안내문 템플릿** — 실제 발송 없음

## 목적

제한 베타 사용자에게 전달할 12종 안내문(시작·기능·PII·데이터·청구·AA·제보·점검·해제·종료·유료화·변경)을 안전하게 준비한다.

## 범위 (PR153-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 구성 | [PR-153-NOTICE-PACK-COMPOSITION.md](./PR-153-NOTICE-PACK-COMPOSITION.md) |
| 템플릿 | [PR-153-NOTICE-TEMPLATES.md](./PR-153-NOTICE-TEMPLATES.md) |
| 금지 표현 | [PR-153-FORBIDDEN-EXPRESSIONS.md](./PR-153-FORBIDDEN-EXPRESSIONS.md) |
| 판단 | [PR-153-NOTICE-READINESS.md](./PR-153-NOTICE-READINESS.md) |
| PR154+ | [PR-153-FOLLOW-UP-ROADMAP.md](./PR-153-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-153-CODEX-REVIEW-SCOPE.md](./PR-153-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-153-STRUCTURE-ANALYSIS.md](./PR-153-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-153-IMPLEMENTATION-PLAN.md](./PR-153-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaUserNoticePackPanel` |
| 코드 | `lib/ops/beta-user-notice-pack.ts` |

## 비범위

- 이메일·SMS·카카오·Slack·webhook 발송
- beta user·role·allowlist·운영 DB 변경

## 연계

| PR | 문서 |
| --- | --- |
| PR152 | [PR-152-BETA-OPERATOR-CHECKLIST-OPS.md](./PR-152-BETA-OPERATOR-CHECKLIST-OPS.md) |
| PR147 | [PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md](./PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md) |

**실제 발송·외부 공개 실행 없음.**

## 판단 (PR153-A)

| 구분 | 판단 |
| --- | --- |
| Notice Pack | **Conditional Ready** |
| 외부 발송 | **Not Ready** |
| PR154 진입 | **Conditional Ready** |
| Codex 전 | **Conditional Ready** |

Critical(정적) 0 · 약관(P142) 법무 미확정

## Codex

**조건부 제한검수 권장** — 사용자 전달 문구
