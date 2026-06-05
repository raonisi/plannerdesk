# PR-148 — 금지 출력

| 유형 | 처리 |
| --- | --- |
| 보험금 확정·무조건 지급/부지급 | 금지 |
| 가입·해지 유도·공포 조장 | 금지 |
| 법률·세무·의료 확정 | 금지 |
| 투자 매수·매도 | 금지 |
| PII 재노출·내부·secret | 금지 |

구현: `lib/answer-assistant/output-safety.ts` — `OUTPUT_BLOCKED_PHRASES`, PII 패턴.

로직 약화 금지. 강화는 PR148-B.
