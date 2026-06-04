# PR-131 — 통합 업무 대시보드 고도화

## 목적

PR121~PR130 운영 Cycle 이후 첫 **기능 고도화** PR. 보험설계사·운영자가 매일 접속할 때 보험사·청구서류·지식·업무 링크·운영 큐를 빠르게 파악하고 이동할 수 있는 **실무형 시작 화면**을 정리한다.

## 범위 (이번 PR)

| 영역 | 내용 |
| --- | --- |
| **Public 홈** | 업무 시작 카드 6+2, 지식·통합검색 진입, 공개 건수 스트립, visibility 안내, 청구 흐름 링크, AA 베타 안내(확대 없음) |
| **Admin** | 검수·운영 큐 요약 패널(기존 probe 집계만) |
| **문서·테스트** | 역할별 표시 기준, static smoke |

## 비범위 (별도 PR)

- Prisma schema / migration
- Auth·RBAC·allowlist 변경
- public visibility guard 약화
- 운영 DB·실데이터 수정
- OPS/FB 레지스트리 DB화
- Answer Assistant gate 확대

## PR131 진입 (PR130)

**조건부 가능** — [PR-130-PR131-ENTRY-GATE.md](./PR-130-PR131-ENTRY-GATE.md). 이번 PR은 **링크 허브·UI·기존 admin probe** 수준으로 제한.

## 관련 문서

- [PR-131-DASHBOARD-STRUCTURE-ANALYSIS.md](./PR-131-DASHBOARD-STRUCTURE-ANALYSIS.md)
- [PR-131-DASHBOARD-ROLE-MATRIX.md](./PR-131-DASHBOARD-ROLE-MATRIX.md)
- [PR-131-IMPLEMENTATION-PLAN.md](./PR-131-IMPLEMENTATION-PLAN.md)
- [PR-130-PR131-ENTRY-GATE.md](./PR-130-PR131-ENTRY-GATE.md)

## Codex 제한검수

- **기본 생략** — guard·Auth·schema 미변경, admin 집계는 기존 `probeCorrectionRequestTable` / `probePlannerVerificationTable` 재사용.
- **후보**: production admin 스냅샷이 공개 API로 노출되는 회귀가 발견될 때.
