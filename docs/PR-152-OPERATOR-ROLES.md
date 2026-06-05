# PR-152 — 운영자 역할별

`OPERATOR_ROLE_CHECKLIST` 기준.

| 역할 | 담당 | 금지 |
| --- | --- | --- |
| owner/operator | 실행·중단 | 운영 DB 수정 |
| super_admin | admin 확인 | secret 출력 |
| content_admin | 검수 확인 | allowlist 변경 |
| support operator | 제보 분류 | 고객정보 원문 |
| security reviewer | 접근·visibility | role 변경 |
| AI safety reviewer | AA 출력 | allowlist 확대 |
| release reviewer | PR150~151 | 배포 실행 |
