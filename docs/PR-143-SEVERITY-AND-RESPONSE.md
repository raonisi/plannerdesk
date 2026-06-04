# PR-143 — 심각도·장애 대응 단계

심각도 **정본**은 [PR-129-ISSUE-SEVERITY.md](./PR-129-ISSUE-SEVERITY.md). PR143은 제한 베타 지원·장애 플레이북 레이어이다.

## 심각도 (요약)

| 등급 | 기준 | 대응 |
| --- | --- | --- |
| **Critical** | public 노출·권한 우회·secret·운영 DB·PII·AA 우회 | 즉시 · 중단/rollback |
| **High** | 잘못된 청구정보·핵심 기능·링크 반복·AI safety·admin 오류 | 빠른 PR · 베타 보류 |
| **Medium** | 일부 데이터·UX·검색·모바일 | 운영 루틴 |
| **Low** | 오탈자·여백·라벨 | backlog |
| **Info** | 문의·제안 | PR 후보 |

정보 부족 시 **Low로 하향 단정 금지**.

## 장애 대응 10단계

1. **접수** — 유형·화면·재현·영향 (PII 제거)
2. **분류** — Critical/High/Medium/Low/Info
3. **격리** — public·권한·AI 즉시 제한 검토
4. **확인** — route·visibility·권한·metadata 로그
5. **조치** — 문구·데이터 PR·rollback·disable
6. **검증** — lint/typecheck/test/smoke
7. **공지** — 안전 문구만 (자동 발송 없음)
8. **기록** — [PR-129](./PR-129-OPERATIONAL-ISSUES-OPS.md) Registry
9. **재발 방지** — 테스트·체크리스트
10. **종료** — 재확인 완료
