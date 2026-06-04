# PR-116 — 제한 배포 실행 준비 판단표

**사용:** [실행 전 체크리스트](./PR-116-PRE-DEPLOY-EXECUTION-CHECKLIST.md) A~G 완료 후 작성.  
**실제 deploy는 본 문서 서명 후 별도 승인 절차에서만 수행.**

---

## 판단 등급

| 판단 | 기준 |
| --- | --- |
| **배포 가능** | B pass, C.1 필수 env 존재, D=실행 불필요 또는 migrate 승인·완료, A4 rollback SHA 명확, PR115 런타임 smoke pass |
| **조건부 배포 가능** | Low/Medium만 잔존, 대응·모니터링·공지 문서화, 승인자 2인 |
| **배포 보류** | High: env 미확인, 스테이징 smoke 미완, migration 판단 불명 |
| **배포 중단** | Critical: secret 노출, AUTH_SECRET 누락, visibility/bulk 약화, 운영 DB 오접 |

---

## 기록 (배포 전 기입)

### Git

| 항목 | 값 |
| --- | --- |
| 배포 대상 commit | |
| Rollback 대상 commit (마지막 정상) | |
| 브랜치 | |
| 배포 환경 (staging/production) | |

### 검증 명령 (B)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `npm run lint` | pass / fail | |
| `npm run typecheck` | pass / fail | |
| `npm run test` | pass / fail | |
| `npm run build` | pass / fail | migrate 없음 확인 |

### 환경변수 (C) — 값 기록 금지

| 항목 | 상태 |
| --- | --- |
| C.1 필수 6종 모두 존재 | Yes / No |
| staging/production 분리 확인 | Yes / No |
| Answer Assistant beta 자동 확대 없음 | Yes / No |

### DB / Migration (D)

| 항목 | 값 |
| --- | --- |
| schema 변경 | Yes / No |
| 신규 migration 폴더 | Yes / No |
| **migration 실행** | **불필요** / **승인 후 별도 실행** |
| PR116에서 migrate 실행 | **No** (필수) |

### 관리자 접근 (E)

| 항목 | 상태 |
| --- | --- |
| E1~E4 스테이징/승인 환경에서 확인 | pass / skip / fail |
| PR116 계정 변경 | **No** |

### 배포 후 smoke (F)

| 항목 | 상태 |
| --- | --- |
| 순서 문서 확정 (PR116) | Yes |
| deploy **후** 1~10 실행 예정 | Yes |

### 운영 데이터·secret

| 항목 | 확인 |
| --- | --- |
| 운영 DB/bulk/allowlist/public 상태 변경 없음 | ☐ |
| secret 문서·로그 미노출 | ☐ |
| PR116 실제 deploy/rollback/migrate 미실행 | ☐ |

---

## 종합 판단 (초안 — Cursor PR116 docs 작업 시)

> 운영 배포 전 **반드시 갱신**하고 승인자 서명.

| 필드 | 권장 |
| --- | --- |
| **판단** | **조건부 배포 가능** (문서·정적 검증만 완료 시) |
| 사유 | B~정적 smoke는 repo 기준 pass 가능; C/E/F는 Railway·스테이징에서 운영자 기입 필요 |
| Critical/High 코드 리스크 | PR116 scope 외 (docs-only) |

**배포 가능 승격 조건:**

- [ ] C.1 Railway Variables 존재 확인 (값 미기록)
- [ ] D migration **불필요** 또는 승인 migrate 완료
- [ ] A4 rollback SHA 기입
- [ ] 스테이징 PR115 C/D + F 순서 1~10 pass
- [ ] [릴리즈 노트](./PR-114-RELEASE-NOTES-TEMPLATE.md) 작성

---

## Codex 제한검수

| 항목 | PR116 |
| --- | --- |
| 필요 여부 | **불필요** (docs-only) |
| 후보 (향후 code deploy) | D1~D3 불명확, build/migrate 경계, Auth/RBAC, secret, rollback SHA, bulk, AA allowlist, public visibility |
| 제외 | 문서 스타일, 표, Low 체크리스트 항목 |

---

## 최종 승인 (실제 deploy 트리거 전)

| 역할 | 이름 | 일시 | 판단 |
| --- | --- | --- | --- |
| 기술 승인 | | | |
| 운영 승인 | | | |

**PR116 Cursor:** 실행 준비 문서만 제공. 아래 줄에 서명이 없으면 deploy 금지.
