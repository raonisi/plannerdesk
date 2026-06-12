# PR-BS-16 PWA Install Guide UX

## 1. 목적

PR-BS-07 안내형 홈화면 추가 UX 위에, **public/planner variant copy·compact 사이드 안내·권한·PII 경계**를 PR-BS-16 기준으로 보강한다. service worker·manifest·push는 포함하지 않는다.

선행: [PR-BS-07 PWA Install UX Review](./PR-BS-07-PWA-INSTALL-UX-REVIEW.md)

## 2. 범위

| 포함 | 제외 |
| --- | --- |
| `HomeScreenInstallNotice` / `HomeScreenInstallGuide` copy·compact | service worker |
| public home 하단 + planner 사이드 compact | offline cache |
| 권한·PII·Work Tools/AA 경계 문구 | push notification |
| 테스트·본 문서 | manifest·icon asset |

## 3. UI 위치

| 영역 | 구현 |
| --- | --- |
| public home | 하단 `HomeScreenInstallNotice` (variant=public) |
| planner dashboard | 사이드 compact + 하단 full (variant=planner) |
| work-tools | 기존 BS-07 planner notice 유지 |

## 4. 테스트

- `tests/public/pwa-install-guide-copy.test.ts`
- `tests/ops/pwa-install-guide-boundary.test.ts`
- 기존 `pwa-copy-safety.test.ts`, `pwa-install-ux.test.ts` 유지

## 5. 후속

- PR-BS-07-B: manifest + icon asset
- PR-BS-07-C: service worker (Codex 제한검수 필수)

## 6. 최종 결론

PR-BS-16은 **홈화면 추가 안내 UX를 public/planner 경계에 맞게 정교화**한다. PWA shell 구현은 후속 PR로 분리한다.
