# PR-144 — 구조 분석

| 영역 | 결과 |
| --- | --- |
| landing route | `/` — `app/page.tsx` + `HomeClient` |
| 공개 업무 화면 | `/directory`, `/claim-documents`, `/knowledge`, `/search`, `/work-tools` |
| 네비게이션 | `AppShell` Header |
| CTA | `HomeQuickLaunchCard` — 탐색·열기 라벨 |
| 책임 고지 | hero note, safety `<details>`, footer |
| public visibility | `lib/public/*`, PR-131 copy |
| Auth/RBAC | admin `/admin` 분리 |
| Answer Assistant | `/planner/answer-assistant` + allowlist |
| 베타/결제 폼 | **없음** |

## 정보 부족

- 실제 제한 베타 외부 URL·도메인 공개 일정
- 법무 확정 랜딩 고지 문구 (PR142-B)
