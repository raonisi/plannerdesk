# PR-123 — 피드백·데이터 최신성 결과 처리 기준

**피드백:** [PR-121-USER-FEEDBACK-OPS.md](./PR-121-USER-FEEDBACK-OPS.md)  
**최신성:** [PR-122-DATA-FRESHNESS-OPS.md](./PR-122-DATA-FRESHNESS-OPS.md)

---

## 사용자 피드백 처리

| 피드백 유형 | 처리 기준 | 연결 PR |
| --- | --- | --- |
| **데이터 오류** | 공식 출처 확인 후 수정 후보 분류 | **PR124** 또는 별도 데이터 PR |
| **데이터 누락** | 누락 여부 확인 후 보완 후보 | **PR124** |
| **검색 불편** | 검색·탐색 UX 개선 후보 | **PR127** |
| **업무 링크 오류** | 공식 출처 확인 후 수정 후보 | **PR128** |
| **관리자 불편** | Admin UI 개선 후보 | 운영 개선 PR |
| **권한 문제** | **High/Critical** — 즉시 분류 | **별도 High-risk Auth PR** |
| **Answer Assistant** | 안전성 검수 후보 | **PR126** 또는 AA 전용 PR |
| **문구 개선** | 즉시 반영 가능 (최소 diff) | **PR127** / 운영 개선 PR |
| **오류(버그)** | 재현·심각도 분류 | 버그fix PR |
| **기능 요청** | backlog | [PR-120-POST-LAUNCH-BACKLOG.md](./PR-120-POST-LAUNCH-BACKLOG.md) |

### Registry 워크플로

1. [PR-121-FEEDBACK-INTAKE-REGISTRY.md](./PR-121-FEEDBACK-INTAKE-REGISTRY.md)에 `FB-YYYY-NNN` 등록
2. [심각도](./PR-121-FEEDBACK-SEVERITY-AND-PRIORITY.md) · [유형](./PR-121-FEEDBACK-TYPES.md) 분류
3. **Critical/High** — 일반 backlog로 미루지 않음
4. PII 포함 피드백 — [PR-121-SENSITIVE-DATA-RULES.md](./PR-121-SENSITIVE-DATA-RULES.md): Registry에 **최소 필드**, 원문 별도 보관 금지·마스킹

### AA beta feedback 구분

- `/admin/answer-assistant/feedback` — metadata-only DB
- PR121 Registry와 **통합하지 않음** (유형·라우팅 별도)

---

## 데이터 최신성 점검 결과 처리

PR122 [상태값](./PR-122-DATA-STATUS-VALUES.md) → Admin 조치:

| 상태 | 처리 |
| --- | --- |
| **정상** | 유지 — `lastVerifiedAt`·출처 기록 |
| **확인 필요** | 운영자 확인 후 상태 재분류 (점검표 갱신) |
| **수정 필요** | **PR124** 또는 별도 데이터 수정 PR — Admin에서 **임의 대량 수정 금지** |
| **보류** | 공식 출처 확인 전 **public 노출 제한** 검토 (unpublished) |
| **비공개** | public 미노출 유지 |
| **검수 대기** | 공개 전 검수 — draft/unpublished |

### PR122 → PR124 핸드오프

- [PR-122-PR124-HANDOFF-CRITERIA.md](./PR-122-PR124-HANDOFF-CRITERIA.md)
- **public visibility 위험** → PR124 아님 — **별도 긴급 PR**
- 점검표 `CHK-YYYY-MM`: [PR-122-FRESHNESS-CHECK-SHEET.md](./PR-122-FRESHNESS-CHECK-SHEET.md)

---

## PR 번호 요약 (운영 라우팅)

| PR | 역할 |
| --- | --- |
| **PR122** | 데이터 **최신성 점검 루틴** (문서·점검표) |
| **PR123** | **관리자 운영 매뉴얼** (본 PR) |
| **PR124** | 데이터 **보완·수정** (출처 확인 후) |
| **PR126** | Answer Assistant |
| **PR127** | UX·문구·검색 |
| **PR128** | 업무 링크 데이터 |

**상세:** [PR-121-FEEDBACK-TO-PR-ROUTING.md](./PR-121-FEEDBACK-TO-PR-ROUTING.md)
