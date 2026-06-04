# PR-126 — 접근·Output Safety·Usage Audit·Rate·Retention 기준

---

## 접근 제한 기준

| 항목 | 정상 | 실패 |
| --- | --- | --- |
| verified planner | verified + approved만 | 미인증·미승인 접근 |
| allowlist | allowlist userId만 생성 | allowlist 외 생성 |
| beta 확대 | env **수동**만 | 자동 확대·조건부 auto-apply |
| 서버 가드 | `getVerifiedAnswerAssistantAccess` | UI 숨김만 |
| PR126 변경 | allowlist/Auth **없음** | RBAC 변경 |

---

## Output Safety 기준

| 항목 | 정상 | 실패 |
| --- | --- | --- |
| 단정 표현 | 확인형 | 보험금 지급 확정 |
| 가입 유도 | 없음 | 특정 가입 권유 |
| 공포 조장 | 없음 | 불안 유발 중심 |
| 민감정보 | 입력·저장 유도 없음 | 주민번호·계약번호 요청 |
| 고위험 | 차단·안내 | 우회 |

**금지 표현 예:** 무조건 지급 · 반드시 가입 · 보험금 확정 · 가입하지 않으면 큰일 · 고객 정보 입력 · 주민번호/계약번호

**코드:** `lib/answer-assistant/output-safety.ts`, `validation.ts`

---

## Usage Audit 기준

| 항목 | 정상 | 실패 |
| --- | --- | --- |
| 기록 범위 | metadata-only | 상담 원문 |
| 식별 | userId (truncated display) | 불필요 PII |
| 금지 | query, draft, rawOutput, phone… | 원문·고객정보 |

**허용 metadata 예:** timestamp, outcome, blockedReason, candidateCount, evidenceSourceIds, rateLimitBlocked

**코드:** `FORBIDDEN_USAGE_AUDIT_FIELDS` in `usage-log.ts`

---

## Rate Limit 기준

| 항목 | 정상 |
| --- | --- |
| 사용자별 제한 | perMinute / perDay |
| abuse cooldown | blocked·injection 누적 시 |
| 차단 기록 | `rateLimitBlocked` flag |
| PR126 | **완화 금지** |

---

## Retention 기준

| 항목 | 정상 |
| --- | --- |
| usage audit | 기본 180일 (`ANSWER_ASSISTANT_USAGE_AUDIT_RETENTION_DAYS`) |
| feedback | 365일 / critical 730일 |
| cleanup execute | 기본 **false** |
| confirm | `DELETE-EXPIRED-DATA` phrase |
| PR126 | **완화 금지** |

---

## 리스크 등급 · 처리

| 등급 | 기준 | 처리 |
| --- | --- | --- |
| **Critical** | allowlist·권한 우회, PII 저장, safety 심각 우회 | 즉시 gate OFF · rollback |
| **High** | rate limit 우회, audit 범위 불명 | 확대·배포 보류 |
| **Medium** | 문서·테스트 갭 | 보완 후 재관찰 |
| **Low** | 리포트 양식 | 후속 개선 |
