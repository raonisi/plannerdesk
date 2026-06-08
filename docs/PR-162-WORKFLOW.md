# PR-162 — 처리 흐름

1. **접수** — PII·secret 포함 여부 확인 → 포함 시 원문 미저장·즉시 비식별화
2. **분류** — Critical/High/Medium/Low; public/admin/AA/PII/secret은 보수적 Critical
3. **초기 조치** — Critical 즉시 중단 · High 공식 확인 후 보완 · Medium/Low backlog
4. **확인** — 데이터는 공식 출처 확인 전 확정 금지; AA는 safety 유형·비식별 요약만
5. **후속 PR** — 권한 hotfix · 데이터 PR168 · AI PR164 · UI PR163
6. **종료** — PII 없는 metadata 요약만; 고객정보·secret 미기록
