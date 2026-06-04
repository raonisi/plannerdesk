# PR-118 — 실제 사용자 1차 피드백 반영

**목적:** 제한 배포·내부 테스트 후 보험설계사·운영자가 느낀 불편을 **수집·분류**하고, **확인된 피드백만** 최소 범위로 반영한다. 대규모 기능·DB/Auth·운영 데이터 변경은 본 PR 범위가 아니다.

**선행:** PR105~PR117 (배포 준비·smoke) → **(실제 사용·피드백 수집)** → PR118 → PR119 (운영 데이터 품질 QA)

**운영 체계 (PR121):** [PR-121-USER-FEEDBACK-OPS.md](./PR-121-USER-FEEDBACK-OPS.md) — 접수·분류·우선순위·PR 연결 **권장**

| 문서 | 용도 |
| --- | --- |
| [PR-118-USER-FEEDBACK-INTAKE.md](./PR-118-USER-FEEDBACK-INTAKE.md) | 1차 양식 (레거시) |
| [PR-118-FEEDBACK-TRIAGE-AND-PLAN.md](./PR-118-FEEDBACK-TRIAGE-AND-PLAN.md) | 1차 분류·PR119 이관 |

**후속:** [PR-119-OPERATIONAL-DATA-QUALITY-OPS.md](./PR-119-OPERATIONAL-DATA-QUALITY-OPS.md) (데이터 정확성·최신성)

---

## Cursor PR118 세션 (2026-06-03)

**실제 사용자 피드백 정보 부족.** 저장소·대화·PR117 smoke 기록에 **설계사/운영자 1차 사용 불편 원문**이 없어, **임의 기능·UI 코드 변경 없음**. 피드백 수집 양식·분류·PR119 이관표만 작성.

---

## 역할 분리

| 작업 | 운영자/사용자 | Cursor/개발 |
| --- | --- | --- |
| 피드백 원문·캡처·재현 조건 | ✅ 기입 | 양식 제공 |
| 즉시 반영 UX·문구 | 승인 후 | 피드백 번호별 최소 diff |
| 데이터 링크·팩스·전산 검증 | PR119 | PR118에서 수정 금지 |
| Auth·allowlist·bulk 실행 | 변경 금지 | 변경 금지 |

---

## 반영 허용 범위 (피드백 확인 시)

- UI 문구·라벨·빈 상태·안내
- 메뉴/섹션 제목·정보 우선순위
- 검색/필터 사용성 (guard 유지)
- 모바일·좁은 화면 가독성

## 금지

- 피드백 없는 기능 추측 추가
- Prisma/schema/migration, Auth/RBAC, allowlist, bulk 실행
- public visibility guard 약화, Answer Assistant 범위 확대
- 운영 DB·실제 콘텐츠 대량 수정

---

## Antigravity 검수

- [ ] 피드백 기반 변경만 포함되었는지
- [ ] 임의 기능 추가 없음
- [ ] public visibility·권한·bulk·AA 위험 없음
- [ ] PR119 이관 항목 분리 적절

**Codex:** 기본 생략. [PR-118-FEEDBACK-TRIAGE-AND-PLAN.md](./PR-118-FEEDBACK-TRIAGE-AND-PLAN.md) 참조.
