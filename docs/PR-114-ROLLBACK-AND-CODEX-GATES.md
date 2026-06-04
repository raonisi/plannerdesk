# PR-114 — Rollback 기준 및 Codex 제한검수

**연관:** [제한 배포 전 체크리스트](./PR-114-LIMITED-RELEASE-PRE-DEPLOY-CHECKLIST.md), [릴리즈 노트 템플릿](./PR-114-RELEASE-NOTES-TEMPLATE.md), [PR-105 Build/Migration 분리](./PR-105-BUILD-MIGRATION-SEPARATION.md)

---

## Rollback — 즉시 중단 또는 배포 보류

아래 **하나라도** 해당하면 배포를 중단하고 rollback·hotfix 여부를 판단한다.

| # | 조건 |
| --- | --- |
| 1 | public 주요 route (`/`, `/directory`, `/claim-documents`, `/knowledge`, `/admin` 로그인) 접근 실패 |
| 2 | 관리자 접근 제어 실패 (비인가 사용자 admin CRUD·bulk 실행) |
| 3 | 미검수·비공개·draft 데이터가 public에 노출됨 |
| 4 | Answer Assistant allowlist·gate 우회 가능성 확인 |
| 5 | Admin bulk가 forbidden operation·빈 선택·확인 없이 대량 상태 변경 가능 |
| 6 | `npm run build`가 migration deploy를 수행하거나 build/migration 경계가 깨짐 |
| 7 | 운영 DB에 의도하지 않은 migration·데이터 변경 발생 |
| 8 | secret, `.env`, Railway Variables 노출 의심 |
| 9 | lint / typecheck / test / build 실패 원인 불명확인 채 배포 |
| 10 | 배포 후 핵심 UX 회귀 (청구서류·디렉터리·지식 검색 불가 등) |

---

## Rollback — 실행 전 확인

| 확인 항목 | 기록 |
| --- | --- |
| 변경 PR 범위·commit SHA | |
| 마지막 정상 deploy commit | |
| `release:migrate` 실행 여부·적용 migration ID | |
| 운영 데이터 수동/bulk 변경 여부 | |
| Railway 캐시·이전 빌드 아티팩트 | |
| 사용자·운영자 공지 필요 여부 | |

### Rollback 절차 (개요)

1. Railway에서 **이전 정상 deployment**로 revert (또는 known-good commit 재배포).
2. migration을 이번 배포에서 적용했다면: **schema rollback은 별도 DBA 절차** (앱 revert만으로 DB 되돌리지 않음).
3. Answer Assistant: gate OFF, allowlist 유지/축소 — [PR-109](./PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md) rollback 절.
4. 사후: 릴리즈 노트에 incident·재발 방지 기록.

---

## Codex 제한검수

### 기본 원칙

- **Codex 최종검수: 기본 생략** (Antigravity·운영 체크리스트 우선).
- Codex는 **코드를 수정하지 않고** 고위험 diff만 위험 보고.
- UI·문구·스타일·단순 docs-only PR은 Codex 대상에서 제외.

### 제한검수 **후보** 조건 (하나라도 해당)

| # | 조건 |
| --- | --- |
| 1 | DB migration 또는 `prisma/schema.prisma` 변경 포함 |
| 2 | Auth / RBAC / admin role 변경 포함 |
| 3 | 운영 데이터 상태 변경 스크립트·seed·import apply 포함 |
| 4 | Admin bulk 정책·`validateServerBulkAction`·forbidden set 변경 |
| 5 | Answer Assistant allowlist / gate / output safety / usage audit / retention 변경 |
| 6 | `PUBLIC_*_WHERE`·public visibility guard 변경 |
| 7 | build / migration 분리 구조 변경 (`package.json` build·migrate scripts) |
| 8 | Antigravity 검수 후 High/Critical 리스크 잔존 |

### 제한검수 **방식**

- 전체 repo 검수 금지.
- 후보 파일만: `lib/public/*`, `lib/admin/bulk-policies.ts`, `app/admin/*/actions.ts`, `lib/answer-assistant/*`, `prisma/schema.prisma`, `package.json` (scripts).
- 산출: 위험 등급, 재현 조건, rollback 권고 — **패치 제안은 별도 PR**.

### Codex **생략 가능** 조건 (PR114 유형)

- [ ] product code diff 없음 (docs only)
- [ ] migration / schema / auth / visibility / bulk / Answer Assistant 코드 diff 없음
- [ ] 운영 DB·allowlist·secret 미접촉
- [ ] Antigravity가 체크리스트·rollback 문서 충분하다고 판단

**PR114 (본 PR):** docs only → **Codex 생략 가능**.

---

## PR114 Antigravity 검수 요청

- [ ] Rollback 10항목이 배포 담당자에게 실무적으로 이해되는가
- [ ] migration revert와 app revert가 분리 설명되었는가
- [ ] Codex 조건이 과도하지 않은가 (누락 없는가)
- [ ] PR105~113 링크로 spot-check 경로가 이어지는가
