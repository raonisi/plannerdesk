# PR-164 — 입출력 차단 기준

## 입력

고객명·연락처·계약번호 → PERSONAL_INFO/CONTRACT_INFO. 상담·카카오 원문 → PERSONAL_INFO. secret/env/token/usage audit 원문 → PROMPT_INJECTION. 이 서류만 단정 → CLAIM_JUDGMENT. 법률·세무 확정 → LOSS_ADJUSTMENT.

## 출력

지급·부지급 확정, 이 서류만, 가입·해지 강요, 공포, 승소·세무 확정, 매수·매도, system prompt, api key → `validateGeneratedDraft` 차단.

## 권장 안전 문구

`OUTPUT_SAFE_WORDING_HINTS` (lib/answer-assistant/output-safety.ts) 참고.
