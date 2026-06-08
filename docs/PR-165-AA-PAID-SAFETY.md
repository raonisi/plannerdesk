# PR-165 — Answer Assistant 유료화 시 추가 안전 기준

유료 과금 시에도 다음을 유지한다 (구현 아님·문서 기준).

- verified planner + allowlist
- 지급 확정·가입 유도·공포 출력 차단 (PR164)
- PII 입력·출력 차단·metadata-only audit
- prompt/response 원문 저장 없음
- 최종 판단·공식 확인 고지 (PR147·PR153)
- rate limit·disable 기준
- AI 오류 환불 범위 → **법무 검토 필요**
