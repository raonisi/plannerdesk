# PR-117 — Smoke 실패 분류 · Rollback Trigger · 배포 판단

**연관:** [Smoke 결과 기록](./PR-117-SMOKE-RESULT-RECORD.md), [PR-115-ROLLBACK-DRILL.md](./PR-115-ROLLBACK-DRILL.md), [PR-114-ROLLBACK-AND-CODEX-GATES.md](./PR-114-ROLLBACK-AND-CODEX-GATES.md)

---

## 실패 등급 (Smoke)

| 등급 | 기준 | 대응 |
| --- | --- | --- |
| **Low** | 문구, 여백, 단순 UI | 다음 보완 PR |
| **Medium** | 일부 화면·필터 불안정 | 조건부 보류, 수정 후 재 smoke |
| **High** | 핵심 route 오류, admin 오류, 권한 불명 | **배포 보류** |
| **Critical** | public 노출·권한 우회·운영 데이터·secret 의심 | **배포 중단**, rollback 검토 |

---

## Rollback / 배포 보류 Trigger (Smoke 기준)

| # | 조건 | 등급 | 조치 |
| --- | --- | --- | --- |
| T1 | `smoke:public` 핵심 path FAIL (/, directory, claim-documents, knowledge) | High | 보류, 원인 조사 |
| T2 | 미검수/비공개/관리자 데이터 public 노출 확인 | Critical | 중단, rollback 검토 |
| T3 | 비관리자 `/admin` CRUD 또는 bulk 실행 가능 | Critical | 중단 |
| T4 | Answer Assistant allowlist/gate 우회 | Critical | gate OFF, rollback 검토 |
| T5 | bulk forbidden op 실행 성공 (테스트 중 발견 시) | Critical | 중단 |
| T6 | secret·`.env` 노출 의심 | Critical | 중단 |
| T7 | smoke 미완료인 채 production 유지 | Medium | 보류 또는 재 smoke |

**PR117 Cursor:** T1~T7 런타임 **미발생** (smoke 미실행). 운영자 기록 후 갱신.

---

## PR117 실패/리스크 분류 (현재)

| 항목 | 등급 | 근거 | 대응 |
| --- | --- | --- | --- |
| 배포 URL 미제공 | Medium | 런타임 smoke 불가 | 운영자 `BASE_URL` 기입 후 smoke |
| 런타임 public/admin/AA | 정보 부족 | Cursor 세션 한계 | 운영자 spot-check |
| 정적 visibility/bulk/AA tests | Low | pass | 유지 |

---

## 배포 가능 / 보류 / 중단 (Post-smoke)

| 판단 | 기준 | PR117 Cursor 적용 | 근거 |
| --- | --- | --- | --- |
| **배포 가능** | 핵심 smoke pass, High/Critical 없음 | **미적용** | 런타임 미완 |
| **조건부 배포 가능** | Low/Medium만, 대응 있음 | **해당** | 정적 pass, smoke 표 미기입 |
| **배포 보류** | High | — | URL·admin smoke 대기 |
| **배포 중단** | Critical | — | 해당 없음 (정적 기준) |

### 종합 (초안)

| 필드 | 값 |
| --- | --- |
| **판단** | **조건부 (smoke 미완)** |
| 근거 | 배포 URL·commit 미제공; 정적 검증만 pass |
| 조건 | `BASE_URL` smoke:public pass + admin E절 + AA spot-check 후 **배포 가능** 승격 |
| 즉시 수정 | 없음 (docs PR) |
| Rollback 검토 | **불필요** (Critical 미관측) |

---

## Codex 제한검수

| 항목 | PR117 |
| --- | --- |
| 필요 여부 | **불필요** |
| 후보 (런타임 실패 시) | public visibility, admin RBAC, AA allowlist/output, bulk safety |
| 제외 | 문구, 표 포맷, Low UI |
| 생략 조건 | docs-only + Critical 미관측 |

---

## 최종 승인 (Post-smoke)

| 역할 | 일시 | 판단 |
| --- | --- | --- |
| 운영 | | |
| 기술 | | |

**제한 배포 유지 승인은 런타임 smoke 표 완료 후에만.**
