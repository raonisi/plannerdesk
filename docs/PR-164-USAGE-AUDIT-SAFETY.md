# PR-164 — Usage Audit 안전 기준

- prompt/response/query 원문 저장 **없음**
- `FORBIDDEN_USAGE_AUDIT_FIELDS` 로 금지 필드 정의
- safety event는 유형·등급 중심 metadata
- public 노출 없음
- retention cleanup 기준 존재 (`retention-config.ts`)

**실패:** audit에 원문·고객정보 필드 추가 또는 public 노출
