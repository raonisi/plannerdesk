# 릴리즈 노트 템플릿 (제한 배포)

**용도:** PlannerDesk 제한 배포·운영자 공유용. 고객 마케팅 문구가 아닌 **운영 판단 기록**이다.

**작성 시점:** [제한 배포 전 체크리스트](./PR-114-LIMITED-RELEASE-PRE-DEPLOY-CHECKLIST.md) B~I 완료 후, deploy 직전.

---

## 메타

| 필드 | 값 |
| --- | --- |
| 배포 버전 / PR 범위 | 예: PR105~PR113, commit `________` |
| 배포 환경 | staging / production (제한) |
| 배포 일시 (KST) | |
| 배포 담당 | |
| 최종 승인자 | |

---

## 배포 목적

(1~3문장: 이번 배포가 해결하는 운영·안정성·UX 목표. 기능 과장 금지.)

---

## 포함된 변경

| 영역 | 요약 | 참고 문서 |
| --- | --- | --- |
| Build / CI | | PR-105, PR-106 |
| Admin bulk | | PR-107 |
| Answer Assistant beta | | PR-109 |
| Public smoke | | PR-110 |
| Admin UI | | PR-111 |
| Directory / claim UX | | PR-112 |
| Knowledge archive ops | | PR-113 |
| 기타 | | |

---

## 제외된 변경

- (명시적으로 이번 배포에 넣지 않은 항목: migration, allowlist 확대, bulk 데이터 변경, 신규 과금 등)

---

## 영향 요약

### 사용자(설계사) 영향

- public 화면 변경:
- 동작 변경 없음 / copy·탐색만:

### 관리자 영향

- admin UI·bulk·검수 흐름:

### DB / Migration 영향

- [ ] schema 변경 없음
- [ ] migration 실행: 없음 / 있음 (PR 번호, 파일, 실행 시각, 담당)

### 권한 / Auth 영향

- [ ] Auth/RBAC 변경 없음
- [ ] 변경 있음 (상세):

### 운영 데이터 영향

- [ ] 운영 데이터 일괄 변경 없음
- [ ] 스테이징만 변경 / 수동 spot-check만:

---

## 검증 명령 결과

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `npm run lint` | pass / fail | |
| `npm run typecheck` | pass / fail | |
| `npm run test` | pass / fail | |
| `npm run build` | pass / fail | migrate deploy 없음 확인 |
| `npm run smoke:public` | pass / skip / N/A | BASE_URL= |
| 추가 테스트 | | |

---

## 알려진 제한사항

- (예: Answer Assistant beta allowlist 수동만, community placeholder, DB 없으면 일부 route empty state)

---

## Rollback 조건

즉시 중단·rollback 검토 조건이 충족되면 배포 중단. 상세: [PR-114-ROLLBACK-AND-CODEX-GATES.md](./PR-114-ROLLBACK-AND-CODEX-GATES.md).

- [ ] 해당 없음
- [ ] 조건 발생 (기록):

---

## 배포 후 확인 (24h 이내)

- [ ] public 주요 route 200 (`smoke:public`)
- [ ] admin 로그인·RBAC
- [ ] Answer Assistant gate/allowlist 의도대로
- [ ] 오류 로그·Railway deploy health
- [ ] 사용자 공지 필요 여부: 없음 / 있음

---

## Codex 제한검수

| 항목 | 값 |
| --- | --- |
| 필요 여부 | 없음 / 있음 |
| 사유 | |
| 대상 파일·로직 | |

기본: **생략** (문서·UX-only 배포). 조건: [PR-114-ROLLBACK-AND-CODEX-GATES.md](./PR-114-ROLLBACK-AND-CODEX-GATES.md).

---

## 승인

- [ ] 운영 체크리스트 A~I 완료
- [ ] migration·secret·운영 데이터 정책 준수
- [ ] 최종 승인자 서명: _______________
