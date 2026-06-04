# PR-139-B — RBAC Foundation / Role Model Refactor (설계만)

**상태:** PR139-A에서 **미구현** · Critical-risk 별도 PR

## 트리거 (PR139-C 분기)

- 신규 `reviewer` / `data_admin` **Prisma role** 필요
- `content_admin`에서 publish·bulk publish **코드 분리** 필요
- 권한 관리 UI · User.role 일괄 변경 API

## 범위 후보

| 항목 | 위험 |
| --- | --- |
| Role enum 확장 | DB migration |
| `canReviewContent` · read-only admin | Auth + layout |
| Bulk action per-role matrix in DB | migration |
| Audit log for role changes | PII·보안 |

## PR139-A와의 관계

PR139-A는 **현행 코드 스냅샷** 문서화만. B 착수 전 Antigravity + Codex **제한검수 필수**.

## 금지 (B에서도 검토 필요)

- allowlist 자동 확대
- public visibility guard 약화
- UI-only 권한
