# PR-123 — 운영자 실수 방지 체크리스트

**사용 시점:** 콘텐츠 등록·검수·공개·bulk·배포 **직전**.  
**연계:** [OPERATING_QA_CHECKLIST.md](./OPERATING_QA_CHECKLIST.md) · [PR-120-FINAL-LAUNCH-CHECKLIST.md](./PR-120-FINAL-LAUNCH-CHECKLIST.md)

---

## 체크리스트

| # | 항목 | 반영 |
| ---: | --- | --- |
| 1 | 공식 출처 없이 **최신성·정확성을 단정**하지 않았는가 | PR122·PR123 출처 기준 |
| 2 | **미검수(draft)** 항목을 public에 **공개**하지 않았는가 | visibility guard |
| 3 | **비공개(unpublished)** 항목이 public에 **노출**되지 않는가 | `/directory` 등 spot check |
| 4 | **일괄작업 대상 수**를 확인했는가 | bulk selection count |
| 5 | **빈 선택** 상태에서 실행되지 **않는**가 | bulk UI + server |
| 6 | **전체 대상** 작업이 실수로 실행되지 **않는**가 | confirm dialog |
| 7 | **권한 없는** 사용자가 admin·bulk에 접근할 수 **없는**가 | RBAC·layout guard |
| 8 | 보험·금융 문구에 **단정·과장·공포 조장**이 없는가 | claim·knowledge 기준 |
| 9 | **secret / .env** 값을 문서·로그·Registry에 남기지 **않았**는가 | PR121 PII rules |
| 10 | 운영 데이터 **대량 수정 전** 별도 승인·PR124 분리를 확인했는가 | PR122 handoff |
| 11 | **Answer Assistant** allowlist·gate를 임의로 확대하지 **않았**는가 | AA High-risk |
| 12 | payout·손해사정·의료·고객 PII를 admin 필드에 넣지 **않았**는가 | safety-copy |
| 13 | bulk **setPublishedTrue** 전 row별 verificationStatus를 확인했는가 | bulk policy |
| 14 | 배포 전 **public visibility** 테스트·smoke 계획을 확인했는가 | PR117/120 |

---

## Critical 즉시 중단 (별도 긴급 PR)

- draft·unpublished가 public에 노출됨
- 무검수 대량 공개 실행됨
- 권한 우회·세션 이상
- allowlist·AA gate 무분별 ON

---

## 서명 (운영 기록)

| 필드 | 값 |
| --- | --- |
| 점검 ID | OPS-CHK-YYYY-MM-DD-___ |
| 담당 | |
| 범위 | 등록 / 검수 / 공개 / bulk / 배포 |
| 결과 | pass / fail |
| follow-up | Registry ID · PR 번호 |
