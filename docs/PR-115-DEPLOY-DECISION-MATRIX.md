# PR-115 — 제한 배포 판단표

**사용:** [최종 smoke](./PR-115-FINAL-SMOKE-CHECKLIST.md) + [rollback drill](./PR-115-ROLLBACK-DRILL.md) 완료 후, 배포 **가능 / 조건부 / 보류 / 중단** 중 하나를 선택한다.

---

## 판단 등급

| 판단 | 기준 |
| --- | --- |
| **배포 가능** | 핵심 smoke(A~B 필수, C/D는 스테이징 pass 또는 승인된 skip) 통과, **High/Critical 리스크 없음** |
| **조건부 배포 가능** | Low/Medium만 존재, 대응책·공지·모니터링 문서화 완료, 승인자 서명 |
| **배포 보류** | High 리스크, 사용자 영향 가능, 원인 미해결 |
| **배포 중단** | Critical: 권한·DB·운영데이터·secret·visibility/bulk 약화·build/migrate 혼선 |

---

## 검증 기록 (PR115 Cursor 실행 — docs-only PR)

> 아래는 PR115 문서 작업 시 로컬 `main` clean tree에서 실행한 결과이다. 운영 배포 전 **운영자가 동일 명령을 재실행**하고 이 표를 갱신한다.

| 항목 | 결과 | 비고 |
| --- | --- | --- |
| Git working tree | clean | `main` |
| `npm run lint` | pass | |
| `npm run typecheck` | pass | |
| `npm run test` | pass | answer-assistant suite |
| `npm run build` | pass | migrate deploy 없음 |
| 정적 public/admin tests | pass | PR115 checklist B 블록 |
| `smoke:public` (runtime) | **미실행** | 서버/BASE_URL 필요 — 배포 전 스테이징에서 실행 |
| Admin runtime smoke | **미실행** | 스테이징 spot-check |
| 운영 DB 접촉 | **없음** | |
| secret/.env 변경 | **없음** | |
| product code 변경 (PR115) | **없음** | docs only |

---

## 영역별 판단

| 영역 | 리스크 | 결과 | 근거 |
| --- | --- | --- | --- |
| 검증 명령 (A) | Low | pass | lint/typecheck/test/build |
| build/migration 분리 | Low | pass | PR-105, package.json |
| Public route (정적) | Low | pass | public-*.test.ts |
| Public route (런타임) | Medium | **보류 항목** | smoke:public 스테이징 필요 |
| Admin route (런타임) | Medium | **보류 항목** | D절 수동 |
| Admin bulk safety | Low | pass | bulk-safety.test.ts |
| Answer Assistant beta | Low | pass | beta-ops·allowlist tests (정적) |
| Public visibility | Low | pass | public-visibility.test.ts |
| 보험사/청구서류 | Low | pass | directory-claim-ux.test.ts |
| 지식 아카이브 | Low | pass | knowledge-workflow-qa.test.ts |
| Rollback drill | Low | pass (문서) | drill 표 기입은 배포 전 |
| PR115 scope | Low | pass | docs only |

---

## 종합 판단 (초안)

| 필드 | 값 |
| --- | --- |
| **권장 판단** | **조건부 배포 가능** |
| 사유 | A~B·정적 smoke pass; C/D 런타임 smoke·drill 표 기입은 배포 당일 스테이징에서 완료 필요 |
| Critical/High 잔존 | 없음 (코드 기준); 런타임 미검증은 Medium |
| 운영 데이터 비접촉 | 확인 |
| secret/.env 보호 | 확인 |

**배포 가능으로 승격 조건:**

- [ ] `BASE_URL=<staging> npm run smoke:public` pass
- [ ] Admin D절 spot-check pass
- [ ] Rollback drill 1~3 표 기입 + 승인자 서명
- [ ] [릴리즈 노트](./PR-114-RELEASE-NOTES-TEMPLATE.md) 작성

---

## Codex 제한검수

| 항목 | 값 |
| --- | --- |
| 필요 여부 | **불필요** (PR115 docs-only) |
| 후보 조건 (향후 code PR) | build/migrate 경계, bulk, Answer Assistant, public visibility, rollback |
| 제외 | 문서 스타일, 표 포맷, README 일반 문장 |

상세: PR-114 Codex gates + 본 문서 §Codex.

---

## 최종 승인

| 역할 | 이름 | 일시 | 판단 |
| --- | --- | --- | --- |
| 운영 승인 | | | 배포 가능 / 조건부 / 보류 / 중단 |
| 기술 승인 | | | |

**PR115 Cursor:** 문서·정적 검증만 완료. **실제 제한 배포 승인은 운영자 서명 후.**
