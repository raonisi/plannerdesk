# PR-170 — Codex 제한검수

결제 구조·권한·개인정보·보안 연계로 **Codex 제한검수 필수** 권장.

## 검수 범위

- 결제·PG·webhook 구현 부재
- checkout/billing/subscription route 부재
- 가격표·구독·유료 role 확정 부재
- 결제정보 직접 저장 구조 부재
- Auth/RBAC·AA 접근 확대 부재
- DB/schema/package 변경 부재
- 결제정보 비저장 원칙
- No-Go 기준
- PR171 진입

## 제외

- 문구 스타일
- PG 상표 나열
- 후속 PR 번호 가정
