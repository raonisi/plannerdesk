# PR-144 — 구현 계획

1. PR140~143 완료 — 랜딩 검수 필요
2. 기존 `/`·footer 검수 — 금지 문구 없음 확인
3. `public-landing-safety.ts` + admin 패널 + 문서
4. 홈·footer 안내 문구 최소 보완
5. static test — 금지 문구·패널·결제 route
6. 보류: 신규 랜딩·신청 폼·결제

## 영향

| 항목 | 영향 |
| --- | --- |
| public visibility | guard 미변경; 안내 문구만 |
| RBAC/Auth | 없음 |
| DB | 없음 |
| PII 수집 | 없음 |
| 결제 | 없음 |
| AA | 확대 없음 |

## Codex

High — 외부 노출 문구·visibility 주제. 코드 guard 변경 없으면 docs+copy 중심 검수.
