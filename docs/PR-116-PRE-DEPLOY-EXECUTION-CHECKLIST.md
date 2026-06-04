# PR-116 — 제한 배포 실행 전 체크리스트

**대상:** 제한 배포를 **실행하기 직전** (Railway deploy 버튼/merge 트리거 전).  
**금지:** deploy, rollback, `release:migrate`, secret 값 출력, 운영 데이터 변경.

**허브:** [PR-116-LIMITED-RELEASE-EXECUTION-READINESS.md](./PR-116-LIMITED-RELEASE-EXECUTION-READINESS.md)

---

## A. Git / 브랜치

| # | 확인 | Pass |
| --- | --- | --- |
| A1 | `git branch --show-current` = 배포 승인 브랜치 (보통 `main`) | ☐ |
| A2 | `git status` working tree clean | ☐ |
| A3 | `git log -1 --oneline` → **배포 대상 commit SHA** 기록: `________` | ☐ |
| A4 | **rollback 대상** (마지막 정상 production SHA) 기록: `________` | ☐ |
| A5 | `git diff <rollback-sha>..<deploy-sha> --stat` — PR 범위 외 파일 없음 | ☐ |
| A6 | `main`이 origin과 동기 (또는 release 태그 정책 준수) | ☐ |

**명령 (값 출력만 SHA):**

```bash
git branch --show-current
git status
git log -1 --format="%H %s"
```

---

## B. 검증 명령

배포 대상 commit에서 실행 (로컬 또는 CI 동일 결과 확인).

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

| # | 확인 | Pass |
| --- | --- | --- |
| B1 | lint pass | ☐ |
| B2 | typecheck pass | ☐ |
| B3 | test pass | ☐ |
| B4 | build pass | ☐ |
| B5 | `package.json` `"build"` = `prisma generate && next build` (migrate 없음) | ☐ |
| B6 | 실패 시 분류 기록 (이번/기존/환경) | ☐ |

**선택 정적 smoke (PR115 B블록):**

```bash
npx tsx --test tests/public/public-visibility.test.ts tests/public/public-routes-smoke.test.ts tests/public/directory-claim-ux.test.ts tests/admin/bulk-safety.test.ts tests/admin/admin-ui-qa.test.ts tests/admin/knowledge-workflow-qa.test.ts tests/ops/pr115-limited-release-ops.test.ts
```

---

## C. 환경변수 (이름만 — 값 출력 금지)

**확인 방법:** Railway Dashboard → Variables **존재 여부**만 Yes/No. 값·스크린샷·PR 코멘트에 붙여넣지 않는다.

참고: [RAILWAY_HARDENING.md](./RAILWAY_HARDENING.md), [.env.example](../.env.example) (placeholder만), [AUTH_RBAC_PRODUCTION.md](./AUTH_RBAC_PRODUCTION.md)

### C.1 필수 (production runtime)

| Variable | 설정됨 (Y/N) | 누락 시 |
| --- | --- | --- |
| `DATABASE_URL` | | **배포 보류** |
| `DIRECT_URL` | | migration 필요 시 보류 |
| `AUTH_SECRET` | | **배포 중단** |
| `AUTH_URL` | | admin 로그인 실패 → 보류 |
| `AUTH_GOOGLE_ID` | | admin OAuth 불가 → 보류 |
| `AUTH_GOOGLE_SECRET` | | admin OAuth 불가 → 보류 |

### C.2 앱 URL (권장)

| Variable | 설정됨 (Y/N) | 비고 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | | canonical 링크 |
| `NEXT_PUBLIC_APP_NAME` | | 선택 |

### C.3 Answer Assistant beta (기본 OFF 유지)

| Variable | 의도 | 확인 |
| --- | --- | --- |
| `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED` | unset 또는 `false` | ☐ 자동 확대 없음 |
| `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST` | PR116에서 **변경 없음** | ☐ |
| `ANSWER_ASSISTANT_RATE_LIMIT_BACKEND` | production: `durable` 권장 | ☐ 이름만 |
| `ANSWER_ASSISTANT_USAGE_AUDIT_BACKEND` | production: `durable` 권장 | ☐ 이름만 |

### C.4 환경 분리

| # | 확인 | Pass |
| --- | --- | --- |
| C5 | staging vs production Variables **별도 프로젝트/환경** | ☐ |
| C6 | 이번 점검이 **어느 환경**인지 명시: `________` | ☐ |
| C7 | 문서·릴리즈 노트·채팅에 secret 미포함 | ☐ |

---

## D. DB / Migration

**PR 검증 중:** `npm run release:migrate` **실행하지 않음.**

| # | 판단 | 기록 |
| --- | --- | --- |
| D1 | 이번 deploy SHA에 `prisma/schema.prisma` 변경 포함? | Yes / **No** |
| D2 | `prisma/migrations/`에 **신규** 폴더가 마지막 production migrate 이후 추가됨? | Yes / **No** |
| D3 | **결론** | ☐ **실행 불필요** / ☐ **별도 승인 후 migrate 필요** |

**D3 = 실행 불필요 조건 (모두 해당):**

- schema diff 없음
- 신규 migration 폴더 없음 (또는 이미 production에 적용됨)

**D3 = migrate 필요 시 (운영자만, 본 PR 밖):**

1. migration PR·SQL 리뷰 완료  
2. 백업·대상 DB·`DIRECT_URL` 확인  
3. `npm run release:migrate` (승인된 환경만)  
4. 그 다음 app deploy (`npm run build`는 migrate 하지 않음)

**build 단계:** Railway build command = `npm run build` only ([PR-105](./PR-105-BUILD-MIGRATION-SEPARATION.md)).

---

## E. 관리자 접근 (계정 변경 없이)

**방법:** 스테이징 또는 production **승인된** URL에서 시크릿 없이 동작만 확인.

| # | 시나리오 | 기대 | Pass |
| --- | --- | --- | --- |
| E1 | 비로그인 `/admin` | 로그인 요구 | ☐ |
| E2 | 비관리자 계정 `/admin` | 거부 | ☐ |
| E3 | `content_admin` | insurers·claim-documents·knowledge CRUD | ☐ |
| E4 | `super_admin` | 동일 + 향후 user 관리 경계 | ☐ |
| E5 | admin 첫 화면 | bulk 선택 수·공개 표면 라벨·안전 안내 확인 | ☐ |
| E6 | **계정 생성/role 변경** | PR116에서 **하지 않음** | ☐ |

참고: [PR-111-ADMIN-UI-QA.md](./PR-111-ADMIN-UI-QA.md), [AUTH_RBAC_PRODUCTION.md](./AUTH_RBAC_PRODUCTION.md)

---

## F. 배포 후 Smoke 순서 (실행은 deploy **이후**)

deploy 완료 후 **이 순서**로 확인. PR116에서는 순서만 확정.

| 순서 | 영역 | 확인 |
| --- | --- | --- |
| 1 | `BASE_URL=<배포URL> npm run smoke:public` | 홈·directory·claim·knowledge·search·disclosure·message-templates |
| 2 | `/directory?insurer=` (샘플 id) | PR112 딥링크 |
| 3 | `/claim-documents?insurer=` | 그룹·역링크 |
| 4 | `/knowledge` + 공개 slug 1건 | 목록·상세 |
| 5 | not-found slug | 404 |
| 6 | `/admin` 비로그인 | 차단 |
| 7 | admin 로그인 → insurers / claim-documents / knowledge | 목록·필터 |
| 8 | bulk UI | 선택·확인 문구만 — **대량 실행 금지** |
| 9 | `/planner/answer-assistant` | allowlist 밖 deny / gate OFF |
| 10 | 오류 로그·Railway health | 5~15분 모니터링 |

상세: [PR-115-FINAL-SMOKE-CHECKLIST.md](./PR-115-FINAL-SMOKE-CHECKLIST.md)

---

## G. 중단 조건 (하나라도 해당 시 deploy 보류/중단)

| # | 조건 |
| --- | --- |
| G1 | 필수 환경변수 누락 (C.1) |
| G2 | B절 검증 명령 실패 |
| G3 | D3 migration 필요 여부 **불명확** |
| G4 | rollback SHA 미기록 |
| G5 | public route smoke 실패 (배포 후) |
| G6 | admin 접근 제어 실패 |
| G7 | secret 노출 의심 |
| G8 | 운영 데이터 일괄 변경 예정 |
| G9 | Answer Assistant allowlist/gate 의도치 않은 ON |
| G10 | Admin bulk forbidden op 회귀 의심 |

---

## 체크리스트 완료

| 역할 | 이름 | 일시 |
| --- | --- | --- |
| 기술 | | |
| 운영 | | |

**다음:** [PR-116-DEPLOY-EXECUTION-READINESS-DECISION.md](./PR-116-DEPLOY-EXECUTION-READINESS-DECISION.md)
