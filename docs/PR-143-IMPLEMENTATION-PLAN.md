# PR-143 — 구현 계획

1. PR141·PR142 완료 — 제한 베타·약관 준비 후 지원·장애 기준 필요
2. PR-129 심각도 정본 유지 — PR143은 플레이북 레이어
3. `lib/ops/support-incident-playbook.ts` + 관리자 패널 + 문서 + static test
4. 보류: 문의 폼·티켓 DB·알림·CS 툴
5. 별도 PR: PR144~150 (랜딩·결제·베타 신청·AI 정책·보안 감사·공개 판단)

## 영향

| 항목 | 영향 |
| --- | --- |
| public visibility | 없음 |
| RBAC/Auth | 없음 |
| DB/Migration | 없음 |
| 개인정보 수집 | 없음 (입력 금지 안내만) |
| 외부 발송 | 없음 |
| Answer Assistant | 없음 (제한 유지 문서 연계) |

## 검증

`npm run lint` · `typecheck` · `test` · `build` (migration 없음)

## Codex

High/Critical 리스크 문서화 — **제한검수 권장**. 코드 권한·visibility 변경 없으면 조건부 생략 가능.
