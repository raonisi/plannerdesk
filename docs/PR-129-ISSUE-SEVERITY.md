# PR-129 — 운영 이슈 심각도 기준

| 등급 | 기준 | 처리 원칙 |
| --- | --- | --- |
| **Critical** | 권한 우회, 미검수/비공개 public 노출, secret 노출, 운영 DB 위험, 민감정보 저장·유출 위험 | **즉시 중단** · rollback 검토 · 전용 긴급 PR |
| **High** | 핵심 route 오류, 관리자 기능 오류, **잘못된 청구정보**로 실무 오류 가능, AA safety 위험 | **빠른 PR 분리** · beta/배포 확대 보류 |
| **Medium** | 검색 불편, 데이터 일부 누락, 링크 확인 필요, 화면 흐름 불편 | 운영 개선 PR (PR122~128) |
| **Low** | 문구·여백·소규모 UI·단순 오탈자 | backlog · PR127 등 |

---

## 에스컬레이션 (Critical/High)

| 조건 | 필수 조치 |
| --- | --- |
| Critical | 상태 **긴급**, 담당 즉시 지정, 일반 backlog **금지** |
| High | 48h 내 PR 방향 확정, P1 슬롯 |
| 정보 부족 | 심각도 **하향 단정 금지** — 보류 또는 High 유지 |

---

## 유형별 심각도 하한

| 유형 | 하한 |
| --- | --- |
| public visibility | **Critical** (노출 확인 시) |
| 보안/secret | **Critical** |
| 권한 문제 | **High** 이상 |
| Admin bulk 실수 가능 | **High** |
| Answer Assistant safety | **High** 이상 |
| 데이터 오류 (팩스·청구) | **High** 가능 |
| 문구·여백 | Low~Medium |

**Critical/High는 P3 이하 backlog만으로 종료하지 않는다** ([PR-121-FEEDBACK-SEVERITY-AND-PRIORITY.md](./PR-121-FEEDBACK-SEVERITY-AND-PRIORITY.md) P0~P2 정렬).
