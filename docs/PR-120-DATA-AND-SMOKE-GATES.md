# PR-120 — 데이터·Smoke 운영 게이트 (PR117~119 통합)

정식 운영 **조건부** 전제. Cursor는 본 문서만 보완; **데이터·smoke 실행 없음**.

---

## Gate G1 — Post-deploy / pre-launch smoke (PR117)

| 항목 | 요구 | PR120 상태 |
| --- | --- | --- |
| `BASE_URL` smoke:public | 핵심 path PASS | **미완** |
| admin spot-check | bulk **미실행** | **미완** |
| AA allowlist spot-check | 가상 입력만 | **미완** |
| 기록 | [PR-117-SMOKE-RESULT-RECORD.md](./PR-117-SMOKE-RESULT-RECORD.md) | 양식만 |

**명령 (운영자):** `BASE_URL=https://<host> npm run smoke:public`

---

## Gate G2 — Operational data (PR119)

| 항목 | 요구 | PR120 상태 |
| --- | --- | --- |
| 공식 출처 | 팩스·헬프데스크·핵심 URL | **미완** |
| `lastVerifiedAt` | 정책 결정 | fixture 전량 null |
| 운영 DB QA | 스테이징 목록 | **미완** |
| 대량 수정 | 금지 | **준수** |

**표:** [PR-119-DATA-ISSUES-AND-SOURCES.md](./PR-119-DATA-ISSUES-AND-SOURCES.md)

---

## Gate G3 — Build / migration (PR105)

| 항목 | 요구 | PR120 상태 |
| --- | --- | --- |
| `npm run build` | migrate 없음 | **pass** |
| schema 변경 시 | `release:migrate` 선행 | 운영자 판단 |
| CI | build only | **pass** |

---

## PR118 (병행)

- 피드백 원문 없음 → [PR-118-USER-FEEDBACK-INTAKE.md](./PR-118-USER-FEEDBACK-INTAKE.md)  
- 수집 후 UX PR 별도; **G1~G3와 독립**

---

## 승격 조건

**G1 + G2 + G3** 완료 서명 후 → [PR-120-LAUNCH-DECISION.md](./PR-120-LAUNCH-DECISION.md) 「정식 운영 가능」 검토.
