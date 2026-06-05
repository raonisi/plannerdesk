# PR-152 — Critical 즉시 중단

`CRITICAL_HALT_CRITERIA` 기준. PR143·PR148 disable 연계.

즉시 중단: public→admin/planner, 미검수·관리자 노출, AA 무단 접근, PII·원문 저장, secret, migrate 자동 실행, 결제·가입 노출.

AI 중단 검토: 지급 확정·가입/해지 유도 출력.
