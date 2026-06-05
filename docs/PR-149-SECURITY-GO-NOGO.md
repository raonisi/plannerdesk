# PR-149 — Security Go / Conditional Go / No-Go

| 판단 | 기준 |
| --- | --- |
| **Go** | Critical/High 0, visibility·권한·PII·secret 안전 |
| **Conditional Go** | Critical 0, High 별도 PR, PR150 조건부 |
| **No-Go** | public 노출·권한 우회·PII 저장·secret·AA 확대 |

**PR149-A 결과:** Conditional Go

**PR150:** Critical 1개라도 있으면 No-Go. High 잔존 시 Conditional Go 이하.

정보 부족은 Go 근거로 사용하지 않음.
