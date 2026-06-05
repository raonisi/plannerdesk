# PR-151 — External Beta Dry Run Checklist

`EXTERNAL_BETA_DRY_RUN_CHECKLIST` 기준.

운영자 실행 전(가상) 체크:

1. public/planner/admin route 안전
2. RBAC 경계 (content_admin bulk partial 주의)
3. AA verified+allowlist (partial — hardening)
4. 베타≠AI 분리
5. audit metadata-only
6. PII·데이터·청구 고지
7. PR143 분류·Critical 중단
8. build/CI 안전
9. 결제·가입·발송 없음
10. role/allowlist 실변경 없음
11. **Codex·Antigravity pending**
