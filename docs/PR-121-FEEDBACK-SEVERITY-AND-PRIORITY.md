# PR-121 — 심각도 · 우선순위

---

## 심각도

| 등급 | 기준 | 처리 원칙 |
| --- | --- | --- |
| **Critical** | public 노출, 권한 우회, secret 의심, 운영 데이터 손상 가능 | **즉시 중단/보류** — 일반 backlog 금지 |
| **High** | 핵심 업무 불가, admin 오류, **잘못된 청구정보**로 실무 피해 | **빠른 PR 분리** — 48h 내 분류 목표 |
| **Medium** | 사용성 저하, 검색·화면 혼란 | 운영 개선 PR (PR122+) |
| **Low** | 문구, 여백, 가독성 | 운영 후 backlog |

---

## 우선순위 (PR 작업 순)

| 우선순위 | 조건 | SLA (권장) |
| ---: | --- | --- |
| **P0** | Critical | 즉시 에스컬레이션 |
| **P1** | High + 재현 가능 | 다음 운영 PR 슬롯 |
| **P2** | High + 정보 부족 | 재현 확보 후 P1 |
| **P3** | Medium | 스프린트 백로그 |
| **P4** | Low | PR-120-POST-LAUNCH-BACKLOG |

**Critical/High는 P3 이하로만 내리지 않는다** (보류·완료 제외).

---

## 유형 × 심각도 힌트

| 유형 | 기본 심각도 상한 |
| --- | --- |
| 권한 문제 | Critical~High |
| 데이터 오류 (팩스·청구) | High~Critical |
| 오류 (핵심 route) | High |
| 문구 / Low UX | Low~Medium |
| 기능 요청 | Low (별도 roadmap) |
