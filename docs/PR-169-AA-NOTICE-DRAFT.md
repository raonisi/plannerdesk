# PR-169 — Answer Assistant 고지 초안 계획

PR164 연계. SSOT: `AA_NOTICE_DRAFT_PLAN`

| 항목 | 기준 |
| --- | --- |
| 기능 성격 | 설계사 업무 보조 |
| 최종 판단 | 보험금·법률·의료·세무·투자 확정 금지 |
| 개인정보 | 고객정보·민감정보 입력 금지 |
| 원문 저장 | prompt/response/상담 원문 저장 금지 |
| 사용 대상 | verified planner + allowlist |
| 출력 제한 | 지급·가입·해지·공포 금지 |
| 공식 확인 | 약관·보험사 공식 자료 확인 |
| 중단 기준 | safety failure 시 제한 가능 |
