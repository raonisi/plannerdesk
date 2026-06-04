# PR-136-B — Admin Ops Analytics DB (설계만 · High-risk)

**상태:** 보류

## 분리 사유

자동 운영 통계·리포트 스냅샷 저장은 다음을 수반한다.

- 신규 테이블 또는 materialized 집계
- migration·인덱스·백필
- RBAC (누가 리포트 조회 가능한지)
- 운영 DB 부하·PII 유출 방지

## PR136-A 대안

- 수동 템플릿 + 기존 `buildAdminDashboardSnapshot` 참고 숫자
- 영역별 admin route에서 직접 확인

## PR136-B 착수 전 결정

1. 집계 주기 (일/주/월) 및 보존 기간
2. 저장 필드: counts by status only — **no PII**
3. AA usage: aggregate metadata only
4. public route에 API **노출 금지**

## Codex 제한검수

postgres-pro · security-auditor · gdpr-ccpa-compliance · reviewer
