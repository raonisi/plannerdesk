# PR-114 — 제한 배포 전 체크리스트

**사용 시점:** `main` (또는 승인된 release 브랜치)을 Railway 등에 **제한 배포**하기 직전.  
**전제:** PR105~PR113 범위(또는 동등한 변경 묶음)가 merge·검증 완료.

**금지:** 이 체크리스트 수행 중 운영 DB migration deploy, allowlist 변경, bulk 대량 실행, public 데이터 상태 일괄 변경.

**허브:** [PR-114-LIMITED-RELEASE-OPS.md](./PR-114-LIMITED-RELEASE-OPS.md)

---

## A. Git / 브랜치 상태

- [ ] 배포 대상 브랜치 확인 (`git branch --show-current`)
- [ ] `git status` — working tree clean (의도하지 않은 로컬 변경 없음)
- [ ] 배포 commit SHA 기록
- [ ] PR 범위 외 파일 변경 없음 (`git diff` / PR Files changed)
- [ ] merge 전 최신 `main` 반영 (또는 release 브랜치 rebase/merge 정책 준수)
- [ ] `package.json` / lockfile 변경이 이번 배포 범위에 포함되는지 확인 (포함 시 별도 승인)

---

## B. 검증 명령

로컬 또는 CI와 동일한 Node 버전(22)에서 실행:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

- [ ] `npm run lint` — pass
- [ ] `npm run typecheck` — pass
- [ ] `npm run test` — pass
- [ ] `npm run build` — pass
- [ ] **`npm run build`가 `prisma migrate deploy`를 실행하지 않음** — `package.json`의 `build`가 `prisma generate && next build`인지 확인 ([PR-105](./PR-105-BUILD-MIGRATION-SEPARATION.md))
- [ ] 실패 시 분류: 이번 배포 실패 / 기존 실패 / 환경·의존성 / DB 접촉 방지 미실행

**선택 (권장):**

```bash
npm run verify
```

---

## C. DB / Migration

- [ ] 이번 배포에 **schema 변경·새 migration 파일** 포함 여부 확인
- [ ] schema/migration 포함 시: **별도 migration PR·백업·rollback·승인** 완료 여부
- [ ] PR 검증 단계에서 `npm run release:migrate` / `db:migrate:deploy` **미실행** (운영 DB 접촉 금지)
- [ ] migration 필요 시 배포 순서: (1) 승인된 migrate (2) app build/deploy ([DEPLOYMENT.md](./DEPLOYMENT.md))
- [ ] `prisma/schema.prisma` diff 없음 → migration deploy 불필요로 기록

---

## D. Admin / Bulk

참고: [PR-107-ADMIN-BULK-SAFETY-QA.md](./PR-107-ADMIN-BULK-SAFETY-QA.md), [ADMIN_BULK_ACTION_POLICY.md](./ADMIN_BULK_ACTION_POLICY.md)

- [ ] `validateServerBulkAction` / forbidden operation 차단 유지 (코드 diff 없거나 회귀 없음)
- [ ] 일괄 작업 UI: 선택 건수 표시·확인 문구·빈 선택 실행 방지
- [ ] 서버 측 RBAC: bulk action 전 권한 체크
- [ ] **실제 운영 데이터에 bulk 실행하지 않음** (스테이징 또는 dry-run만)
- [ ] 지식 starter 30건 일괄 import는 배포 검증 중 **실행하지 않음**

---

## E. Answer Assistant Beta

참고: [PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md](./PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md), [PR-99B-ANSWER-ASSISTANT-ALLOWLIST-BETA.md](./PR-99B-ANSWER-ASSISTANT-ALLOWLIST-BETA.md)

- [ ] verified planner + allowlist + gate 제한 유지
- [ ] allowlist **자동 확대·운영 env 변경 없음** (배포 문서 PR만 해당)
- [ ] rate limit·output safety·usage audit metadata-only 원칙
- [ ] retention cleanup 기준 인지 ([PR-102](./PR-102-ANSWER-ASSISTANT-DASHBOARD-RETENTION-CLEANUP.md))
- [ ] rollback/임시 비활성: gate OFF, allowlist 비우기, route 유지 정책 확인
- [ ] public `/planner/answer-assistant` 우회 노출 없음

---

## F. Public Route / Visibility

참고: [PR-110-PUBLIC-ROUTE-SMOKE.md](./PR-110-PUBLIC-ROUTE-SMOKE.md), [SMOKE_TEST.md](./SMOKE_TEST.md)

**정적 회귀 (DB 불필요):**

```bash
npx tsx --test tests/public/public-visibility.test.ts
npx tsx --test tests/public/public-routes-smoke.test.ts
```

**런타임 smoke (서버 필요):**

```bash
BASE_URL=<staging-or-local> npm run smoke:public
```

- [ ] `/`, `/directory`, `/claim-documents`, `/knowledge`, `/search`, `/disclosure-links`, `/message-templates`, `/community`
- [ ] `PUBLIC_*_WHERE` / `PUBLIC_VERIFICATION_STATUSES` 약화 diff 없음
- [ ] draft·비공개·미검수 데이터 public 미노출 (수동 샘플 또는 스테이징)
- [ ] admin 전용 필드·상태값 public 과다 노출 없음

---

## G. Admin UI

참고: [PR-111-ADMIN-UI-QA.md](./PR-111-ADMIN-UI-QA.md)

- [ ] 비로그인·권한 없음 → admin 차단
- [ ] 목록 빈 상태·필터·공개 표면 라벨 (`공개 중` / `게시 중·공개 전 확인 필요` / `비공개`)
- [ ] 일괄 작업: 대상 수·확인·취소 가능
- [ ] 내부 개발자용 상태 과다 노출 없음 (public과 분리)

---

## H. 보험사 / 청구서류

참고: [PR-112-DIRECTORY-CLAIM-UX.md](./PR-112-DIRECTORY-CLAIM-UX.md)

```bash
npx tsx --test tests/public/directory-claim-ux.test.ts
```

- [ ] `/directory` ↔ `/claim-documents?insurer=` 연결 (스테이징 수동)
- [ ] 보험사별 청구서류 그룹·청구안내 바로가기
- [ ] 지급 단정·가입 유도·공포 조장 문구 없음
- [ ] public visibility guard 미약화

---

## I. 지식 아카이브

참고: [PR-113-KNOWLEDGE-ARCHIVE-OPS.md](./PR-113-KNOWLEDGE-ARCHIVE-OPS.md)

```bash
npx tsx --test tests/admin/knowledge-workflow-qa.test.ts
```

- [ ] 등록 → 검수 대기 → 공개 가능 → 게시 흐름 (admin 수동 또는 스테이징)
- [ ] `PUBLIC_KNOWLEDGE_WHERE` 미변경
- [ ] draft·보류·수정 필요 public 미노출
- [ ] 일괄 상태 변경 확인 문구·대상 수
- [ ] 보험·금융 과장·단정 문구 없음

---

## 배포 직전 서명 (운영자)

| 항목 | 확인자 | 일시 | 비고 |
| --- | --- | --- | --- |
| A~B 검증 명령 pass | | | |
| C migration 필요 여부 | | | |
| D~I 영역 spot-check | | | |
| 릴리즈 노트 작성 | | | [템플릿](./PR-114-RELEASE-NOTES-TEMPLATE.md) |
| Rollback 담당·마지막 정상 SHA | | | [Rollback](./PR-114-ROLLBACK-AND-CODEX-GATES.md) |
