# PR-133 — 데이터 변경 이력 관리

**위험도:** High · **분기:** **B** (메타데이터·문서·admin UI) + **PR133-B** (DB foundation 별도)

## 목적

운영 데이터(보험사·청구서류·지식·링크·공시·고객문구)의 **누가·언제·무엇을** 추적 기준을 정리하고, 기존 row 메타데이터를 관리자 화면에 안전하게 표시한다.

## 이번 PR133-A (완료 범위)

| 항목 | 내용 |
| --- | --- |
| 조사 | 전용 `AuditLog` **없음** · `AnswerAssistantUsageAudit`만 존재 |
| 활용 | `createdAt` / `updatedAt` / `*ById` / 검수·게시 상태 |
| UI | `AdminChangeHistoryMetadataPanel` — admin edit 5종 |
| 문서 | 필드·PII·bulk·AA 분리 기준 |
| 금지 | schema migration · audit table 생성 |

## PR133-B (별도 High-risk PR)

- `ContentChangeEvent` 또는 `AdminAuditLog` 모델 설계
- before/after **요약** JSON (원문·PII 금지)
- bulk run correlation id
- `/admin/audit-logs` (RBAC: super_admin) — [RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md) 예정

## 관련 문서

- [PR-133-STRUCTURE-ANALYSIS.md](./PR-133-STRUCTURE-ANALYSIS.md)
- [PR-133-B-DB-FOUNDATION-DESIGN.md](./PR-133-B-DB-FOUNDATION-DESIGN.md)
- [PR-133-PII-STORAGE-RULES.md](./PR-133-PII-STORAGE-RULES.md)
- [PR-133-IMPLEMENTATION-PLAN.md](./PR-133-IMPLEMENTATION-PLAN.md)
- [PR-123-BULK-OPERATIONS.md](./PR-123-BULK-OPERATIONS.md)
- [PR-107-ADMIN-BULK-SAFETY-QA.md](./PR-107-ADMIN-BULK-SAFETY-QA.md)

## Codex 제한검수

**권장** — audit·PII·public 분리·PR133-B 경계.
