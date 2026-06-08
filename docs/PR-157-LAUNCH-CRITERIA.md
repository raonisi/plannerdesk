# PR-157 — 제한 베타 실행 판단 기준

| 판단 | 기준 | PR157-A 해당 |
| --- | --- | --- |
| Launch | Critical 0, High 0, Codex 통과, smoke/regression/red-team 런타임 포함, 운영자·안내 완료 | **아니오** |
| Conditional Launch | Critical 0, High·gap을 제한 조건·후속 PR로 분리, Codex 필요 | **예** |
| Hold | Critical 0이나 핵심 영역 실행 전 확인 부족 | 즉시 실행에 해당 |
| No-Go | Critical 존재, public/admin/AI 우회, PII·secret·운영 DB 위험 | **아니오** |

원칙:

- Codex 제한검수 전 Launch 금지
- Critical 1개라도 있으면 No-Go
- High 잔존 시 Conditional Launch 이하
- 정식 공개·유료화는 PR157에서 Go 판단하지 않음
