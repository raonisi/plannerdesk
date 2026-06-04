# PR-141 — 베타 수동 승인 흐름 (문서만)

**금지:** 신청 폼 · 자동 승인 · 대량 초대 · 이메일/SMS 발송 (PR141)

## 절차

1. PR141 체크리스트 + PR140 Conditional Go 확인
2. 베타 후보: **기존 계정** + 운영자 수동 role/검증 (공개 가입 없음)
3. [PR-129 OPS Registry](./PR-129-ISSUE-INTAKE-REGISTRY.md)에 온보딩·연락 채널 기록 (PII 최소)
4. Answer Assistant: allowlist env **운영자 수동만** (PR141 변경 없음)
5. Critical 이슈 → [PR-141-BETA-HALT-CRITERIA.md](./PR-141-BETA-HALT-CRITERIA.md)

## 후속 PR

- [PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md](./PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md) — 신청 흐름·상태값·PII 금지 (**PR146-A 완료**, 폼 미구현)
- **PR146-B~G** — 신청 폼·데이터 모델·승인 UI (별도 High/Critical)
