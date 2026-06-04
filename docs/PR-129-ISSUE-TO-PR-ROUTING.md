# PR-129 — 운영 이슈 → 후속 PR 연결 기준

**번호는 예시** — 실제 PR은 범위에 맞게 조정.

---

## 라우팅 표

| 이슈 유형 | 연결 PR 또는 처리 방향 |
| --- | --- |
| 사용자 피드백 수집 구조 | PR121 (`FB-*`) |
| 운영 이슈 리포팅 구조 | **PR129** (`OPS-*`) |
| 월간 운영 리포트 | **PR130** (예정) |
| 데이터 최신성 점검 | PR122 |
| 관리자 운영 기준 | PR123 |
| 보험사/청구서류 데이터 수정 | PR124 또는 별도 데이터 PR |
| 지식 아카이브 콘텐츠 품질 | PR125 |
| Answer Assistant 안전·베타 | PR126 또는 AI safety PR |
| 검색·탐색 UX | PR127 |
| 업무 링크/전산 바로가기 | PR128 |
| 배포·smoke·launch 게이트 | PR119 / PR120 / PR114~117 |
| 권한/Auth/RBAC | 별도 **High-risk** PR |
| DB/Migration | 별도 **High-risk** PR |
| public visibility | **긴급 PR** 또는 배포 보류 |
| secret/env 노출 | **즉시 중단** (비밀 rotation 등 운영 조치) |
| 기능 요청·자동화 | PR-120-POST-LAUNCH-BACKLOG |

---

## Critical/High 전용 (backlog 금지)

| 유형 | 처리 |
| --- | --- |
| public visibility | 배포 중단 검토 + 긴급 수정 PR |
| 보안/secret | 즉시 중단 · secret 폐기·재발급 (코드 PR 병행) |
| 권한 우회 의심 | Auth PR · smoke 재실행 |
| AA safety (output/allowlist) | PR126 관찰 + AI PR, beta 확대 금지 |

---

## PR121 ↔ PR129

| FB 심각도 | OPS |
| --- | --- |
| Low~Medium, 문구/UX | FB만 유지 가능 |
| High+ 또는 장애·데이터·권한 | **OPS-* 생성**, FB-ID 비고 |

---

## 즉시 반영 vs 별도 PR

| 즉시 반영 (문서·문구) | 별도 PR 필수 |
| --- | --- |
| Registry·체크리스트 한 줄 | schema/migration |
| 운영 매뉴얼 보완 | Auth/RBAC 변경 |
| | visibility guard 변경 |
| | allowlist·bulk **실행** |
| | 운영 DB 대량 수정 |
